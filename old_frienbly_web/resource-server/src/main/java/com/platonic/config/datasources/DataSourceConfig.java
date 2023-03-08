package com.platonic.config.datasources;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.init.DataSourceInitializer;
import org.springframework.jdbc.datasource.init.DatabasePopulator;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Value("classpath:databases/auth/auth_schema.sql")
    private Resource initializeAuthDatabaseScript;
    @Value("classpath:databases/auth/auth_schema_seed.sql")
    private Resource seedAuthScript;
    @Value("classpath:databases/frienbly/frienbly_schema.sql")
    private Resource initializeApiDatabaseScript;

    @Value("${reset.auth.database}")
    private boolean resetAuthDatabase;
    @Value("${reset.api.database}")
    private boolean resetApiDatabase;

    @Value("${jdbc.driverClassName}")
    private String jdbcDriverClassName;

    @Value("${jdbc.url}")
    private String jdbcUrl;

    @Value("${jdbc.user}")
    private String jdbcUser;

    @Value("${jdbc.pass}")
    private String jdbcPass;

    @Bean
    @Primary
    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();

        dataSource.setDriverClassName(jdbcDriverClassName);
        dataSource.setUrl(jdbcUrl);
        dataSource.setUsername(jdbcUser);
        dataSource.setPassword(jdbcPass);

        DataSourceInitializer initializer = dataSourceInitializer(dataSource);
        initializer.afterPropertiesSet();

        return dataSource;
    }

    private DataSourceInitializer dataSourceInitializer(DataSource dataSource) {
        DataSourceInitializer initializer = new DataSourceInitializer();
        initializer.setDataSource(dataSource);
        initializer.setDatabasePopulator(databasePopulator());
        initializer.setEnabled(true);
        return initializer;
    }

    private DatabasePopulator databasePopulator() {
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator();

        if (resetAuthDatabase) {
            populator.addScript(initializeAuthDatabaseScript);
        }
        if (resetApiDatabase) {
            populator.addScript(initializeApiDatabaseScript);
        }

        populator.addScript(seedAuthScript);

        return populator;
    }
}
