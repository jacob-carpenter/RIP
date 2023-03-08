from config import raw_market_sql_database_config
import pyodbc
from typing import List

from polygon.rest.models.definitions import CryptoExchange, Symbol
import datetime


class PolygonCryptoRawDataAccess:

    def clean(self):
        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
                        select 1;
                       ''')

        cnxn.commit()

    def migrate(self, clean=0):
        if clean:
            self.clean()

        cnxn = pyodbc.connect(raw_market_sql_database_config['odbc_connection'])

        cursor = cnxn.cursor()
        cursor.execute('''
            
                        select 1;

                        ''')

        cnxn.commit()
