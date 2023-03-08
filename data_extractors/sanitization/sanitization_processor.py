from config import sanitized_market_sql_database_config
import pyodbc
import time

class SanitizationProcessor:
    def process(self):
        while True:
            cnxn = pyodbc.connect(sanitized_market_sql_database_config['odbc_connection'])

            cursor = cnxn.cursor()
            cursor.execute('''
                                EXEC [dbo].[SanitizeCryptoPrices]
                           '''
            )

            cnxn.commit()

            time.sleep(1.0)
