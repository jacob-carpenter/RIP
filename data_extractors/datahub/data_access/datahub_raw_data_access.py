from config import raw_market_sql_database_config
import pyodbc

import datetime


class DatahubRawDataAccess:

    def clean(self):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                        if exists (select * from sysobjects where name='Datahub_NasdaqListing' and xtype='U')
                        BEGIN
                            DROP TABLE Datahub_NasdaqListing;
                        END
                        
                        if exists (select * from sysobjects where name='Datahub_NyseListing' and xtype='U')
                        BEGIN
                            DROP TABLE Datahub_NyseListing;
                        END

                        if exists (select * from sysobjects where name='Datahub_NyseListedSymbols' and xtype='U')
                        BEGIN
                            DROP TABLE Datahub_NyseListedSymbols;
                        END

                        if exists (select * from sysobjects where name='Datahub_NasdaqListedSymbols' and xtype='U')
                        BEGIN
                            DROP TABLE Datahub_NasdaqListedSymbols;
                        END
                       ''')

        cnxn.commit()

    def migrate(self, clean=0):
        if clean:
            self.clean()

        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''

                        if not exists (select * from sysobjects where name='Datahub_NasdaqListedSymbols' and xtype='U')
                        BEGIN
                            CREATE TABLE Datahub_NasdaqListedSymbols
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                Symbol nvarchar(30),
                                CompanyName nvarchar(512)
                            );

                            CREATE UNIQUE NONCLUSTERED INDEX Datahub_NasdaqListedSymbols_Symbol_Index ON Datahub_NasdaqListedSymbols (Symbol);
                        END;

                        if not exists (select * from sysobjects where name='Datahub_NasdaqListing' and xtype='U')
                        BEGIN
                            CREATE TABLE Datahub_NasdaqListing
                            (
                                Id bigint identity(1, 1) Primary Key,
                                Datahub_NasdaqListedSymbols_Id bigint,
                                SecurityName nvarchar(512),
                                MarketCategory nvarchar(30),
                                TestIssue nvarchar(30),
                                FinancialStatus nvarchar(30),
                                RoundLotSize nvarchar(30),
                                FOREIGN KEY (Datahub_NasdaqListedSymbols_Id) REFERENCES Datahub_NasdaqListedSymbols(Id)
                            );
                        END;
                        
                        
                        if not exists (select * from sysobjects where name='Datahub_NyseListedSymbols' and xtype='U')
                        BEGIN
                            CREATE TABLE Datahub_NyseListedSymbols
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                Symbol nvarchar(30),
                                CompanyName nvarchar(512)
                            );

                            CREATE UNIQUE NONCLUSTERED INDEX Datahub_NyseListedSymbols_Symbol_Index ON Datahub_NyseListedSymbols (Symbol);
                        END;

                        if not exists (select * from sysobjects where name='Datahub_NyseListing' and xtype='U')
                        BEGIN
                            CREATE TABLE Datahub_NyseListing
                            (
                                Id bigint identity(1, 1) Primary Key,
                                Datahub_NasdaqListedSymbols_Id bigint,
                                Datahub_NyseListedSymbols_Id bigint,
                                SecurityName nvarchar(512),
                                Exchange nvarchar(30),
                                CQSSymbol nvarchar(30),
                                ETF nvarchar(30),
                                RoundLotSize nvarchar(30),
                                TestIssue nvarchar(30),
                                FOREIGN KEY (Datahub_NyseListedSymbols_Id) REFERENCES Datahub_NyseListedSymbols(Id),
                                FOREIGN KEY (Datahub_NasdaqListedSymbols_Id) REFERENCES Datahub_NasdaqListedSymbols(Id)
                            );
                        END;

                        ''')

        cnxn.commit()

    def persist_nasdaq_listings(self, listings):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        for listing in listings:
            cursor.execute('''
                DECLARE @symbol nvarchar(30) = ?;
                DECLARE @company_name nvarchar(512) = ?;
                DECLARE @security_name nvarchar(512) = ?;
                DECLARE @market_category nvarchar(30) = ?;
                DECLARE @test_issue nvarchar(30) = ?;
                DECLARE @financial_status nvarchar(30) = ?;
                DECLARE @round_lot_size nvarchar(30) = ?;
                
                DECLARE @symbol_id bigint = -1;
                SELECT @symbol_id = Id 
                    FROM Datahub_NasdaqListedSymbols WHERE Symbol = @symbol;
                IF @symbol_id = -1
                BEGIN
                    INSERT INTO Datahub_NasdaqListedSymbols (Symbol, CompanyName) Values (@symbol, @company_name);
                    
                    SET @symbol_id = SCOPE_IDENTITY();
                END 
                
                DECLARE @listing_id bigint = -1;
                SELECT @listing_id = Id 
                    FROM Datahub_NasdaqListing WHERE Datahub_NasdaqListedSymbols_Id = @symbol_id;
                IF @listing_id = -1
                BEGIN
                    INSERT INTO Datahub_NasdaqListing (Datahub_NasdaqListedSymbols_Id, SecurityName, MarketCategory, TestIssue, FinancialStatus, RoundLotSize) 
                    Values (@symbol_id, @security_name, @market_category, @test_issue, @financial_status, @round_lot_size);
                END 
            ''',
                           listing['Symbol'],
                           listing['Company Name'],
                           listing['Security Name'],
                           listing['Market Category'],
                           listing['Test Issue'],
                           listing['Financial Status'],
                           listing['Round Lot Size']
            )

        cnxn.commit()

    def persist_nyse_listings(self, listings):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        for listing in listings:
            cursor.execute('''
                DECLARE @symbol nvarchar(30) = ?;
                DECLARE @company_name nvarchar(512) = ?;
                DECLARE @security_name nvarchar(512) = ?;
                DECLARE @exchange nvarchar(30) = ?;
                DECLARE @cqs_symbol nvarchar(30) = ?;
                DECLARE @etf nvarchar(30) = ?;
                DECLARE @nasdaq_symbol nvarchar(30) = ?;
                DECLARE @test_issue nvarchar(30) = ?;
                DECLARE @round_lot_size nvarchar(30) = ?;

                DECLARE @symbol_id bigint = -1;
                SELECT @symbol_id = Id 
                    FROM Datahub_NasdaqListedSymbols WHERE Symbol = @nasdaq_symbol;
                IF @symbol_id = -1
                BEGIN
                    INSERT INTO Datahub_NasdaqListedSymbols (Symbol, CompanyName) Values (@nasdaq_symbol, @company_name);

                    SET @symbol_id = SCOPE_IDENTITY();
                END 

                DECLARE @listing_id bigint = -1;
                SELECT @listing_id = Id 
                    FROM Datahub_NasdaqListing WHERE Datahub_NasdaqListedSymbols_Id = @symbol_id;
                IF @listing_id = -1
                BEGIN
                    INSERT INTO Datahub_NasdaqListing (Datahub_NasdaqListedSymbols_Id, SecurityName, MarketCategory, TestIssue, FinancialStatus, RoundLotSize) 
                    Values (@symbol_id, @security_name, null, @test_issue, null, @round_lot_size);
                END 
                
                DECLARE @nyse_symbol_id bigint = -1;
                SELECT @nyse_symbol_id = Id 
                    FROM Datahub_NyseListedSymbols WHERE Symbol = @symbol;
                IF @nyse_symbol_id = -1
                BEGIN
                    INSERT INTO Datahub_NyseListedSymbols (Symbol, CompanyName) Values (@symbol, @company_name);

                    SET @nyse_symbol_id = SCOPE_IDENTITY();
                END 

                DECLARE @nyse_listing_id bigint = -1;
                SELECT @nyse_listing_id = Id 
                    FROM Datahub_NyseListing WHERE Datahub_NyseListedSymbols_Id = @nyse_symbol_id;
                IF @nyse_listing_id = -1
                BEGIN
                    INSERT INTO Datahub_NyseListing (Datahub_NasdaqListedSymbols_Id, Datahub_NyseListedSymbols_Id, SecurityName, Exchange, CQSSymbol, ETF, RoundLotSize, TestIssue) 
                    Values (@symbol_id, @nyse_symbol_id, @security_name, @exchange, @cqs_symbol, @etf, @round_lot_size, @test_issue);
                END 
            ''',
                           listing['ACT Symbol'],
                           listing['Company Name'],
                           listing['Security Name'],
                           listing['Exchange'],
                           listing['CQS Symbol'],
                           listing['ETF'],
                           listing['NASDAQ Symbol'],
                           listing['Test Issue'],
                           listing['Round Lot Size']
                           )

        cnxn.commit()