// ESLint flat config.
//
// flat config 에서 rule 은 해당 plugin 이 등록된 범위 안에서만 쓸 수 있다.
// eslint-config-expo 는 `@typescript-eslint` 를 ts/tsx 에만 등록하므로,
// 아래 override 도 같은 범위로 `files` 를 맞춘다. (plugins 를 다시 선언하면
// "Cannot redefine plugin" 으로 터진다.)
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  {
    ignores: ['node_modules/', '.expo/', 'dist/', 'android/', 'ios/', 'expo-env.d.ts'],
  },
  ...expoConfig,
  prettierRecommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // 미사용 변수는 경고까지만 — 작성 중에 흐름을 끊지 않기 위해.
      // `_` 접두사는 의도적 미사용으로 간주한다.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      // import 순서를 고정해 diff 를 안정적으로 유지한다.
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
];
