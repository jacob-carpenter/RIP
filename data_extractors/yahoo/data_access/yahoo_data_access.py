from config import raw_market_sql_database_config
import pyodbc

from coin_market_cap.api.coin_market_cap_listings_latest_data_access import Listing, PriceQuote
import datetime


class YahooDataAccess:

    def clean(self):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                        if exists (select * from sysobjects where name='Yahoo_Daily_Price' and xtype='U')
                        BEGIN
                            DROP TABLE Yahoo_Daily_Price;
                        END

                        if exists (select * from sysobjects where name='Yahoo_Daily_Price_Pull_History' and xtype='U')
                        BEGIN
                            DROP TABLE Yahoo_Daily_Price_Pull_History;
                        END
                       ''')

        cnxn.commit()

    def migrate(self, clean=0):
        if clean:
            self.clean()

        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''

                        if not exists (select * from sysobjects where name='Yahoo_Daily_Price_Pull_History' and xtype='U')
                        BEGIN
                            CREATE TABLE Yahoo_Daily_Price_Pull_History
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                Datahub_NasdaqListedSymbols_Id bigint,
                                PullStartDate date,
                                PullEndDate date,
                                FOREIGN KEY (Datahub_NasdaqListedSymbols_Id) REFERENCES Datahub_NasdaqListedSymbols(Id)
                            );
                            CREATE NONCLUSTERED INDEX Yahoo_Daily_Price_Pull_History_Datahub_NasdaqListedSymbols_Id_Index ON Yahoo_Daily_Price_Pull_History (Datahub_NasdaqListedSymbols_Id);
                        END;
                        
                        if not exists (select * from sysobjects where name='Yahoo_Daily_Price' and xtype='U')
                        BEGIN
                            CREATE TABLE Yahoo_Daily_Price
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                Datahub_NasdaqListedSymbols_Id bigint,
                                ValuationDate date,
                                OpenPrice float,
                                HighPrice float,
                                LowPrice float,
                                ClosePrice float,
                                Volume float,
                                FOREIGN KEY (Datahub_NasdaqListedSymbols_Id) REFERENCES Datahub_NasdaqListedSymbols(Id)
                            );
                            
                            CREATE NONCLUSTERED INDEX Yahoo_Daily_Price_Datahub_NasdaqListedSymbols_Id_Index ON Yahoo_Daily_Price (Datahub_NasdaqListedSymbols_Id);
                        END;

                        ''')

        cnxn.commit()

    def get_yahoo_daily_price_pull_history(self):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        symbol_rows = cursor.execute('''
                                    SELECT DNLS.Symbol, MIN(YPPH.PullStartDate) AS PullStartDate, MAX(YPPH.PullEndDate) AS PullEndDate
                                        FROM Datahub_NasdaqListedSymbols DNLS
                                        LEFT JOIN Yahoo_Daily_Price_Pull_History YPPH ON YPPH.Datahub_NasdaqListedSymbols_Id = DNLS.Id
                                        GROUP BY DNLS.Symbol;
                                ''').fetchall()
        symbols = []

        for symbol_row in symbol_rows:
            start_date = None
            if symbol_row[1]:
                start_date = datetime.datetime.strptime(symbol_row[1], "%Y-%m-%d").date()
            end_date = None
            if symbol_row[1]:
                end_date = datetime.datetime.strptime(symbol_row[2], "%Y-%m-%d").date()
            symbols.append(dict(symbol=symbol_row[0], start_date=start_date, end_date=end_date))

        return symbols


    def persist_symbol_price_pull_history(self, symbol, start_date, end_date):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                            DECLARE @symbol nvarchar(50) = ?;
                            DECLARE @start_date date = ?;
                            DECLARE @end_date date = ?;

                            DECLARE @symbol_id bigint = -1;
                            SELECT @symbol_id = Id 
                                FROM Datahub_NasdaqListedSymbols WHERE Symbol like upper(@symbol);
                            IF @symbol_id != -1
                            BEGIN
                                INSERT INTO Yahoo_Daily_Price_Pull_History(
                                    Datahub_NasdaqListedSymbols_Id, 
                                    PullStartDate, 
                                    PullEndDate
                                    ) Values (@symbol_id, @start_date, @end_date);
                            END 
                        ''',
               symbol,
               str(start_date),
               str(end_date)
        )

        cnxn.commit()

    def persist_symbol_price_results(self, symbol, results):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        for index, row in results.iterrows():
            cursor.execute('''
                            DECLARE @symbol nvarchar(50) = ?;
                            DECLARE @date date = ?;
                            DECLARE @open float = ?;
                            DECLARE @high float = ?;
                            DECLARE @low float = ?;
                            DECLARE @close float = ?;
                            DECLARE @volume float = ?;

                            DECLARE @symbol_id bigint = -1;
                            SELECT @symbol_id = Id 
                                FROM Datahub_NasdaqListedSymbols WHERE Symbol like upper(@symbol);
                            IF @symbol_id != -1
                            BEGIN
                                INSERT INTO Yahoo_Daily_Price(
                                    Datahub_NasdaqListedSymbols_Id, 
                                    ValuationDate, 
                                    OpenPrice,
                                    HighPrice,
                                    LowPrice,
                                    ClosePrice,
                                    Volume
                                    ) Values (@symbol_id, @date, @open, @high, @low, @close, @volume);
                            END 
                        ''',
                           symbol, index, row.Open, row.High, row.Low, row.Close, row.Volume)

        cnxn.commit()
