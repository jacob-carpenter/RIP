from config import extractor_metadata_sql_database_config
import pyodbc
import time
import datetime
from dateutil.parser import *


class ExtractorMetadataDataAccess:

    def clean(self):
        cnxn = pyodbc.connect(extractor_metadata_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                        if exists (select * from sysobjects where name='ExtractorDetails' and xtype='U')
                        BEGIN
                            DROP TABLE ExtractorDetails;
                        END
                        
                        if exists (select * from sysobjects where name='ExtractorRun' and xtype='U')
                        BEGIN
                            DROP TABLE ExtractorRun;
                        END
                        
                        if exists (select * from sysobjects where name='Extractor' and xtype='U')
                        BEGIN
                            DROP TABLE Extractor;
                        END
                       ''')

        cnxn.commit()

    def migrate(self, clean=0):
        if clean:
            self.clean()

        cnxn = pyodbc.connect(extractor_metadata_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''

                        if not exists (select * from sysobjects where name='Extractor' and xtype='U')
                        BEGIN
                            CREATE TABLE Extractor
                            (
                                Id bigint identity(1, 1) Primary Key,
                                Name nvarchar(100),
                                Context nvarchar(255)
                            );

                            CREATE UNIQUE NONCLUSTERED INDEX Extractor_Name_Context_Index ON Extractor (Name, Context);
                        END;

                        if not exists (select * from sysobjects where name='ExtractorRun' and xtype='U')
                        BEGIN
                            CREATE TABLE ExtractorRun
                            (
                                Id bigint identity(1, 1) Primary Key,
                                ExtractorId bigint,
                                APICost int,
                                StartRunDateTimeOffset DateTimeOffset,
                                EndRunDateTimeOffset DateTimeOffset,
                                FOREIGN KEY (ExtractorId) REFERENCES Extractor(Id)
                            );
                            CREATE NONCLUSTERED INDEX ExtractorRun_ExtractorId_Index ON ExtractorRun (ExtractorId);
                        END;

                        if not exists (select * from sysobjects where name='ExtractorDetails' and xtype='U')
                        BEGIN
                            CREATE TABLE ExtractorDetails
                            (
                                Id bigint identity(1, 1) Primary Key,
                                ExtractorId bigint,
                                ExtractorRunId bigint,
                                Details nvarchar(512),
                                FOREIGN KEY (ExtractorId) REFERENCES Extractor(Id),
                                FOREIGN KEY (ExtractorRunId) REFERENCES ExtractorRun(Id)
                            );
                            CREATE NONCLUSTERED INDEX ExtractorDetails_ExtractorId_Index ON ExtractorDetails (ExtractorId);
                            CREATE NONCLUSTERED INDEX ExtractorDetails_ExtractorRunId_Index ON ExtractorDetails (ExtractorRunId);
                        END;

                        ''')

        cnxn.commit()

    def register_run(self, extractor_name, extractor_context, cost, details, start_datetime, end_datetime):
        cnxn = pyodbc.connect(extractor_metadata_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                DECLARE @extractor_name nvarchar(100) = ?;
                DECLARE @extractor_context nvarchar(255) = ?;
                DECLARE @extractor_cost int = ?;
                DECLARE @extractor_details nvarchar(512) = ?;
                DECLARE @start_datetimeoffset DateTimeOffset = ?;
                DECLARE @end_datetimeoffset DateTimeOffset = ?;
                
                
                DECLARE @extractor_id bigint = -1;
                
                SELECT @extractor_id = Id 
                    FROM Extractor WHERE Name = @extractor_name AND (Context = @extractor_context OR @extractor_context IS NULL);
                
                IF @extractor_id = -1
                BEGIN
                    INSERT INTO Extractor (Name, Context) Values (@extractor_name, @extractor_context);
                    
                    SET @extractor_id = SCOPE_IDENTITY();
                END 
                
                DECLARE @extractor_run_id bigint = -1;
                SELECT @extractor_run_id = Id 
                    FROM ExtractorRun WHERE ExtractorId = @extractor_id AND StartRunDateTimeOffset = @start_datetimeoffset;
                
                IF @extractor_run_id != -1
                BEGIN
                    UPDATE ExtractorRun
                        SET
                            EndRunDateTimeOffset = @end_datetimeoffset,
                            APICost = @extractor_cost
                    WHERE Id = @extractor_run_id;
                    
                    
                    UPDATE ExtractorDetails
                        SET
                            Details = @extractor_details
                    WHERE ExtractorId = @extractor_id AND ExtractorRunId = @extractor_run_id;
                END
                ELSE
                BEGIN 
                    INSERT INTO ExtractorRun (ExtractorId, ApiCost, StartRunDateTimeOffset, EndRunDateTimeOffset)
                    VALUES (@extractor_id, @extractor_cost, @start_datetimeoffset, @end_datetimeoffset);
                    
                    SET @extractor_run_id = SCOPE_IDENTITY();
                    
                    IF @extractor_details IS NOT NULL
                    BEGIN
                        INSERT INTO ExtractorDetails (ExtractorId, ExtractorRunId, Details)
                        VALUES (@extractor_id, @extractor_run_id, @extractor_details);
                    END
                END
                
            ''',
            extractor_name,
            extractor_context,
            cost,
            details,
            start_datetime,
            end_datetime
        )

        cnxn.commit()

    def get_last_run_time(self, extractor_name, extractor_context, details):
        cnxn = pyodbc.connect(extractor_metadata_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        date_string = cursor.execute('''
                    DECLARE @extractor_name nvarchar(100) = ?;
                    DECLARE @extractor_context nvarchar(255) = ?;
                    DECLARE @extractor_details nvarchar(512) = ?;

                    IF @extractor_details is null
                    BEGIN
                        SELECT max(StartRunDateTimeOffset)
                            FROM Extractor
                            INNER JOIN ExtractorRun ON ExtractorId = Extractor.Id
                            WHERE Name = @extractor_name AND (Context = @extractor_context OR @extractor_context IS NULL) AND EndRunDateTimeOffset is not null;
                    END
                    ELSE
                    BEGIN
                        SELECT max(StartRunDateTimeOffset)
                            FROM Extractor
                            INNER JOIN ExtractorRun ON ExtractorId = Extractor.Id
                            INNER JOIN ExtractorDetails ON ExtractorRunId = ExtractorRun.Id AND Details = @extractor_details
                            WHERE Name = @extractor_name AND (Context = @extractor_context OR @extractor_context IS NULL) AND EndRunDateTimeOffset is not null;
                    END
                ''', extractor_name, extractor_context, details).fetchone()[0]

        if date_string:
            return parse(date_string)

    def get_total_run_cost(self, extractor_name, extractor_context, start_datetime, end_datetime):
        cnxn = pyodbc.connect(extractor_metadata_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        return cursor.execute('''
            DECLARE @extractor_name nvarchar(100) = ?;
            DECLARE @extractor_context nvarchar(255) = ?;
            DECLARE @start_datetimeoffset DateTimeOffset = ?;
            DECLARE @end_datetimeoffset DateTimeOffset = ?;
            
            SELECT sum(APICost) AS RunCostTotal
                FROM ExtractorRun
                INNER JOIN Extractor ON Name = @extractor_name AND Context = @extractor_context
                WHERE StartRunDateTimeOffset between @start_datetimeoffset and @end_datetimeoffset;
            
        ''', extractor_name, extractor_context, start_datetime, end_datetime).fetchval()

    def get_total_runs(self, extractor_name, extractor_context, start_datetime, end_datetime):
        cnxn = pyodbc.connect(extractor_metadata_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        return cursor.execute('''
            DECLARE @extractor_name nvarchar(100) = ?;
            DECLARE @extractor_context nvarchar(255) = ?;
            DECLARE @start_datetimeoffset DateTimeOffset = ?;
            DECLARE @end_datetimeoffset DateTimeOffset = ?;

            SELECT count(*) AS RunTotal
                FROM ExtractorRun
                INNER JOIN Extractor ON Name = @extractor_name AND Context = @extractor_context
                WHERE StartRunDateTimeOffset between @start_datetimeoffset and @end_datetimeoffset;

        ''', extractor_name, extractor_context, start_datetime, end_datetime).fetchval()
