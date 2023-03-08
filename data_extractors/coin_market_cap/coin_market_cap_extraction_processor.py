from config import coin_market_cap_api_config

from metadata.data_access.extractor_metadata_data_access import ExtractorMetadataDataAccess
from coin_market_cap.data_access.coin_market_raw_data_access import CoinMarketRawDataAccess
from coin_market_cap.api.coin_market_cap_api_key_info_data_access import CoinMarketCapApiKeyInfoDataAccess
from coin_market_cap.api.coin_market_cap_listings_latest_data_access import CoinMarketCapListingsLatestDataAccess

import datetime
import time
import math

# https://sandbox.coinmarketcap.com/account
class CoinMarketCapExtractionProcessor:
    extractor_name = "COIN_MARKET_CAP"

    milliseconds_in_a_day = 24 * 60 * 60 * 1000
    milliseconds_in_a_minute = 60 * 1000

    # API Integrations
    coin_market_cap_api_key_info_data_access = None
    coin_market_cap_listings_latest_data_access = None

    extractor_metadata_data_access = None
    coin_market_cap_raw_data_access = None

    def initialize(self, clean=0):
        self.coin_market_cap_raw_data_access = CoinMarketRawDataAccess()
        self.coin_market_cap_raw_data_access.migrate(clean)

        self.coin_market_cap_api_key_info_data_access = CoinMarketCapApiKeyInfoDataAccess()
        self.coin_market_cap_listings_latest_data_access = CoinMarketCapListingsLatestDataAccess()
        self.extractor_metadata_data_access = ExtractorMetadataDataAccess()

    def process(self):
        if self.coin_market_cap_raw_data_access is None:
            raise RuntimeError("Please initialize the CoinMarketCapExtractionProcessor prior to processing.")

        # Get API Limits
        plan_usage = self.coin_market_cap_api_key_info_data_access.get_plan_usage()
        api_throttling = self.determine_api_throttling(plan_usage)

        print("[CoinMarketCapExtractionProcessor] Determined api throttle to be " + str(api_throttling) + ".")

        last_latest_listing_pull = self.extractor_metadata_data_access.get_last_run_time(self.extractor_name,
            coin_market_cap_api_config['uri'],
            self.coin_market_cap_listings_latest_data_access.route)

        while True:
            run_latest_listing_pull = False
            iteration_api_calls = 0
            iteration_cost = 0

            # Iteration cost calculations
            latest_listing_delay_in_millis = math.ceil(self.coin_market_cap_listings_latest_data_access.suggested_time_between_pulls_in_millis / api_throttling)
            if last_latest_listing_pull is None or last_latest_listing_pull+datetime.timedelta(milliseconds=latest_listing_delay_in_millis) < datetime.datetime.now(datetime.timezone.utc):
                run_latest_listing_pull = True
                iteration_api_calls += 1
                iteration_cost += self.coin_market_cap_listings_latest_data_access.cost

            if (plan_usage.minute_requests_left is not None and plan_usage.minute_requests_left < iteration_api_calls) or (plan_usage.day_credits_left is not None and plan_usage.day_credits_left < iteration_cost):
                run_latest_listing_pull = False

            # Process latest listings
            if run_latest_listing_pull:
                last_latest_listing_pull = datetime.datetime.now(datetime.timezone.utc)
                self.process_latest_listings(plan_usage)

            plan_usage = self.coin_market_cap_api_key_info_data_access.get_plan_usage()

            time.sleep(60.0)

    def determine_api_throttling(self, plan_usage):
        daily_api_limit = plan_usage.credit_limit_daily
        daily_api_throttling = 1.0
        minute_api_limit = plan_usage.minute_requests_left
        minute_api_throttling = 1.0

        # Calculate API costs to figure out 'real' polling times
        total_cost_per_minute_array = [1]
        total_cost_per_day_array = []

        # Latest Listing Costs
        latest_listing_cost_per_minute = math.ceil(
            self.milliseconds_in_a_minute / self.coin_market_cap_listings_latest_data_access.suggested_time_between_pulls_in_millis)
        latest_listing_cost_per_day = self.coin_market_cap_listings_latest_data_access.cost * (math.ceil(
            self.milliseconds_in_a_day / self.coin_market_cap_listings_latest_data_access.suggested_time_between_pulls_in_millis))
        total_cost_per_minute_array.append(latest_listing_cost_per_minute)
        total_cost_per_day_array.append(latest_listing_cost_per_day)

        total_cost_per_minute = 0
        for cost in total_cost_per_minute_array:
            total_cost_per_minute += cost

        total_cost_per_day = 0
        for cost in total_cost_per_day_array:
            total_cost_per_day += cost

        if minute_api_limit is not None and total_cost_per_minute > minute_api_limit:
            minute_api_throttling = minute_api_limit / (total_cost_per_minute * 1.0)

        if daily_api_limit is not None and total_cost_per_day > daily_api_limit:
            daily_api_throttling = daily_api_limit / (total_cost_per_day * 1.0)

        return min(minute_api_throttling, daily_api_throttling)

    def process_latest_listings(self, plan_usage):
        start = datetime.datetime.now(datetime.timezone.utc)
        self.extractor_metadata_data_access.register_run(
            self.extractor_name,
            coin_market_cap_api_config['uri'],
            self.coin_market_cap_listings_latest_data_access.cost,
            self.coin_market_cap_listings_latest_data_access.route,
            start,
            None
        )

        print("[CoinMarketCapExtractionProcessor] Persisting latest listings.")
        self.coin_market_cap_raw_data_access.persist_latest_listings(self.coin_market_cap_listings_latest_data_access.get_listings(plan_usage))

        end_time = datetime.datetime.now(datetime.timezone.utc)
        self.extractor_metadata_data_access.register_run(
            self.extractor_name,
            coin_market_cap_api_config['uri'],
            self.coin_market_cap_listings_latest_data_access.cost,
            self.coin_market_cap_listings_latest_data_access.route,
            start,
            end_time
        )