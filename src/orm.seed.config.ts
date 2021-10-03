import config from './ormconfig';

const ormSeedConfig = {
  ...config,
  migrations: [__dirname + '/seeds/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/seeds',
  },
};
export default ormSeedConfig;
