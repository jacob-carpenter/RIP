from config import polygon_io_api_config

from polygon import RESTClient

import gdax

# https://docs.pro.coinbase.com/#products
class GDAXProductDataAccess:
    staleness_in_millis = 24 * 60 * 60 * 1000
    route = '/products'

    def get_products(self):
        client = gdax.PublicClient()
        return client.get_products()
