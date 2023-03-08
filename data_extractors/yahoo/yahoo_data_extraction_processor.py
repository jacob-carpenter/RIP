from config import yahoo_config, database_configuration

from pandas_datareader import data as web
from metadata.data_access.extractor_metadata_data_access import ExtractorMetadataDataAccess
from yahoo.data_access.yahoo_data_access import YahooDataAccess

import datetime
import time

class YahooExtractionProcessor:
    extractor_name = 'YAHOO'

    extractor_metadata_data_access = None
    yahoo_data_access = None

    def initialize(self, clean=0):
        self.yahoo_data_access = YahooDataAccess()
        self.yahoo_data_access.migrate(clean)

        self.extractor_metadata_data_access = ExtractorMetadataDataAccess()

    def process(self):
        if self.extractor_metadata_data_access is None:
            raise RuntimeError("Please initialize the YahooExtractionProcessor prior to processing.")

        while True:
            self.process_aggregates()

            time.sleep(60.0)

    def process_aggregates(self):
        last_yahoo_pull = self.extractor_metadata_data_access.get_last_run_time(self.extractor_name, None, None)

        if database_configuration['yahoo_data_clean_database'] or database_configuration['yahoo_data_clean_database'] or last_yahoo_pull is None or last_yahoo_pull + datetime.timedelta(
                milliseconds=yahoo_config['time_between_pulls_in_millis']) < datetime.datetime.now(datetime.timezone.utc):

            yahoo_lookback_start = datetime.datetime.strptime(yahoo_config['start_date'], "%Y-%m-%d").date()
            target_end_date = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=yahoo_config['lookback_days'])).date()

            start_time = datetime.datetime.now(datetime.timezone.utc)
            self.extractor_metadata_data_access.register_run(
                self.extractor_name,
                None,
                0,
                None,
                start_time,
                None
            )

            print("[YahooExtractionProcessor] Pulling yahoo prices.")
            symbols_to_aggregate = self.yahoo_data_access.get_yahoo_daily_price_pull_history()
            for symbol in symbols_to_aggregate:
                if symbol['start_date'] is None or symbol['end_date'] is None:
                    print("[YahooExtractionProcessor] Pulling all prices for {0}.".format(symbol['symbol']))
                    self.process_aggregates_for_symbol_range(symbol['symbol'], yahoo_lookback_start, target_end_date)
                else:
                    print("[YahooExtractionProcessor] Pulling range of prices for {0}.".format(symbol['symbol']))
                    if symbol['start_date'] < yahoo_lookback_start:
                        start = yahoo_lookback_start - datetime.timedelta(days=1)
                        end = symbol['start_date']
                        self.process_aggregates_for_symbol_range(symbol['symbol'], start, end)
                    if symbol['end_date'] < target_end_date:
                        start = symbol['end_date'] - datetime.timedelta(days=1)
                        end = target_end_date
                        self.process_aggregates_for_symbol_range(symbol['symbol'], start, end)

            end_time = datetime.datetime.now(datetime.timezone.utc)
            self.extractor_metadata_data_access.register_run(
                self.extractor_name,
                None,
                0,
                None,
                start_time,
                end_time
            )

    def process_aggregates_for_symbol_range(self, symbol, start, end):
        print(
            "[YahooExtractionProcessor] Pulling prices for symbol {0}. Range {1} to {2}.".format(
                symbol, start, end))

        try:
            df = web.DataReader(symbol, data_source='yahoo', start=start, end=end)

            self.yahoo_data_access.persist_symbol_price_results(symbol, df[['Open', 'High', 'Low', 'Close', 'Volume']])
        except Exception as e:
            print("An error has occurred pulling yahoo symbol prices", e)

        self.yahoo_data_access.persist_symbol_price_pull_history(symbol, start, end)
        time.sleep(5.0)