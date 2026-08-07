const { spawnSync } = require('node:child_process');

const command = process.argv[2];
const name = process.argv[3];

const dataSource = 'src/database/data-source.ts';
const migrationsPath = 'src/database/migrations';

const commands = {
  run: ['migration:run', '-d', dataSource],
  revert: ['migration:revert', '-d', dataSource],
  show: ['migration:show', '-d', dataSource],
  generate: name
    ? ['migration:generate', `${migrationsPath}/${name}`, '-d', dataSource]
    : null,
  create: name ? ['migration:create', `${migrationsPath}/${name}`] : null,
};

if (!commands[command]) {
  console.error(
    'Usage:\n' +
      'npm run migration run\n' +
      'npm run migration revert\n' +
      'npm run migration show\n' +
      'npm run migration generate MigrationName\n' +
      'npm run migration create MigrationName',
  );

  process.exit(1);
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(
  npmCommand,
  ['run', 'typeorm', '--', ...commands[command]],
  {
  stdio: 'inherit',
  },
);

if (result.error) {
  console.error(`Failed to start TypeORM: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  if (command === 'generate') {
    console.error(
      '\nMigration generation did not produce a file. If no schema changes are ' +
        'expected, use "npm run migration:create -- MigrationName" instead.',
    );
  }

  process.exit(result.status ?? 1);
}
