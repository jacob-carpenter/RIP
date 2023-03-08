from config import polygon_io_api_config, database_configuration

from metadata.data_access.extractor_metadata_data_access import ExtractorMetadataDataAccess
from polygon_extractor.crypto.api.polygon_crypto_exchanges_data_access import PolygonCryptoExchangesDataAccess
from polygon_extractor.crypto.data_access.polygon_crypto_raw_data_access import PolygonCryptoRawDataAccess
from polygon_extractor.api.polygon_tickers_data_access import PolygonTickersDataAccess
from polygon_extractor.api.polygon_aggregates_data_access import PolygonAggregatesDataAccess
from polygon_extractor.data_access.polygon_raw_data_access import PolygonRawDataAccess

from polygon_extractor.crypto.polygon_crypto_realtime_extraction_processor import PolygonCryptoRealtimeExtractionProcessor

import datetime
import time
from threading import Thread

# https://polygon.io/dashboard

polygon_crypto_realtime_extraction_processor = PolygonCryptoRealtimeExtractionProcessor()
def ProcessPolygonCryptoRealtimeExtractor():
    polygon_crypto_realtime_extraction_processor.run()

class PolygonCryptoExtractionProcessor:
    extractor_name = 'POLYGON_CRYPTO'

    extractor_metadata_data_access = None
    polygon_crypto_exchanges_data_access = None
    polygon_crypto_raw_data_access = None
    polygon_raw_data_access = None

    polygon_tickers_data_access = None
    polygon_aggregate_data_access = None

    def initialize(self, clean=0):
        self.polygon_crypto_raw_data_access = PolygonCryptoRawDataAccess()
        self.polygon_crypto_raw_data_access.migrate(clean)

        self.polygon_raw_data_access = PolygonRawDataAccess()

        self.polygon_aggregate_data_access = PolygonAggregatesDataAccess()
        self.polygon_tickers_data_access = PolygonTickersDataAccess()
        self.polygon_crypto_exchanges_data_access = PolygonCryptoExchangesDataAccess()
        self.extractor_metadata_data_access = ExtractorMetadataDataAccess()

    def process(self):
        if self.extractor_metadata_data_access is None:
            raise RuntimeError("Please initialize the PolygonCryptoExtractionProcessor prior to processing.")

        self.process_exchanges()
        self.process_tickers()

        if polygon_io_api_config['crypto_realtime_enabled']:
            polygon_crypto_realtime_extraction_processor_thread = Thread(target=ProcessPolygonCryptoRealtimeExtractor, args=[])
            polygon_crypto_realtime_extraction_processor_thread.start()

        self.process_aggregates()

        while True:
            time.sleep(60.0)

            self.process_exchanges()
            self.process_tickers()
            self.process_aggregates()

    def process_exchanges(self):
        last_crypto_exchange_pull = self.extractor_metadata_data_access.get_last_run_time(self.extractor_name,
                                                                                          polygon_io_api_config['uri'],
                                                                                          self.polygon_crypto_exchanges_data_access.route)

        if database_configuration['polygon_io_crypto_clean_database'] or database_configuration['polygon_io_clean_database'] or last_crypto_exchange_pull is None or last_crypto_exchange_pull + datetime.timedelta(
                milliseconds=self.polygon_crypto_exchanges_data_access.staleness_in_millis) < datetime.datetime.now(datetime.timezone.utc):

            start = datetime.datetime.now(datetime.timezone.utc)
            self.extractor_metadata_data_access.register_run(
                self.extractor_name,
                polygon_io_api_config['uri'],
                0,
                self.polygon_crypto_exchanges_data_access.route,
                start,
                None
            )

            print("[PolygonCryptoExtractionProcessor] Pulling crypto exchanges.")
            self.polygon_raw_data_access.persist_exchanges(self.polygon_crypto_exchanges_data_access.get_exchanges().cryptoexchange)

            end_time = datetime.datetime.now(datetime.timezone.utc)
            self.extractor_metadata_data_access.register_run(
                self.extractor_name,
                polygon_io_api_config['uri'],
                0,
                self.polygon_crypto_exchanges_data_access.route,
                start,
                end_time
            )

    def process_tickers(self):
        last_crypto_ticker_pull = self.extractor_metadata_data_access.get_last_run_time(self.extractor_name,
                                                                                          polygon_io_api_config['uri'],
                                                                                          self.polygon_tickers_data_access.route)

        if database_configuration['polygon_io_crypto_clean_database'] or database_configuration['polygon_io_clean_database'] or last_crypto_ticker_pull is None or last_crypto_ticker_pull + datetime.timedelta(
                milliseconds=self.polygon_tickers_data_access.staleness_in_millis) < datetime.datetime.now(datetime.timezone.utc):

            start = datetime.datetime.now(datetime.timezone.utc)
            self.extractor_metadata_data_access.register_run(
                self.extractor_name,
                polygon_io_api_config['uri'],
                0,
                self.polygon_tickers_data_access.route,
                start,
                None
            )

            print("[PolygonCryptoExtractionProcessor] Pulling crypto listings.")
            perPage = 100
            response = self.polygon_tickers_data_access.get_tickers(polygon_io_api_config['crypto_market_name'], None, perPage)
            self.polygon_raw_data_access.persist_tickers(response.tickers)
            while response.page * response.perPage < response.count:
                pageNum = response.page + 1
                print("[PolygonCryptoExtractionProcessor] Pulling page {0} of crypto listings.".format(pageNum))
                response = self.polygon_tickers_data_access.get_tickers(polygon_io_api_config['crypto_market_name'], pageNum, perPage)
                self.polygon_raw_data_access.persist_tickers(response.tickers)

            end_time = datetime.datetime.now(datetime.timezone.utc)
            self.extractor_metadata_data_access.register_run(
                self.extractor_name,
                polygon_io_api_config['uri'],
                0,
                self.polygon_tickers_data_access.route,
                start,
                end_time
            )

    def process_aggregates(self):

        last_crypto_aggregate_pull = self.extractor_metadata_data_access.get_last_run_time(self.extractor_name,
                                                                                          polygon_io_api_config['uri'],
                                                                                          self.polygon_aggregate_data_access.route)

        if database_configuration['polygon_io_crypto_clean_database'] or database_configuration['polygon_io_clean_database'] or last_crypto_aggregate_pull is None or last_crypto_aggregate_pull + datetime.timedelta(
                milliseconds=self.polygon_aggregate_data_access.staleness_in_millis) < datetime.datetime.now(datetime.timezone.utc):

            crypto_aggregate_lookback_start = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=polygon_io_api_config['crypto_historical_lookback_in_years'] * 365.25)).date()
            target_end_date = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)).date()

            start_time = datetime.datetime.now(datetime.timezone.utc)
            self.extractor_metadata_data_access.register_run(
                self.extractor_name,
                polygon_io_api_config['uri'],
                0,
                self.polygon_aggregate_data_access.route,
                start_time,
                None
            )

            print("[PolygonCryptoExtractionProcessor] Pulling crypto aggregates.")

            tickers_to_aggregate = self.polygon_raw_data_access.get_ticker_aggregate_history('CRYPTO')
            for ticker in tickers_to_aggregate:
                if ticker['start_date'] is None or ticker['end_date'] is None:
                    print("[PolygonCryptoExtractionProcessor] Pulling all crypto aggregates for {0}.".format(ticker['ticker']))
                    self.process_aggregates_for_ticker_range(ticker['ticker'], crypto_aggregate_lookback_start, target_end_date)
                else:
                    print("[PolygonCryptoExtractionProcessor] Pulling range of crypto aggregates for {0}.".format(ticker['ticker']))
                    if ticker['start_date'] < crypto_aggregate_lookback_start:
                        start = crypto_aggregate_lookback_start  - datetime.timedelta(days=1)
                        end = ticker['start_date']
                        self.process_aggregates_for_ticker_range(ticker['ticker'], start, end)
                    if ticker['end_date'] < target_end_date:
                        start = ticker['end_date']  - datetime.timedelta(days=1)
                        end = target_end_date
                        self.process_aggregates_for_ticker_range(ticker['ticker'], start, end)

            end_time = datetime.datetime.now(datetime.timezone.utc)
            self.extractor_metadata_data_access.register_run(
                self.extractor_name,
                polygon_io_api_config['uri'],
                0,
                self.polygon_aggregate_data_access.route,
                start_time,
                end_time
            )

    def process_aggregates_for_ticker_range(self, ticker, start, end):
        max_range_in_days = polygon_io_api_config['day_aggregate_pull_max_days']
        while start < end:
            range_end = end
            if start + datetime.timedelta(days=max_range_in_days) < end:
                range_end = start + datetime.timedelta(days=max_range_in_days)

            print("[PolygonCryptoExtractionProcessor] Pulling crypto aggregates for ticker {0}. Range {1} to {2}.".format(ticker, start, range_end))
            results = self.polygon_aggregate_data_access.get_aggregates(ticker, start, range_end).results
            if results:
                self.polygon_raw_data_access.persist_ticker_aggregate_results(ticker, results)
            self.polygon_raw_data_access.persist_ticker_aggregate_history(ticker, start, range_end)

            start = range_end