database_configuration = dict(
    extractor_metadata_clean_database = 0,
    coin_market_cap_clean_database = 0,
    polygon_io_clean_database = 0,
    polygon_io_crypto_clean_database = 0,
    yahoo_data_clean_database = 0,
    gdax_data_clean_database = 0,
    datahub_clean_database = 0
)
extractor_enablement = dict(
    coin_market_cap_extractor_enabled = 1,
    polygon_io_crypto_extractor_enabled = 1,
    datahub_extractor_enabled = 0,
    yahoo_extractor_enabled = 1,
    gdax_extractor_enabled = 1,
    sanitization_enabled = 1
)
coin_market_cap_api_config = dict(
    uri = 'http://pro-api.coinmarketcap.com',
    api_key = 'NOT TODAY',
    #uri = 'http://sandbox-api.coinmarketcap.com',
    #api_key = 'NOT TODAY',
    listing_latest_number_of_currencies = 200,
    listing_latest_time_between_pulls_in_millis = 1000,
    listing_latest_conversions = ['BTC', 'USDC']
)
polygon_io_api_config = dict(
    uri = 'api.polygon.io',
    crypto_web_socket_uri = 'wss://socket.polygon.io/crypto',
    api_key = 'NOT TODAY',
    crypto_historical_lookback_in_years = 5,
    stocks_historical_lookback_in_years = 5,
    day_aggregate_pull_max_days = 90,
    crypto_market_name = 'CRYPTO',

    crypto_realtime_enabled = 0,
    crypto_realtime_minimum_time_between_writes_in_millis = 2000,
    crypto_realtime_quote_additional_top_pair_count = 0,
    crypto_realtime_trade_additional_top_pair_count = 0,
    crypto_realtime_aggregate_additional_top_pair_count = 30,
    crypto_realtime_level2_aggregate_additional_top_pair_count = 0,
    crypto_realtime_quote_pairs = [],
    crypto_realtime_trade_pairs = [],
    crypto_realtime_aggregate_pairs = ['XLM-USD'],
    crypto_realtime_level2_aggregate_pairs = []
)
datahub_api_config = dict(
    uri = 'https://datahub.io'
)
yahoo_config = dict(
    start_date = '2000-01-01',
    time_between_pulls_in_millis = 24 * 60 * 60 * 1000,
    lookback_days = 1
)
gdax_config = dict(
    uri = 'https://api.pro.coinbase.com',
    minute_granularity_start_date = '2019-01-01',
    five_minute_granularity_start_date = '2019-01-01',
    fifteen_minute_granularity_start_date = '2019-01-01',
    hour_granularity_start_date = '2017-01-01',
    six_hour_granularity_start_date = '2015-01-01',
    day_granularity_start_date = '2010-01-01',
    max_historic_rate_per_pull=2000,
    minute_granularity_enabled = 1,
    five_minute_granularity_enabled = 1,
    fifteen_minute_granularity_enabled = 1,
    hour_granularity_enabled = 1,
    six_hour_granularity_enabled = 1,
    day_granularity_enabled = 1,
    time_between_pulls_in_millis86400 = 24 * 60 * 60 * 1000,
    time_between_pulls_in_millis21600 = 6 * 60 * 60 * 1000,
    time_between_pulls_in_millis3600 = 60 * 60 * 1000,
    time_between_pulls_in_millis900 = 15 * 60 * 60 * 1000,
    time_between_pulls_in_millis300 = 5 * 60 * 1000,
    time_between_pulls_in_millis60 = 60 * 1000,
)
stellar_dex_api_config = dict(
    uri = 'https://horizon-testnet.stellar.org/',
    #uri='https://horizon.stellar.org/',
    max_requests_per_hour = 3600
)
raw_market_sql_database_config = dict(
    odbc_connection = "driver={SQL Server};server=localhost\SQLEXPRESS;database=RawMarketData;trusted_connection=true"
)
sanitized_market_sql_database_config = dict(
    odbc_connection = "driver={SQL Server};server=localhost\SQLEXPRESS;database=SanitizedMarketData;trusted_connection=true"
)
extractor_metadata_sql_database_config = dict(
    odbc_connection = "driver={SQL Server};server=localhost\SQLEXPRESS;database=ExtractorMetadata;trusted_connection=true"
)