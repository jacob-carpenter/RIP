from config import polygon_io_api_config, database_configuration

from polygon_extractor.crypto.data_access.polygon_crypto_raw_data_access import PolygonCryptoRawDataAccess
from polygon_extractor.data_access.polygon_raw_data_access import PolygonRawDataAccess

import datetime
import time
import json

import signal

from polygon import WebSocketClient, CRYPTO_CLUSTER

# https://polygon.io/dashboard

polygon_raw_data_access = PolygonRawDataAccess()
event_pair_last_persistence_time = dict()

def process_message(raw_message):
    messages = json.loads(raw_message)
    for message in messages:
        if message['ev'] not in ('XQ', 'XT', 'XA', 'XL2'):
            print("Retrieved message which is not being processed.", raw_message)
            return

        try:
            key = "{0}.{1}".format(message['ev'], message['pair'])
            load_record = True
            if key in event_pair_last_persistence_time \
                    and event_pair_last_persistence_time[key] + datetime.timedelta(milliseconds=polygon_io_api_config['crypto_realtime_minimum_time_between_writes_in_millis']) >= datetime.datetime.now(datetime.timezone.utc):
                load_record = False

            if load_record:
                if message['ev'] == 'XQ':
                    polygon_raw_data_access.persist_realtime_quote(
                        message['pair'],
                        message['lp'],
                        message['ls'],
                        message['bp'],
                        message['bs'],
                        message['ap'],
                        message['as'],
                        datetime.datetime.fromtimestamp(float(message['t']) / 1000, datetime.timezone.utc),
                        message['x'],
                        datetime.datetime.fromtimestamp(float(message['r']) / 1000, datetime.timezone.utc)
                    )
                if message['ev'] == 'XA':
                    polygon_raw_data_access.persist_realtime_aggregate(
                        message['pair'],
                        datetime.datetime.fromtimestamp(float(message['s']) / 1000, datetime.timezone.utc),
                        datetime.datetime.fromtimestamp(float(message['e']) / 1000, datetime.timezone.utc),
                        message['o'],
                        message['h'],
                        message['l'],
                        message['c'],
                        message['v']
                    )

                event_pair_last_persistence_time[key] = datetime.datetime.now(datetime.timezone.utc)
        except Exception as e:
            print(e)
            raise e


def handle_error(ws, error):
    print("Polygon crypto realtime extraction experienced an error.", error)

def close(ws):
    print("Closing polygon crypto realtime extraction.")

class PolygonCryptoRealtimeExtractionProcessor:
    def __init__(self):
        self.polygon_crypto_raw_data_access = PolygonCryptoRawDataAccess()
        self.polygon_raw_data_access = PolygonRawDataAccess()

    def signal_noop(self, type, function):
        i = 0

    def run(self):
        # Hack around a bad client setup
        signal.signal = self.signal_noop

        my_client = WebSocketClient(CRYPTO_CLUSTER, polygon_io_api_config['api_key'], process_message)
        my_client.run_async()

        realtime_quote_pairs = polygon_io_api_config['crypto_realtime_quote_pairs']
        if polygon_io_api_config['crypto_realtime_quote_additional_top_pair_count'] > 0:
            for pair in self.polygon_raw_data_access.get_top_pairs(polygon_io_api_config['crypto_realtime_quote_additional_top_pair_count']):
                realtime_quote_pairs.append(pair)

        realtime_trade_pairs = polygon_io_api_config['crypto_realtime_trade_pairs']
        if polygon_io_api_config['crypto_realtime_trade_additional_top_pair_count'] > 0:
            for pair in self.polygon_raw_data_access.get_top_pairs(
                    polygon_io_api_config['crypto_realtime_trade_additional_top_pair_count']):
                realtime_trade_pairs.append(pair)

        realtime_aggregate_pairs = polygon_io_api_config['crypto_realtime_aggregate_pairs']
        if polygon_io_api_config['crypto_realtime_aggregate_additional_top_pair_count'] > 0:
            for pair in self.polygon_raw_data_access.get_top_pairs(
                    polygon_io_api_config['crypto_realtime_aggregate_additional_top_pair_count']):
                realtime_aggregate_pairs.append(pair)

        realtime_level2_pairs = polygon_io_api_config['crypto_realtime_level2_aggregate_pairs']
        if polygon_io_api_config['crypto_realtime_level2_aggregate_additional_top_pair_count'] > 0:
            for pair in self.polygon_raw_data_access.get_top_pairs(
                    polygon_io_api_config['crypto_realtime_level2_aggregate_additional_top_pair_count']):
                realtime_level2_pairs.append(pair)

        subscribed_pairs = []
        for pair in realtime_quote_pairs:
            subscribed_pairs.append("XQ.{0}".format(pair))
        for pair in realtime_trade_pairs:
            subscribed_pairs.append("XT.{0}".format(pair))
        for pair in realtime_aggregate_pairs:
            subscribed_pairs.append("XA.{0}".format(pair))
        for pair in realtime_level2_pairs:
            subscribed_pairs.append("XL2.{0}".format(pair))

        my_client.subscribe(*subscribed_pairs)
        while True:
            time.sleep(60.0)

