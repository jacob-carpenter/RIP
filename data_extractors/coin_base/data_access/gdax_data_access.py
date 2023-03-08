from config import raw_market_sql_database_config
import pyodbc

from coin_market_cap.api.coin_market_cap_listings_latest_data_access import Listing, PriceQuote
import datetime


class GDAXDataAccess:

    def clean(self):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                        
                        if exists (select * from sysobjects where name='GDAX_Price' and xtype='U')
                        BEGIN
                            DROP TABLE GDAX_Price;
                        END

                        if exists (select * from sysobjects where name='GDAX_Price_Pull_History' and xtype='U')
                        BEGIN
                            DROP TABLE GDAX_Price_Pull_History;
                        END
                        
                        if exists (select * from sysobjects where name='GDAX_Pair' and xtype='U')
                        BEGIN
                            DROP TABLE GDAX_Pair;
                        END
                        
                        if exists (select * from sysobjects where name='GDAX_Currency' and xtype='U')
                        BEGIN
                            DROP TABLE GDAX_Currency;
                        END
                       ''')

        cnxn.commit()

    def migrate(self, clean=0):
        if clean:
            self.clean()

        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                        
                        if not exists (select * from sysobjects where name='GDAX_Currency' and xtype='U')
                        BEGIN
                            CREATE TABLE GDAX_Currency
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                Symbol nvarchar(30)
                            );
                            CREATE UNIQUE NONCLUSTERED INDEX GDAX_Currency_Symbol_Index ON GDAX_Currency (Symbol);
                        END;

                        if not exists (select * from sysobjects where name='GDAX_Pair' and xtype='U')
                        BEGIN
                            CREATE TABLE GDAX_Pair
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                Pair nvarchar(50),
                                DisplayName nvarchar(50),
                                Base_GDAX_Currency_Id bigint,
                                Target_GDAX_Currency_Id bigint,
                                Status nvarchar(50),
                                FOREIGN KEY (Base_GDAX_Currency_Id) REFERENCES GDAX_Currency(Id),
                                FOREIGN KEY (Target_GDAX_Currency_Id) REFERENCES GDAX_Currency(Id)
                            );
                            CREATE UNIQUE NONCLUSTERED INDEX GDAX_Pair_Index ON GDAX_Pair (Pair);
                        END;

                        if not exists (select * from sysobjects where name='GDAX_Price_Pull_History' and xtype='U')
                        BEGIN
                            CREATE TABLE GDAX_Price_Pull_History
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                GDAX_Pair_Id bigint,
                                Timespan nvarchar(30),
                                PullStartDate date,
                                PullEndDate date,
                                FOREIGN KEY (GDAX_Pair_Id) REFERENCES GDAX_Pair(Id)
                            );
                            CREATE NONCLUSTERED INDEX GDAX_Price_Pull_History_GDAX_Pair_Id_Index ON GDAX_Price_Pull_History (GDAX_Pair_Id);
                        END;
                        
                        if not exists (select * from sysobjects where name='GDAX_Price' and xtype='U')
                        BEGIN
                            CREATE TABLE GDAX_Price
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                GDAX_Pair_Id bigint,
                                Timespan nvarchar(30),
                                ValuationDate datetimeoffset,
                                OpenPrice float,
                                HighPrice float,
                                LowPrice float,
                                ClosePrice float,
                                Volume float,
                                FOREIGN KEY (GDAX_Pair_Id) REFERENCES GDAX_Pair(Id)
                            );
                            
                            CREATE NONCLUSTERED INDEX GDAX_Price_GDAX_Pair_Id_Index ON GDAX_Price (GDAX_Pair_Id);
                            CREATE CLUSTERED INDEX GDAX_Price_GDAX_Pair_Id_Timespan_ValuationDate_Index ON GDAX_Price (GDAX_Pair_Id, Timespan, ValuationDate);
                        END;

                        ''')

        cnxn.commit()

    def persist_pairs(self, pairs):

        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        for pair in pairs:
            cursor.execute('''
                        DECLARE @pair nvarchar(50) = ?;
                        DECLARE @display_name nvarchar(50) = ?;
                        DECLARE @base_currency_symbol nvarchar(30) = ?;
                        DECLARE @target_currency_symbol nvarchar(30) = ?;
                        DECLARE @status nvarchar(50) = ?;

                        DECLARE @base_currency_id bigint = -1;
                        SELECT @base_currency_id = Id 
                            FROM GDAX_Currency WHERE Symbol like upper(@base_currency_symbol);
                        IF @base_currency_id = -1
                        BEGIN
                            INSERT INTO GDAX_Currency (Symbol) Values (upper(@base_currency_symbol));

                            SET @base_currency_id = SCOPE_IDENTITY();
                        END 

                        DECLARE @target_currency_id bigint = -1;
                        SELECT @target_currency_id = Id 
                            FROM GDAX_Currency WHERE Symbol like upper(@target_currency_symbol);
                        IF @target_currency_id = -1
                        BEGIN
                            INSERT INTO GDAX_Currency (Symbol) Values (upper(@target_currency_symbol));

                            SET @target_currency_id = SCOPE_IDENTITY();
                        END 

                        DECLARE @pair_id bigint = -1;
                        SELECT @pair_id = Id 
                            FROM GDAX_Pair WHERE Pair like upper(@pair);
                        IF @pair_id = -1
                        BEGIN
                            INSERT INTO GDAX_Pair (Pair, DisplayName, Base_GDAX_Currency_Id, Target_GDAX_Currency_Id, Status) 
                            Values (upper(@pair), @display_name, @base_currency_id, @target_currency_id, @status);
                        END 
                    ''',
                           pair['id'],
                           pair['display_name'],
                           pair['base_currency'],
                           pair['quote_currency'],
                           pair['status']
                           )

        cnxn.commit()

    def get_gdax_price_pull_history(self, timespan):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        pair_rows = cursor.execute('''
                                    DECLARE @timespan nvarchar(30) = ?;
                            
                                    SELECT GP.Pair, MIN(GPPH.PullStartDate) AS PullStartDate, MAX(GPPH.PullEndDate) AS PullEndDate
                                        FROM GDAX_Pair GP
                                        LEFT JOIN GDAX_Price_Pull_History GPPH ON GPPH.GDAX_Pair_Id = GP.Id AND GPPH.Timespan = @timespan
                                        GROUP BY GP.Pair;
                                ''', timespan).fetchall()
        pairs = []

        for pair_row in pair_rows:
            start_date = None
            if pair_row[1]:
                start_date = datetime.datetime.strptime(pair_row[1], "%Y-%m-%d").date()
            end_date = None
            if pair_row[1]:
                end_date = datetime.datetime.strptime(pair_row[2], "%Y-%m-%d").date()
            pairs.append(dict(pair=pair_row[0], start_date=start_date, end_date=end_date))

        return pairs

    def persist_pair_price_pull_history(self, pair, timespan, start_date, end_date):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                            DECLARE @pair nvarchar(50) = ?;
                            DECLARE @timespan nvarchar(30) = ?;
                            DECLARE @start_date date = ?;
                            DECLARE @end_date date = ?;

                            DECLARE @pair_id bigint = -1;
                            SELECT @pair_id = Id 
                                FROM GDAX_Pair WHERE Pair like upper(@pair);
                            IF @pair_id != -1
                            BEGIN
                                INSERT INTO GDAX_Price_Pull_History(
                                    GDAX_Pair_Id, 
                                    Timespan,
                                    PullStartDate, 
                                    PullEndDate
                                    ) Values (@pair_id, @timespan, @start_date, @end_date);
                            END 
                        ''',
               pair,
               timespan,
               str(start_date),
               str(end_date)
        )

        cnxn.commit()

    def persist_pair_price_results(self, pair, timespan, results):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        for index, row in results.iterrows():
            cursor.execute('''
                            DECLARE @pair nvarchar(50) = ?;
                            DECLARE @timespan nvarchar(30) = ?;
                            DECLARE @date datetimeoffset = ?;
                            DECLARE @open float = ?;
                            DECLARE @high float = ?;
                            DECLARE @low float = ?;
                            DECLARE @close float = ?;
                            DECLARE @volume float = ?;

                            DECLARE @pair_id bigint = -1;
                            SELECT @pair_id = Id 
                                FROM GDAX_Pair WHERE Pair like upper(@pair);
                            IF @pair_id != -1
                            BEGIN
                                IF NOT EXISTS(SELECT * FROM GDAX_Price WHERE GDAX_Pair_Id = @pair_id AND Timespan = @timespan AND  ValuationDate = @date)
                                BEGIN
                                    INSERT INTO GDAX_Price(
                                        GDAX_Pair_Id, 
                                        Timespan,
                                        ValuationDate, 
                                        OpenPrice,
                                        HighPrice,
                                        LowPrice,
                                        ClosePrice,
                                        Volume
                                        ) Values (@pair_id, @timespan, @date, @open, @high, @low, @close, @volume);
                                END
                            END 
                        ''',
                           pair, timespan, index, row.Open, row.High, row.Low, row.Close, row.Volume)

        cnxn.commit()
