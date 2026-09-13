// pnpm gen schema <name> — src/<name>/{row,create,patch,index}.ts 생성
export default function (plop) {
  plop.setGenerator('schema', {
    description: '새 모듈 스키마 (row / create / patch)',
    prompts: [{ type: 'input', name: 'name', message: '모듈 이름 (kebab-case, 예: habits)' }],
    actions: [
      {
        type: 'add',
        path: 'src/{{kebabCase name}}/index.ts',
        templateFile: 'plop-templates/schema/index.ts.hbs',
      },
      {
        type: 'append',
        path: 'src/index.ts',
        pattern: /(\/\/ modules)/,
        template: "export * from './{{kebabCase name}}/index.js';",
      },
    ],
  });
}
