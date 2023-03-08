from config import datahub_api_config, database_configuration

from metadata.data_access.extractor_metadata_data_access import ExtractorMetadataDataAccess
from datahub.api.datahub_nasdaqlisting_data_access import DatahubNasdaqListingDataAccess
from datahub.api.datahub_nyselisting_data_access import DatahubNyseListingDataAccess
from datahub.data_access.datahub_raw_data_access import DatahubRawDataAccess

import datetime
import time
import math

class DatahubExtractionProcessor:
    extractor_name = "DATAHUB"

    extractor_metadata_data_access = None
    datahub_nasdaq_listing_data_access = None
    datahub_nyse_listing_data_access = None
    datahub_raw_data_access = None

    def initialize(self, clean=0):
        self.datahub_raw_data_access = DatahubRawDataAccess()
        self.datahub_raw_data_access.migrate(clean)

        self.datahub_nasdaq_listing_data_access = DatahubNasdaqListingDataAccess()
        self.datahub_nyse_listing_data_access = DatahubNyseListingDataAccess()
        self.extractor_metadata_data_access = ExtractorMetadataDataAccess()

    def process(self):
        if self.datahub_raw_data_access is None:
            raise RuntimeError("Please initialize the DatahubExtractionProcessor prior to processing.")

        last_nasdaq_listing_pull = self.extractor_metadata_data_access.get_last_run_time(self.extractor_name,
            datahub_api_config['uri'],
            self.datahub_nasdaq_listing_data_access.route)

        if last_nasdaq_listing_pull is None or database_configuration['datahub_clean_database']:
            self.process_nasdaq_listings()

        last_nyse_listing_pull = self.extractor_metadata_data_access.get_last_run_time(self.extractor_name,
            datahub_api_config['uri'],
            self.datahub_nyse_listing_data_access.route)

        if last_nyse_listing_pull is None or database_configuration['datahub_clean_database']:
            self.process_nyse_listings()

    def process_nasdaq_listings(self):
        start = datetime.datetime.now(datetime.timezone.utc)
        self.extractor_metadata_data_access.register_run(
            self.extractor_name,
            datahub_api_config['uri'],
            0,
            self.datahub_nasdaq_listing_data_access.route,
            start,
            None
        )

        print("[DatahubExtractionProcessor] Pulling nasdaq listings.")
        self.datahub_raw_data_access.persist_nasdaq_listings(self.datahub_nasdaq_listing_data_access.get_listings())

        end_time = datetime.datetime.now(datetime.timezone.utc)
        self.extractor_metadata_data_access.register_run(
            self.extractor_name,
            datahub_api_config['uri'],
            0,
            self.datahub_nasdaq_listing_data_access.route,
            start,
            end_time
        )

    def process_nyse_listings(self):
        start = datetime.datetime.now(datetime.timezone.utc)
        self.extractor_metadata_data_access.register_run(
            self.extractor_name,
            datahub_api_config['uri'],
            0,
            self.datahub_nyse_listing_data_access.route,
            start,
            None
        )

        print("[DatahubExtractionProcessor] Pulling nyse listings.")
        self.datahub_raw_data_access.persist_nyse_listings(self.datahub_nyse_listing_data_access.get_listings())

        end_time = datetime.datetime.now(datetime.timezone.utc)
        self.extractor_metadata_data_access.register_run(
            self.extractor_name,
            datahub_api_config['uri'],
            0,
            self.datahub_nyse_listing_data_access.route,
            start,
            end_time
        )