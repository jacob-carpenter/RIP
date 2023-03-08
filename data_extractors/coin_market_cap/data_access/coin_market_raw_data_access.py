from config import raw_market_sql_database_config
import pyodbc

from coin_market_cap.api.coin_market_cap_listings_latest_data_access import Listing, PriceQuote
import datetime


class CoinMarketRawDataAccess:

    def clean(self):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                        if exists (select * from sysobjects where name='CoinMarketCap_Coin_Metadata' and xtype='U')
                        BEGIN
                            DROP TABLE CoinMarketCap_Coin_Metadata;
                        END

                        if exists (select * from sysobjects where name='CoinMarketCap_Coin_Price' and xtype='U')
                        BEGIN
                            DROP TABLE CoinMarketCap_Coin_Price;
                        END
                        
                        if exists (select * from sysobjects where name='CoinMarketCap_Coin' and xtype='U')
                        BEGIN
                            DROP TABLE CoinMarketCap_Coin;
                        END
                       ''')

        cnxn.commit()

    def migrate(self, clean=0):
        if clean:
            self.clean()

        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''

                        if not exists (select * from sysobjects where name='CoinMarketCap_Coin' and xtype='U')
                        BEGIN
                            CREATE TABLE CoinMarketCap_Coin
                            (
                                Id bigint identity(1, 1) PRIMARY KEY,
                                SourceSystemCoinId bigint,
                                Name nvarchar(255),
                                Symbol nvarchar(30),
                                Slug nvarchar(255),
                                AddedDateTimeOffset DateTimeOffset
                            );

                            CREATE UNIQUE NONCLUSTERED INDEX CoinMarketCap_Coin_SourceSystemCoinId_Index ON CoinMarketCap_Coin (SourceSystemCoinId);
                            CREATE UNIQUE NONCLUSTERED INDEX CoinMarketCap_Coin_Symbol_Index ON CoinMarketCap_Coin (Symbol);
                        END;

                        if not exists (select * from sysobjects where name='CoinMarketCap_Coin_Metadata' and xtype='U')
                        BEGIN
                            CREATE TABLE CoinMarketCap_Coin_Metadata
                            (
                                Id bigint identity(1, 1) Primary Key,
                                CoinMarketCap_Coin_Id bigint,
                                NumMarketPairs int,
                                MaxSupply bigint,
                                CirculatingSupply bigint,
                                TotalSupply bigint,
                                CMCRank int,
                                UpdateDateTimeOffset DateTimeOffset,
                                FOREIGN KEY (CoinMarketCap_Coin_Id) REFERENCES CoinMarketCap_Coin(Id)
                            );
                            CREATE NONCLUSTERED INDEX CoinMarketCap_Coin_Metadata_CoinMarketCap_Coin_Id_Index ON CoinMarketCap_Coin_Metadata (CoinMarketCap_Coin_Id);
                            CREATE NONCLUSTERED INDEX CoinMarketCap_Coin_Metadata_CoinMarketCap_Coin_Id_UpdateDateTimeOffset_Index ON CoinMarketCap_Coin_Metadata (CoinMarketCap_Coin_Id, UpdateDateTimeOffset);
                        END;


                        if not exists (select * from sysobjects where name='CoinMarketCap_Coin_Price' and xtype='U')
                        BEGIN
                            CREATE TABLE CoinMarketCap_Coin_Price
                            (
                                Id bigint identity(1, 1) Primary Key,
                                CoinMarketCap_Coin_Id bigint,
                                Unit nvarchar(255),
                                Unit_CoinMarketCap_Coin_Id bigint,
                                Price float,
                                Volume24h float,
                                PercentChange1h float,
                                PercentChange24h float,
                                PercentChange7d float,
                                MarketCap float,
                                UpdateDateTimeOffset DateTimeOffset,
                                FOREIGN KEY (CoinMarketCap_Coin_Id) REFERENCES CoinMarketCap_Coin(Id),
                                FOREIGN KEY (Unit_CoinMarketCap_Coin_Id) REFERENCES CoinMarketCap_Coin(Id)
                            );
                            CREATE NONCLUSTERED INDEX CoinMarketCap_Coin_Price_CoinMarketCap_Coin_Id_Index ON CoinMarketCap_Coin_Price (CoinMarketCap_Coin_Id);
                            CREATE NONCLUSTERED INDEX CoinMarketCap_Coin_Price_CoinMarketCap_Coin_Id_Unit_UpdateDateTimeOffset_Index ON CoinMarketCap_Coin_Price (CoinMarketCap_Coin_Id, Unit, UpdateDateTimeOffset);
                            CREATE NONCLUSTERED INDEX CoinMarketCap_Coin_Price_CoinMarketCap_Coin_Id_Unit_Index ON CoinMarketCap_Coin_Price (CoinMarketCap_Coin_Id, Unit);
                            CREATE NONCLUSTERED INDEX CoinMarketCap_Coin_Price_Unit_CoinMarketCap_Coin_Id_Index ON CoinMarketCap_Coin_Price (Unit_CoinMarketCap_Coin_Id);
                        END;

                        ''')

        cnxn.commit()

    def persist_latest_listings(self, listings: [Listing]):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        for listing in listings:
            for price_quote in listing.price_quotes:
                cursor.execute('''
                    DECLARE @source_system_coin_id bigint = ?;
                    DECLARE @name nvarchar(255) = ?;
                    DECLARE @symbol nvarchar(30) = ?;
                    DECLARE @slug nvarchar(255) = ?;
                    DECLARE @added_date_time_offset DateTimeOffset = ?;
                    
                    DECLARE @num_market_pairs int = ?;
                    DECLARE @max_supply bigint = ?;
                    DECLARE @circulating_supply bigint = ?;
                    DECLARE @total_supply bigint = ?;
                    DECLARE @cmc_rank int = ?;
                    DECLARE @updated_date_time_offset DateTimeOffset = ?;
                    
                    DECLARE @unit nvarchar(255) = ?;
                    DECLARE @price float = ?;
                    DECLARE @volume_24h float = ?;
                    DECLARE @percent_change_1h float = ?;
                    DECLARE @percent_change_24h float = ?;
                    DECLARE @percent_change_7d float = ?;
                    DECLARE @market_cap float = ?;
                    DECLARE @updated_last_price_date_time_offset DateTimeOffset = ?;
                    
                    DECLARE @coin_id bigint = -1;
                    SELECT @coin_id = Id 
                        FROM CoinMarketCap_Coin WHERE SourceSystemCoinId = @source_system_coin_id;
                    IF @coin_id = -1
                    BEGIN
                        INSERT INTO CoinMarketCap_Coin (SourceSystemCoinId, Name, Symbol, Slug, AddedDateTimeOffset) Values (@source_system_coin_id, @name, @symbol, @slug, @added_date_time_offset);
                        
                        SET @coin_id = SCOPE_IDENTITY();
                        
                        UPDATE CoinMarketCap_Coin_Price SET Unit_CoinMarketCap_Coin_Id = @coin_id
                        WHERE Unit like @symbol;
                    END 
                    
                    DECLARE @unit_coin_id bigint = -1;
                    SELECT @unit_coin_id = Id 
                        FROM CoinMarketCap_Coin WHERE Symbol like @Unit;
                        
                    DECLARE @coin_metadata_id bigint = -1;
                    SELECT @coin_metadata_id = Id 
                        FROM CoinMarketCap_Coin_Metadata WHERE CoinMarketCap_Coin_Id = @coin_id 
                            AND UpdateDateTimeOffset = @updated_date_time_offset;
                    if @coin_metadata_id = -1
                    BEGIN
                        INSERT INTO CoinMarketCap_Coin_Metadata (CoinMarketCap_Coin_Id, NumMarketPairs, MaxSupply, CirculatingSupply, TotalSupply, CMCRank, UpdateDateTimeOffset) 
                        Values (@coin_id, @num_market_pairs, @max_supply, @circulating_supply, @total_supply, @cmc_rank, @updated_date_time_offset);
                        
                        SET @coin_metadata_id = SCOPE_IDENTITY();
                    END
                    
                    DECLARE @coin_price_id bigint = -1;
                    SELECT @coin_price_id = Id 
                        FROM CoinMarketCap_Coin_Price WHERE CoinMarketCap_Coin_Id = @coin_id 
                            AND Unit = @unit
                            AND UpdateDateTimeOffset = @updated_last_price_date_time_offset;
                    if @coin_price_id = -1
                    BEGIN
                        INSERT INTO CoinMarketCap_Coin_Price (CoinMarketCap_Coin_Id, Unit, Unit_CoinMarketCap_Coin_Id, Price, Volume24h, PercentChange1h, PercentChange24h, PercentChange7d, MarketCap, UpdateDateTimeOffset) 
                        Values (@coin_id, @unit, @unit_coin_id, @price, @volume_24h, @percent_change_1h, @percent_change_24h, @percent_change_7d, @market_cap, @updated_last_price_date_time_offset);
                        
                        SET @coin_metadata_id = SCOPE_IDENTITY();
                    END
                ''',
                               listing.coin_id,
                               listing.name,
                               listing.symbol,
                               listing.slug,
                               listing.date_added,
                               listing.num_market_pairs,
                               listing.max_supply,
                               listing.circulating_supply,
                               listing.total_supply,
                               listing.cmc_rank,
                               listing.last_updated,
                               price_quote.unit,
                               price_quote.price,
                               price_quote.volume_24h,
                               price_quote.percent_change_1h,
                               price_quote.percent_change_24h,
                               price_quote.percent_change_7d,
                               price_quote.market_cap,
                               price_quote.last_updated
                )

        cnxn.commit()