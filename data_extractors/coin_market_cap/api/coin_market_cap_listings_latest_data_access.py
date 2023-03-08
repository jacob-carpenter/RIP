from config import coin_market_cap_api_config
from requests import Request, Session
from requests.exceptions import ConnectionError, Timeout, TooManyRedirects
from json.decoder import JSONDecodeError
import json
import math
import datetime

# https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyListingsLatest
class CoinMarketCapListingsLatestDataAccess:
    cost = 2 * math.ceil((coin_market_cap_api_config['listing_latest_number_of_currencies'] / 200.0)) * len(coin_market_cap_api_config['listing_latest_conversions'])
    route = '/v1/cryptocurrency/listings/latest'

    suggested_time_between_pulls_in_millis = coin_market_cap_api_config['listing_latest_time_between_pulls_in_millis']

    def get_listings(self, planUsage):
        planUsage.use(self.cost)

        listings = []
        for conversion in coin_market_cap_api_config['listing_latest_conversions']:
            url = coin_market_cap_api_config['uri'] + self.route
            parameters = {
                'start': '1',
                'limit': coin_market_cap_api_config['listing_latest_number_of_currencies'],
                'convert': conversion
            }
            headers = {
                'Accepts': 'application/json',
                'X-CMC_PRO_API_KEY': coin_market_cap_api_config['api_key']
            }

            session = Session()
            session.headers.update(headers)

            try:
                response = session.get(url, params=parameters)
                data = json.loads(response.text)

                for raw_listing in data['data']:
                    listing = Listing()
                    listing.coin_id = raw_listing['id']
                    listing.name = raw_listing['name']
                    listing.symbol = raw_listing['symbol']
                    listing.slug = raw_listing['slug']
                    listing.cmc_rank = raw_listing['cmc_rank']
                    listing.num_market_pairs = raw_listing['num_market_pairs']
                    listing.circulating_supply = raw_listing['circulating_supply']
                    listing.total_supply = raw_listing['total_supply']
                    listing.max_supply = raw_listing['max_supply']
                    listing.last_updated = raw_listing['last_updated']
                    listing.date_added = raw_listing['date_added']

                    for raw_quote_key in raw_listing['quote']:
                        quote = PriceQuote()

                        quote.unit = raw_quote_key
                        raw_quote = raw_listing['quote'][raw_quote_key]
                        quote.price = raw_quote['price']
                        quote.volume_24h = raw_quote['volume_24h']
                        quote.percent_change_1h = raw_quote['percent_change_1h']
                        quote.percent_change_24h = raw_quote['percent_change_24h']
                        quote.percent_change_7d = raw_quote['percent_change_7d']
                        quote.market_cap = raw_quote['market_cap']
                        quote.last_updated = raw_quote['last_updated']

                        listing.price_quotes.append(quote)

                    listings.append(listing)

            except (ConnectionError, Timeout, TooManyRedirects, JSONDecodeError) as e:
                print(e)

        return listings

class Listing:
    def __init__(self):
        self.coin_id = 0
        self.name = ''
        self.symbol = ''
        self.slug = ''
        self.cmc_rank = 0
        self.num_market_pairs = 0
        self.circulating_supply = 0
        self.total_supply = 0
        self.max_supply = 0
        self.last_updated = ''
        self.date_added = ''
        self.price_quotes = []

class PriceQuote:
    def __init__(self):
        self.unit = ''
        self.price = 0
        self.volume_24h = 0
        self.percent_change_1h = 0
        self.percent_change_24h = 0
        self.percent_change_7d = 0
        self.market_cap = 0
        self.last_updated = ''