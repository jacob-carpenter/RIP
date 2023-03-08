from config import polygon_io_api_config

from polygon import RESTClient

# https://polygon.io/docs/#get_v1_meta_crypto_exchanges_anchor
class PolygonCryptoExchangesDataAccess:
    staleness_in_millis = 24 * 60 * 60 * 1000
    route = '/v1/meta/crypto-exchanges'

    def get_exchanges(self):
        with RESTClient(polygon_io_api_config['api_key']) as client:
            resp = client.crypto_crypto_exchanges()
            return resp
