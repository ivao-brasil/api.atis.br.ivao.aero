import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DATABASE_HOST || 'localhost',
        port: +(process.env.DATABASE_PORT || 3306),
        username: process.env.DATABASE_USERNAME || 'root',
        password: process.env.DATABASE_PASSWORD || 'root',
        database: process.env.DATABASE_SCHEMA || 'brivao_atis',
        entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: false,
      });

      return dataSource.initialize();
    },
  },
];