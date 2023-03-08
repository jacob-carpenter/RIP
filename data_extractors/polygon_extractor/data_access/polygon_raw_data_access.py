from config import raw_market_sql_database_config
import pyodbc
from typing import List

from polygon.rest.models.definitions import CryptoExchange, Symbol
import datetime

class PolygonRawDataAccess:

    def clean(self):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                        if exists (select * from sysobjects where name='Polygon_Realtime_Quote' and xtype='U')
                        BEGIN
                            DROP TABLE Polygon_Realtime_Quote;
                        END
                        
                        if exists (select * from sysobjects where name='Polygon_Realtime_Aggregate' and xtype='U')
                        BEGIN
                            DROP TABLE Polygon_Realtime_Aggregate;
                        END
                        
                        if exists (select * from sysobjects where name='Polygon_Ticker_Aggregate' and xtype='U')
                        BEGIN
                            DROP TABLE Polygon_Ticker_Aggregate;
                        END
                        
                        if exists (select * from sysobjects where name='Polygon_Ticker_Aggregate_Pull_History' and xtype='U')
                        BEGIN
                            DROP TABLE Polygon_Ticker_Aggregate_Pull_History;
                        END
                        
                        if exists (select * from sysobjects where name='Polygon_Ticker' and xtype='U')
                        BEGIN
                            DROP TABLE Polygon_Ticker;
                        END
                        
                        if exists (select * from sysobjects where name='Polygon_Currency' and xtype='U')
                        BEGIN
                            DROP TABLE Polygon_Currency;
                        END
                        
                        if exists (select * from sysobjects where name='Polygon_Exchange' and xtype='U')
                        BEGIN
                            DROP TABLE Polygon_Exchange;
                        END
                        
                        if exists (select * from sysobjects where name='Polygon_Type' and xtype='U')
                        BEGIN
                            DROP TABLE Polygon_Type;
                        END
                       ''')

        cnxn.commit()

    def migrate(self, clean=0):
        if clean:
            self.clean()

        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                        if not exists (select * from sysobjects where name='Polygon_Type' and xtype='U')
                        BEGIN
                            CREATE TABLE Polygon_Type
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                Type nvarchar(30)
                            );
                            CREATE UNIQUE NONCLUSTERED INDEX Polygon_Type_Index ON Polygon_Type (Type);
                        END;
            
                        if not exists (select * from sysobjects where name='Polygon_Exchange' and xtype='U')
                        BEGIN
                            CREATE TABLE Polygon_Exchange
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                Polygon_Type_Id bigint,
                                SourceId bigint,
                                Name nvarchar(255),
                                Url nvarchar(255),
                                Type nvarchar(255),
                                FOREIGN KEY (Polygon_Type_Id) REFERENCES Polygon_Type(Id)
                            );
                        END;
                        
                        if not exists (select * from sysobjects where name='Polygon_Currency' and xtype='U')
                        BEGIN
                            CREATE TABLE Polygon_Currency
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                Polygon_Type_Id bigint,
                                Name nvarchar(255),
                                Symbol nvarchar(30),
                                FOREIGN KEY (Polygon_Type_Id) REFERENCES Polygon_Type(Id)
                            );
                            CREATE UNIQUE NONCLUSTERED INDEX Polygon_Currency_Symbol_Index ON Polygon_Currency (Symbol);
                        END;
                        
                        if not exists (select * from sysobjects where name='Polygon_Ticker' and xtype='U')
                        BEGIN
                            CREATE TABLE Polygon_Ticker
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                Polygon_Type_Id bigint,
                                Base_Polygon_Currency_Id bigint,
                                Target_Polygon_Currency_Id bigint,
                                Ticker nvarchar(50),
                                Name nvarchar(255),
                                Locale nvarchar(255),
                                Active bit,
                                PrimaryExchange nvarchar(255),
                                UpdatedDate date,
                                Url nvarchar(255),
                                FOREIGN KEY (Polygon_Type_Id) REFERENCES Polygon_Type(Id),
                                FOREIGN KEY (Base_Polygon_Currency_Id) REFERENCES Polygon_Currency(Id),
                                FOREIGN KEY (Target_Polygon_Currency_Id) REFERENCES Polygon_Currency(Id)
                            );
                            CREATE UNIQUE NONCLUSTERED INDEX Polygon_Ticker_Index ON Polygon_Ticker (Ticker);
                            CREATE NONCLUSTERED INDEX Polygon_Ticker_Base_Polygon_Currency_Id_Index ON Polygon_Ticker (Base_Polygon_Currency_Id);
                            CREATE NONCLUSTERED INDEX Polygon_Ticker_Target_Polygon_Currency_Id_Index ON Polygon_Ticker (Target_Polygon_Currency_Id);
                        END;
                        
                        if not exists (select * from sysobjects where name='Polygon_Ticker_Aggregate_Pull_History' and xtype='U')
                        BEGIN
                            CREATE TABLE Polygon_Ticker_Aggregate_Pull_History
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                Polygon_Ticker_Id bigint,
                                Timespan nvarchar(30),
                                PullStartDate date,
                                PullEndDate date,
                                FOREIGN KEY (Polygon_Ticker_Id) REFERENCES Polygon_Ticker(Id),
                            );
                            CREATE NONCLUSTERED INDEX Polygon_Ticker_Aggregate_Pull_History_Polygon_Ticker_Id_Index ON Polygon_Ticker_Aggregate_Pull_History (Polygon_Ticker_Id);
                        END;
                        
                        if not exists (select * from sysobjects where name='Polygon_Ticker_Aggregate' and xtype='U')
                        BEGIN
                            CREATE TABLE Polygon_Ticker_Aggregate
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                Polygon_Ticker_Id bigint,
                                Timespan nvarchar(30),
                                Time datetimeoffset,
                                Volume float,
                                VolumeW float,
                                OpenPrice float,
                                ClosePrice float,
                                HighPrice float,
                                LowPrice float,
                                NumberOfItemsAggregated bigint,
                                FOREIGN KEY (Polygon_Ticker_Id) REFERENCES Polygon_Ticker(Id),
                            );
                            
                            CREATE NONCLUSTERED INDEX Polygon_Ticker_Aggregate_Polygon_Ticker_Id_Index ON Polygon_Ticker_Aggregate (Polygon_Ticker_Id);
                        END;
                        
                        if not exists (select * from sysobjects where name='Polygon_Realtime_Quote' and xtype='U')
                        BEGIN
                            CREATE TABLE Polygon_Realtime_Quote
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                Polygon_Exchange_Id bigint,
                                Polygon_Ticker_Id bigint,
                                ExchangeTimestamp DateTimeOffset,
                                PolygonReceivedTimestamp DateTimeOffset,
                                LastTradePrice float,
                                LastTradeSize float,
                                BidPrice float,
                                BidSize float,
                                AskPrice float,
                                AskSize float,
                                FOREIGN KEY (Polygon_Ticker_Id) REFERENCES Polygon_Ticker(Id),
                                FOREIGN KEY (Polygon_Exchange_Id) REFERENCES Polygon_Exchange(Id)
                            );
                            
                            CREATE NONCLUSTERED INDEX Polygon_Realtime_Quote_Polygon_Ticker_Id_Index ON Polygon_Realtime_Quote (Polygon_Ticker_Id);
                            CREATE NONCLUSTERED INDEX Polygon_Realtime_Quote_Polygon_Exchange_Id_Index ON Polygon_Realtime_Quote (Polygon_Exchange_Id);
                        END;
                        
                        if not exists (select * from sysobjects where name='Polygon_Realtime_Aggregate' and xtype='U')
                        BEGIN
                            CREATE TABLE Polygon_Realtime_Aggregate
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                Polygon_Ticker_Id bigint,
                                TickStartTimestamp DateTimeOffset,
                                TickEndTimestamp DateTimeOffset,
                                OpenPrice float,
                                HighPrice float,
                                LowPrice float,
                                ClosePrice float,
                                Volume float,
                                FOREIGN KEY (Polygon_Ticker_Id) REFERENCES Polygon_Ticker(Id)
                            );
                            
                            CREATE NONCLUSTERED INDEX Polygon_Realtime_Aggregate_Polygon_Ticker_Id_Index ON Polygon_Realtime_Aggregate (Polygon_Ticker_Id);
                        END;

                        ''')

        cnxn.commit()

    def persist_exchanges(self, exchanges: List[CryptoExchange]):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        for exchange in exchanges:
            cursor.execute('''
                        DECLARE @source_id bigint = ?;
                        DECLARE @name nvarchar(255) = ?;
                        DECLARE @url nvarchar(255) = ?;
                        DECLARE @type nvarchar(255) = ?;
                        DECLARE @market nvarchar(30) = ?;
                        
                        DECLARE @type_id bigint = -1;
                        SELECT @type_id = Id 
                            FROM Polygon_Type WHERE Type like upper(@market);
                        IF @type_id = -1
                        BEGIN
                            INSERT INTO Polygon_Type (Type) Values (upper(@market));
                            SET @type_id = SCOPE_IDENTITY();
                        END 

                        DECLARE @exchange_id bigint = -1;
                        SELECT @exchange_id = Id 
                            FROM Polygon_Exchange WHERE SourceId like @source_id;
                        IF @exchange_id = -1
                        BEGIN
                            INSERT INTO Polygon_Exchange (Polygon_Type_Id, SourceId, Name, Url, Type) Values (@type_id, @source_id, @name, @url, @type);
                        END 
                    ''',
                exchange.i_d_of_the_exchange,
                exchange.name,
                exchange.url,
                exchange.type,
                exchange.market
            )

        cnxn.commit()

    def persist_tickers(self, tickers: List[Symbol]):

        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        for ticker in tickers:
            cursor.execute('''
                        DECLARE @ticker nvarchar(50) = ?;
                        DECLARE @name nvarchar(255) = ?;
                        DECLARE @market nvarchar(30) = ?;
                        DECLARE @locale nvarchar(255) = ?;
                        DECLARE @active bit = ?;
                        DECLARE @primary_exchange nvarchar(255) = ?;
                        DECLARE @updated_date date = ?;
                        DECLARE @url nvarchar(255) = ?;
                        DECLARE @base_currency_name nvarchar(255) = ?;
                        DECLARE @base_currency_symbol nvarchar(30) = ?;
                        DECLARE @target_currency_name nvarchar(255) = ?;
                        DECLARE @target_currency_symbol nvarchar(30) = ?;

                        DECLARE @type_id bigint = -1;
                        SELECT @type_id = Id 
                            FROM Polygon_Type WHERE Type like upper(@market);
                        IF @type_id = -1
                        BEGIN
                            INSERT INTO Polygon_Type (Type) Values (upper(@market));
                            SET @type_id = SCOPE_IDENTITY();
                        END 
                        
                        DECLARE @base_currency_id bigint = -1;
                        SELECT @base_currency_id = Id 
                            FROM Polygon_Currency WHERE Symbol like upper(@base_currency_symbol);
                        IF @base_currency_id = -1
                        BEGIN
                            INSERT INTO Polygon_Currency (Polygon_Type_Id, Name, Symbol) Values (@type_id, @base_currency_name, upper(@base_currency_symbol));
                            
                            SET @base_currency_id = SCOPE_IDENTITY();
                        END 
                        
                        DECLARE @target_currency_id bigint = -1;
                        SELECT @target_currency_id = Id 
                            FROM Polygon_Currency WHERE Symbol like upper(@target_currency_symbol);
                        IF @target_currency_id = -1
                        BEGIN
                            INSERT INTO Polygon_Currency (Polygon_Type_Id, Name, Symbol) Values (@type_id, @target_currency_name, upper(@target_currency_symbol));
                            
                            SET @target_currency_id = SCOPE_IDENTITY();
                        END 

                        DECLARE @ticker_id bigint = -1;
                        SELECT @ticker_id = Id 
                            FROM Polygon_Ticker WHERE Ticker like upper(@ticker);
                        IF @ticker_id = -1
                        BEGIN
                            INSERT INTO Polygon_Ticker (Polygon_Type_Id, Base_Polygon_Currency_Id, Target_Polygon_Currency_Id, Ticker, Name, Locale, Active, PrimaryExchange, UpdatedDate, Url) 
                            Values (@type_id, @base_currency_id, @target_currency_id, @ticker, @name, @locale, @active, @primary_exchange, @updated_date, @url);
                        END 
                    ''',
                           ticker['ticker'],
                           ticker['name'],
                           ticker['market'],
                           ticker['locale'],
                           ticker['active'],
                           ticker['primaryExch'],
                           ticker['updated'],
                           ticker['url'],
                           ticker['attrs']['baseName'],
                           ticker['attrs']['base'],
                           ticker['attrs']['currencyName'],
                           ticker['attrs']['currency']
                           )

        cnxn.commit()

    def get_ticker_aggregate_history(self, market, timespan='day'):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        ticker_rows = cursor.execute('''
                                    DECLARE @market nvarchar(30) = ?;
                                    DECLARE @timespan nvarchar(30) = ?;

                                    SELECT PT.Ticker, MIN(PTAPH.PullStartDate), MAX(PTAPH.PullEndDate)
                                        FROM Polygon_Ticker PT
                                        INNER JOIN Polygon_Type PType ON PType.Type like upper(@market) AND PType.Id = PT.Polygon_Type_Id
                                        LEFT JOIN Polygon_Ticker_Aggregate_Pull_History PTAPH ON PTAPH.Polygon_Ticker_id = PT.Id
                                              AND PTAPH.Timespan like upper(@timespan)
                                        GROUP BY PT.Ticker;
                                ''',
                       market,
                       timespan
                       ).fetchall()
        tickers = []

        for ticker_row in ticker_rows:
            start_date = None
            if ticker_row[1]:
                start_date = datetime.datetime.strptime(ticker_row[1], "%Y-%m-%d").date()
            end_date = None
            if ticker_row[1]:
                end_date = datetime.datetime.strptime(ticker_row[2], "%Y-%m-%d").date()
            tickers.append(dict(ticker = ticker_row[0], start_date = start_date, end_date = end_date))

        return tickers

    def persist_ticker_aggregate_history(self, ticker_name, start_date, end_date, timespan='day'):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                            DECLARE @ticker_name nvarchar(50) = ?;
                            DECLARE @timespan nvarchar(30) = ?;
                            DECLARE @start_date date = ?;
                            DECLARE @end_date date = ?;

                            DECLARE @ticker_id bigint = -1;
                            SELECT @ticker_id = Id 
                                FROM Polygon_Ticker WHERE Ticker like upper(@ticker_name);
                            IF @ticker_id != -1
                            BEGIN
                                INSERT INTO Polygon_Ticker_Aggregate_Pull_History(Polygon_Ticker_Id, Timespan, PullStartDate, PullEndDate)
                                Values(@ticker_id, upper(@timespan), @start_date, @end_date);
                            END 
                        ''',
               ticker_name,
               timespan,
               str(start_date),
               str(end_date)
        )

        cnxn.commit()

    def persist_ticker_aggregate_results(self, ticker, results, timespan='day'):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        for result in results:
            volumew = None
            if 'vw' in result:
                volumew = result['vw']

            cursor.execute('''
                                    DECLARE @ticker_symbol nvarchar(50) = ?;
                                    DECLARE @timespan nvarchar(30) = ?;
                                    DECLARE @volume float = ?;
                                    DECLARE @volumew float= ?;
                                    DECLARE @open float = ?;
                                    DECLARE @close float = ?;
                                    DECLARE @high float = ?;
                                    DECLARE @low float = ?;
                                    DECLARE @time datetimeoffset = ?;
                                    DECLARE @number_of_items_in_aggregate_window float = ?;

                                    DECLARE @ticker_id bigint = -1;
                                    SELECT @ticker_id = Id 
                                        FROM Polygon_Ticker WHERE Ticker like upper(@ticker_symbol);
                                    IF @ticker_id != -1
                                    BEGIN
                                        DECLARE @old_aggregation_id bigint = -1;
                                        SELECT @old_aggregation_id = Id 
                                            FROM Polygon_Ticker_Aggregate WHERE Polygon_Ticker_Id = @ticker_id AND Timespan like upper(@timespan) AND Time = @time;
                                        
                                        IF @old_aggregation_id != -1
                                        BEGIN
                                            UPDATE Polygon_Ticker_Aggregate
                                                SET Volume = @volume,
                                                    OpenPrice = @open,
                                                    ClosePrice = @close,
                                                    HighPrice = @high,
                                                    LowPrice = @low,
                                                    NumberOfItemsAggregated = @number_of_items_in_aggregate_window
                                                WHERE Id = @old_aggregation_id;
                                        END
                                        ELSE
                                        BEGIN
                                            INSERT INTO Polygon_Ticker_Aggregate(Polygon_Ticker_Id, Timespan, Time, Volume, VolumeW, OpenPrice, ClosePrice, HighPrice, LowPrice, NumberOfItemsAggregated)
                                            Values(@ticker_id, upper(@timespan), @time, @volume, @volumew, @open, @close, @high, @low, @number_of_items_in_aggregate_window);
                                        END
                                    
                                    END 
                                ''',
                           ticker,
                           timespan,
                           result['v'],
                           volumew,
                           result['o'],
                           result['c'],
                           result['h'],
                           result['l'],
                           datetime.datetime.fromtimestamp(float(result['t']) / 1000, datetime.timezone.utc),
                           result['n']
                       )

        cnxn.commit()

    def get_top_pairs(self, size=1):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        pair_rows = cursor.execute('''
                                         SELECT TOP({0}) CONCAT(coin.Symbol, '-USD') AS Pair FROM 
                                            CoinMarketCap_Coin coin
                                            INNER JOIN CoinMarketCap_Coin_Price coin_price ON coin_price.CoinMarketCap_Coin_Id = coin.Id
                                            INNER JOIN CoinMarketCap_Coin usdc_coin on usdc_coin.Symbol = 'USDC' AND coin_price.Unit_CoinMarketCap_Coin_Id = usdc_coin.Id
                                            order by UpdateDateTimeOffset desc, coin_price.MarketCap desc;
                                        '''.format(size)
                                     ).fetchall()
        pairs = []

        for pair_row in pair_rows:
            pairs.append(pair_row[0])

        return pairs

    def persist_realtime_quote(self, pair, last_trade_price, last_trade_size, bid_price, bid_size, ask_price, ask_size, exchange_datetime, exchange_id, polygon_received_datetime):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                                DECLARE @pair nvarchar(50) = ?;
                                DECLARE @last_trade_price float = ?;
                                DECLARE @last_trade_size float = ?;
                                DECLARE @bid_price float= ?;
                                DECLARE @bid_size float = ?;
                                DECLARE @ask_price float = ?;
                                DECLARE @ask_size float = ?;
                                DECLARE @exchange_id float = ?;
                                DECLARE @exchange_datetime datetimeoffset = ?;
                                DECLARE @polygon_received_datetime datetimeoffset = ?;

                                DECLARE @ticker_id bigint = -1;
                                SELECT @ticker_id = Id 
                                    FROM Polygon_Ticker WHERE Ticker like UPPER(CONCAT('%', REPLACE(@pair, '-', '')));
                                IF @ticker_id != -1 AND EXISTS (Select * from Polygon_Exchange where Id = @exchange_id)
                                BEGIN
                                    INSERT INTO Polygon_Realtime_Quote(
                                        Polygon_Exchange_Id, 
                                        Polygon_Ticker_Id,
                                        ExchangeTimestamp,
                                        PolygonReceivedTimestamp,
                                        LastTradePrice,
                                        LastTradeSize,
                                        BidPrice,
                                        BidSize,
                                        AskPrice,
                                        AskSize
                                    ) VALUES (
                                        @exchange_id,
                                        @ticker_id,
                                        @exchange_datetime,
                                        @polygon_received_datetime,
                                        @last_trade_price,
                                        @last_trade_size,
                                        @bid_price,
                                        @bid_size,
                                        @ask_price,
                                        @ask_size
                                    );

                                END 
                            ''',
                       pair,
                       last_trade_price,
                       last_trade_size,
                       bid_price,
                       bid_size,
                       ask_price,
                       ask_size,
                       exchange_id,
                       exchange_datetime,
                       polygon_received_datetime
             )

        cnxn.commit()

    def persist_realtime_aggregate(self, pair, tick_start_timestamp, tick_end_timestamp, open_price,
                      high_price, low_price, close_price, volume):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                                DECLARE @pair nvarchar(50) = ?;
                                DECLARE @tick_start_timestamp datetimeoffset = ?;
                                DECLARE @tick_end_timestamp datetimeoffset = ?;
                                DECLARE @open_price float= ?;
                                DECLARE @high_price float = ?;
                                DECLARE @low_price float = ?;
                                DECLARE @close_price float = ?;
                                DECLARE @volume float = ?;

                                DECLARE @ticker_id bigint = -1;
                                SELECT @ticker_id = Id 
                                    FROM Polygon_Ticker WHERE Ticker like UPPER(CONCAT('%', REPLACE(@pair, '-', '')));
                                IF @ticker_id != -1
                                BEGIN
                                    INSERT INTO Polygon_Realtime_Aggregate(
                                        Polygon_Ticker_Id,
                                        TickStartTimestamp,
                                        TickEndTimestamp,
                                        OpenPrice,
                                        HighPrice,
                                        LowPrice,
                                        ClosePrice,
                                        Volume
                                    ) VALUES (
                                        @ticker_id,
                                        @tick_start_timestamp,
                                        @tick_end_timestamp,
                                        @open_price,
                                        @high_price,
                                        @low_price,
                                        @close_price,
                                        @volume
                                    );

                                END 
                            ''',
                       pair,
                       tick_start_timestamp,
                       tick_end_timestamp,
                       open_price,
                       high_price,
                       low_price,
                       close_price,
                       volume
                       )

        cnxn.commit()