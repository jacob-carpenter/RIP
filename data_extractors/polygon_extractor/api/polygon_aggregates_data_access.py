from config import polygon_io_api_config

from polygon import RESTClient

# https://polygon.io/docs/#get_v2_aggs_ticker__ticker__range__multiplier___timespan___from___to__anchor
class PolygonAggregatesDataAccess:
    staleness_in_millis = 24 * 60 * 60 * 1000
    route = '/v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}'

    def get_aggregates(self, ticker, from_date, to_date, timespan_multiplier=1, timespan='day'):
        with RESTClient(polygon_io_api_config['api_key']) as client:
            resp = client.stocks_equities_aggregates(ticker, timespan_multiplier, timespan, from_date, to_date)
            return resp
