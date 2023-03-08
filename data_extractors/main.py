from coin_market_cap.coin_market_cap_extraction_processor import CoinMarketCapExtractionProcessor
from datahub.datahub_extraction_processor import DatahubExtractionProcessor
from polygon_extractor.crypto.polygon_crypto_extraction_processor import PolygonCryptoExtractionProcessor
from yahoo.yahoo_data_extraction_processor import YahooExtractionProcessor
from coin_base.gdax_data_extraction_processor import GDAXExtractionProcessor
from metadata.data_access.extractor_metadata_data_access import ExtractorMetadataDataAccess
from sanitization.sanitization_processor import SanitizationProcessor
from config import extractor_enablement, database_configuration
from threading import Thread

from polygon_extractor.data_access.polygon_raw_data_access import PolygonRawDataAccess

extractor_metadata_data_access = ExtractorMetadataDataAccess()
coin_market_cap_extraction_processor = CoinMarketCapExtractionProcessor()
polygon_crypto_extraction_processor = PolygonCryptoExtractionProcessor()
datahub_extraction_processor = DatahubExtractionProcessor()
yahoo_extraction_processor = YahooExtractionProcessor()
gdax_extraction_processor = GDAXExtractionProcessor()
sanitization_processor = SanitizationProcessor()

def ProcessCoinMarketExtractor():
    coin_market_cap_extraction_processor.process()

def ProcessDatahubExtractor():
    datahub_extraction_processor.process()

def ProcessPolygonCryptoExtractor():
    polygon_crypto_extraction_processor.process()

def YahooExtractionProcessor():
    yahoo_extraction_processor.process()

def GDAXExtractionProcessor():
    gdax_extraction_processor.process()

def SanitizationProcessor():
    sanitization_processor.process()

if __name__ == '__main__':
    extractor_metadata_data_access.migrate(clean=database_configuration['extractor_metadata_clean_database'])

    coin_market_cap_extraction_processor_thread = None
    if extractor_enablement['coin_market_cap_extractor_enabled']:
        coin_market_cap_extraction_processor_thread = Thread(target = ProcessCoinMarketExtractor, args=[])
        print("[ProcessCoinMarketExtractor] Initializing the Extractor.")
        coin_market_cap_extraction_processor.initialize(clean=database_configuration['coin_market_cap_clean_database'])

        print("[ProcessCoinMarketExtractor] Running the Extractor.")
        coin_market_cap_extraction_processor_thread.start()

    datahub_extraction_processor_thread = None
    if extractor_enablement['datahub_extractor_enabled']:
        datahub_extraction_processor_thread = Thread(target=ProcessDatahubExtractor, args=[])

        print("[ProcessDatahubExtractor] Initializing the Extractor.")
        datahub_extraction_processor.initialize(clean=database_configuration['datahub_clean_database'])

        print("[ProcessDatahubExtractor] Running the Extractor.")
        datahub_extraction_processor_thread.start()

    yahoo_extraction_processor_thread = None
    if extractor_enablement['yahoo_extractor_enabled']:
        yahoo_extraction_processor_thread = Thread(target=YahooExtractionProcessor, args=[])

        print("[ProcessYahooExtractor] Initializing the Extractor.")
        yahoo_extraction_processor.initialize(clean=database_configuration['yahoo_data_clean_database'])

        print("[ProcessYahooExtractor] Running the Extractor.")
        yahoo_extraction_processor_thread.start()

    gdax_extraction_processor_thread = None
    if extractor_enablement['gdax_extractor_enabled']:
        gdax_extraction_processor_thread = Thread(target=GDAXExtractionProcessor, args=[])

        print("[ProcessGDAXExtractor] Initializing the Extractor.")
        gdax_extraction_processor.initialize(clean=database_configuration['gdax_data_clean_database'])

        print("[ProcessGDAXExtractor] Running the Extractor.")
        gdax_extraction_processor_thread.start()

    sanitization_processor_thread = None
    if extractor_enablement['sanitization_enabled']:
        sanitization_processor_thread = Thread(target=SanitizationProcessor, args=[])

        print("[SanitizationExtractor] Running the Sanitizer.")
        sanitization_processor_thread.start()

    # Polygon Extractors
    polygon_raw_data_access = PolygonRawDataAccess()
    polygon_raw_data_access.migrate(database_configuration['polygon_io_clean_database'])

    polygon_crypto_extraction_processor_thread = None
    if extractor_enablement['polygon_io_crypto_extractor_enabled']:
        polygon_crypto_extraction_processor_thread = Thread(target=ProcessPolygonCryptoExtractor, args=[])

        print("[ProcessPolygonHistoricalCryptoExtractor] Initializing the Extractor.")
        polygon_crypto_extraction_processor.initialize(clean=database_configuration['polygon_io_crypto_clean_database'])

        print("[ProcessPolygonHistoricalCryptoExtractor] Running the Extractor.")
        polygon_crypto_extraction_processor_thread.start()

    # Start up other threads

    if coin_market_cap_extraction_processor_thread:
        coin_market_cap_extraction_processor_thread.join()

    if datahub_extraction_processor_thread:
        datahub_extraction_processor_thread.join()

    if yahoo_extraction_processor_thread:
        yahoo_extraction_processor_thread.join()

    if gdax_extraction_processor_thread:
        gdax_extraction_processor_thread.join()

    if polygon_crypto_extraction_processor_thread:
        polygon_crypto_extraction_processor_thread.join()

    if sanitization_processor_thread:
        sanitization_processor_thread.join()

    print("[Extractor] Completed!")


