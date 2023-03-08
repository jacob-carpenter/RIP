uninstall plugin validate_password;
SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

create database frienbly;

CREATE USER frienbly@localhost IDENTIFIED BY '4P1Pl4t0n1c';
GRANT ALL PRIVILEGES ON frienbly.* TO frienbly@localhost IDENTIFIED BY '4P1Pl4t0n1c';

flush privileges;