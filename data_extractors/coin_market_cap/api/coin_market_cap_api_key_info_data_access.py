from json.decoder import JSONDecodeError

from config import coin_market_cap_api_config
from requests import Request, Session
from requests.exceptions import ConnectionError, Timeout, TooManyRedirects
from json.decoder import JSONDecodeError
import json

import datetime

# https://coinmarketcap.com/api/documentation/v1/#operation/getV1KeyInfo
class CoinMarketCapApiKeyInfoDataAccess:
    plan_usage = None
    cost = 0
    suggested_time_between_pulls_in_millis = 60000

    last_pull_time = None

    def get_plan_usage(self):
        if self.plan_usage is None or self.last_pull_time is None or self.last_pull_time+datetime.timedelta(milliseconds=self.suggested_time_between_pulls_in_millis) < datetime.datetime.now():
            self.last_pull_time = datetime.datetime.now()

            url = coin_market_cap_api_config['uri'] + '/v1/key/info'
            parameters = {}
            headers = {
                'Accepts': 'application/json',
                'X-CMC_PRO_API_KEY': coin_market_cap_api_config['api_key']
            }

            session = Session()
            session.headers.update(headers)

            try:
                raw_response = session.get(url, params=parameters)
                response = json.loads(raw_response.text)
                plan_usage = PlanUsage()
                plan_usage.credit_limit_daily = response['data']['plan']['credit_limit_daily']
                plan_usage.credit_limit_daily_reset = response['data']['plan']['credit_limit_daily_reset']
                plan_usage.credit_limit_daily_reset_timestamp = response['data']['plan']['credit_limit_daily_reset_timestamp']
                plan_usage.credit_limit_monthly = response['data']['plan']['credit_limit_monthly']
                plan_usage.credit_limit_monthly_reset = response['data']['plan']['credit_limit_monthly_reset']
                plan_usage.credit_limit_monthly_reset_timestamp = response['data']['plan']['credit_limit_monthly_reset_timestamp']
                plan_usage.rate_limit_minute = response['data']['plan']['rate_limit_minute']
                plan_usage.minute_requests_made = response['data']['usage']['current_minute']['requests_made'] + 1
                if response['data']['usage']['current_minute']['requests_left'] is not None:
                    plan_usage.minute_requests_left = response['data']['usage']['current_minute']['requests_left'] - 1
                else:
                    plan_usage.minute_requests_left = 59
                plan_usage.day_credits_used = response['data']['usage']['current_day']['credits_used']
                plan_usage.day_credits_left = response['data']['usage']['current_day']['credits_left']
                plan_usage.month_credits_used = response['data']['usage']['current_month']['credits_used']
                plan_usage.month_credits_left = response['data']['usage']['current_month']['credits_left']

                self.plan_usage = plan_usage
            except (ConnectionError, Timeout, TooManyRedirects, JSONDecodeError) as e:
                print(e)

        return self.plan_usage

class PlanUsage:
    def init(self):
        self.credit_limit_daily = 0
        self.credit_limit_daily_reset = 0
        self.credit_limit_daily_reset_timestamp = 0
        self.credit_limit_monthly = 0
        self.credit_limit_monthly_reset = 0
        self.credit_limit_monthly_reset_timestamp = 0
        self.rate_limit_minute = 0
        self.minute_requests_made = 0
        self.minute_requests_left = 0
        self.day_credits_used = 0
        self.day_credits_left = 0
        self.month_credits_used = 0
        self.month_credits_left = 0

    def use(self, cost):
        if self.day_credits_used:
            self.day_credits_used += cost
        if self.day_credits_left:
            self.day_credits_left -= cost
        if self.minute_requests_made:
            self.minute_requests_made += 1
        if self.minute_requests_left:
            self.minute_requests_left -= 1
        if self.month_credits_used:
            self.month_credits_used += cost
        if self.month_credits_left:
            self.month_credits_left -= cost
