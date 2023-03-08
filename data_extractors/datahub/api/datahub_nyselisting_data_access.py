from config import datahub_api_config

from datapackage import Package
import datetime
import time
import math

class DatahubNyseListingDataAccess:
    route = 'core/nyse-other-listings/datapackage.json'

    def get_listings(self):
        package = Package('{0}/{1}'.format(datahub_api_config['uri'], self.route))

        # print list of all resources:
        print(package.resource_names)

        # print processed tabular data (if exists any)
        for resource in package.resources:
            if resource.descriptor['datahub']['type'] == 'source/tabular' and resource.descriptor['name'] == 'other-listed':
                return resource.read(keyed=True)


