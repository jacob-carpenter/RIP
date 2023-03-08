from config import gdax_config, database_configuration

from pandas_datareader import data as web
from metadata.data_access.extractor_metadata_data_access import ExtractorMetadataDataAccess
from coin_base.data_access.gdax_data_access import GDAXDataAccess
from coin_base.api.gdax_product_data_access import GDAXProductDataAccess

from pandas_datareader_gdax import get_data_gdax

import datetime
import time
import math

class GDAXExtractionProcessor:
    extractor_name = 'GDAX'
    gdax_product_route = '/products'

    minute_granularity = 60
    five_minute_granularity = 60 * 5
    fifteen_minute_granularity = 60 * 5 * 3
    hour_granularity = 60 * 60
    six_hour_granularity = 60 * 60 * 6
    day_granularity = 60 * 60 * 24

    extractor_metadata_data_access = None
    gdax_data_access = None
    gdax_product_data_access = None

    def initialize(self, clean=0):
        self.gdax_data_access = GDAXDataAccess()
        self.gdax_data_access.migrate(clean)

        self.extractor_metadata_data_access = ExtractorMetadataDataAccess()
        self.gdax_product_data_access = GDAXProductDataAccess()

    def process(self):
        if self.extractor_metadata_data_access is None:
            raise RuntimeError("Please initialize the GDAXExtractionProcessor prior to processing.")

        while True:
            self.process_pairs()
            if gdax_config['day_granularity_enabled']:
                self.process_aggregates(self.day_granularity, gdax_config['day_granularity_start_date'])
            if gdax_config['six_hour_granularity_enabled']:
                self.process_aggregates(self.six_hour_granularity, gdax_config['six_hour_granularity_start_date'])
            if gdax_config['hour_granularity_enabled']:
                self.process_aggregates(self.hour_granularity, gdax_config['hour_granularity_start_date'])
            if gdax_config['fifteen_minute_granularity_enabled']:
                self.process_aggregates(self.fifteen_minute_granularity, gdax_config['fifteen_minute_granularity_start_date'])
            if gdax_config['five_minute_granularity_enabled']:
                self.process_aggregates(self.five_minute_granularity, gdax_config['five_minute_granularity_start_date'])
            if gdax_config['minute_granularity_enabled']:
                self.process_aggregates(self.minute_granularity, gdax_config['minute_granularity_start_date'])

            time.sleep(10.0)

    def process_pairs(self):
        last_crypto_pair_pull = self.extractor_metadata_data_access.get_last_run_time(self.extractor_name,
                                                                                          gdax_config['uri'],
                                                                                          self.gdax_product_data_access.route)

        if database_configuration['gdax_data_clean_database'] or last_crypto_pair_pull is None or last_crypto_pair_pull + datetime.timedelta(
                milliseconds=self.gdax_product_data_access.staleness_in_millis) < datetime.datetime.now(datetime.timezone.utc):

            start = datetime.datetime.now(datetime.timezone.utc)
            self.extractor_metadata_data_access.register_run(
                self.extractor_name,
                gdax_config['uri'],
                0,
                self.gdax_product_data_access.route,
                start,
                None
            )

            print("[GDAXExtractionProcessor] Pulling product listings.")
            self.gdax_data_access.persist_pairs(self.gdax_product_data_access.get_products())

            end_time = datetime.datetime.now(datetime.timezone.utc)
            self.extractor_metadata_data_access.register_run(
                self.extractor_name,
                gdax_config['uri'],
                0,
                self.gdax_product_data_access.route,
                start,
                end_time
            )

    def process_aggregates(self, grainularity, start_date):
        last_gdax_pull = self.extractor_metadata_data_access.get_last_run_time(self.extractor_name, 'Aggregates-{0}'.format(grainularity), None)

        current_time = datetime.datetime.now(datetime.timezone.utc)
        targetted_run_time = last_gdax_pull + datetime.timedelta(
                milliseconds=gdax_config['time_between_pulls_in_millis' + str(grainularity)])
        if database_configuration['gdax_data_clean_database'] or database_configuration['gdax_data_clean_database'] or last_gdax_pull is None or targetted_run_time < current_time:

            gdax_lookback_start = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
            target_end_date = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)).date()

            start_time = datetime.datetime.now(datetime.timezone.utc)
            self.extractor_metadata_data_access.register_run(
                self.extractor_name,
                'Aggregates-{0}'.format(grainularity),
                0,
                None,
                start_time,
                None
            )

            print("[GDAXExtractionProcessor] Pulling GDAX prices.")
            pairs_to_aggregate = self.gdax_data_access.get_gdax_price_pull_history(grainularity)
            for pair in pairs_to_aggregate:
                if pair['start_date'] is None or pair['end_date'] is None:
                    print("[GDAXExtractionProcessor] Pulling all prices for {0}.".format(pair['pair']))
                    self.process_aggregates_for_pair_range(pair['pair'], grainularity, gdax_lookback_start, target_end_date)
                else:
                    print("[GDAXExtractionProcessor] Pulling range of prices for {0}.".format(pair['pair']))
                    if pair['start_date'] < gdax_lookback_start:
                        start = gdax_lookback_start - datetime.timedelta(days=1)
                        end = pair['start_date']
                        self.process_aggregates_for_pair_range(pair['pair'], grainularity, start, end)
                    if pair['end_date'] < target_end_date:
                        start = pair['end_date'] - datetime.timedelta(days=1)
                        end = target_end_date
                        self.process_aggregates_for_pair_range(pair['pair'], grainularity, start, end)

            end_time = datetime.datetime.now(datetime.timezone.utc)
            self.extractor_metadata_data_access.register_run(
                self.extractor_name,
                'Aggregates-{0}'.format(grainularity),
                0,
                None,
                start_time,
                end_time
            )

    def process_aggregates_for_pair_range(self, pair, timespan, start, end):

        max_seconds_for_pull = timespan * gdax_config['max_historic_rate_per_pull']
        max_days_for_pull = math.ceil(max_seconds_for_pull/86400.0)
        while start < end:
            range_end = end
            if start + datetime.timedelta(days=max_days_for_pull) < end:
                range_end = start + datetime.timedelta(days=max_days_for_pull)

            print("[GDAXExtractionProcessor] Pulling prices for pair {0}. Range {1} to {2}.".format(pair, start, range_end))
            try:
                df = get_data_gdax(pair, granularity=timespan, start=datetime.datetime.fromordinal(start.toordinal()), end=datetime.datetime.fromordinal(range_end.toordinal()))

                self.gdax_data_access.persist_pair_price_results(pair, timespan,
                                                                    df[['Open', 'High', 'Low', 'Close', 'Volume']])
            except Exception as e:
                print("An error has occurred pulling gdax pair prices.", e)

            self.gdax_data_access.persist_pair_price_pull_history(pair, timespan, start, range_end)

            start = range_end