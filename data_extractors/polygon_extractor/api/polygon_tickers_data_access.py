from config import polygon_io_api_config

from polygon import RESTClient

# https://polygon.io/docs/#get_v2_reference_tickers_anchor
class PolygonTickersDataAccess:
    staleness_in_millis = 24 * 60 * 60 * 1000
    route = '/v2/reference/tickers'

    def get_tickers(self, market: str, pageNum = None, perPage = 50):
        with RESTClient(polygon_io_api_config['api_key']) as client:
            resp = client.reference_tickers(market=market, page=pageNum, perpage=perPage)
            return resp
