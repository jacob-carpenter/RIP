# Frienbly_Web

To launch -

* Install mysql 5.7 server.
* Run script in parent/resource-server/src/main/resources/databases/database_initialization
* Set the following properties to true in parent/resource-server/src/main/resources/application.properties
** # Hibernate
** reset.images=false
** reset.auth.database=false
** reset.api.database=false
* Import the parent pom + submodules as a maven project in intellij
* Run the parent/resource-server and parent/messenger-server locally.
* Install npm
* Run 'npm install' from parent/frontend-server/src/main/frontend
* Run 'npm start' from parent/frontend-server/src/main/frontend
* Navigate to localhost:4200
* Profit
