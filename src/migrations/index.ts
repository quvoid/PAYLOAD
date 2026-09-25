import * as migration_20260925_203152_initial from './20260925_203152_initial';

export const migrations = [
  {
    up: migration_20260925_203152_initial.up,
    down: migration_20260925_203152_initial.down,
    name: '20260925_203152_initial'
  },
];
