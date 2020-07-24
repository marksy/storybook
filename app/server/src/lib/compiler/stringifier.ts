import dedent from 'ts-dedent';
import { StorybookStory, StorybookSection } from './types';

const { identifier } = require('safe-identifier');

export function stringifyObject(object: any, level = 0, excludeOuterParams = false): string {
  if (typeof object === 'string') {
    return `'${object}'`;
  }
  const indent = '  '.repeat(level);
  if (Array.isArray(object)) {
    const arrayStrings: string[] = object.map((item: any) => stringifyObject(item, level + 1));
    const arrayString = arrayStrings.join(`,\n${indent}  `);
    if (excludeOuterParams) return arrayString;
    return `[\n${indent}  ${arrayString}\n${indent}]`;
  }
  if (typeof object === 'object') {
    let objectString = '';
    if (Object.keys(object).length > 0) {
      const objectStrings: string[] = Object.keys(object).map((key) => {
        const value: string = stringifyObject(object[key], level + 1);
        return `\n${indent}  ${key}: ${value}`;
      });
      objectString = objectStrings.join(',');
    }
    if (excludeOuterParams) return objectString;
    if (objectString.length === 0) return '{}';
    return `{${objectString}\n${indent}}`;
  }

  return object;
}

export function stringifyImports(imports: Record<string, string[]>): string {
  if (Object.keys(imports).length === 0) return '';
  return Object.entries(imports)
    .map(([module, names]) => `import { ${names.sort().join(', ')} } from '${module}';\n`)
    .join('');
}

export function stringifyDecorators(decorators: string[]): string {
  return decorators && decorators.length > 0
    ? `\n  decorators: [\n    ${decorators.join(',\n    ')}\n  ],`
    : '';
}

export function stringifyDefault(section: StorybookSection): string {
  const { title, imports, decorators, stories, ...options } = section;

  const decoratorsString = stringifyDecorators(decorators);

  const optionsString = stringifyObject(options, 0, true);

  return dedent`
  export default {
    title: '${title}',${decoratorsString}${optionsString}
  };
  
  `;
}

export function stringifyStory(story: StorybookStory): string {
  const { name, storyFn, ...options } = story;
  const storyId = identifier(name);

  const optionsString = stringifyObject({ name, ...options }, 0, true);

  const stronyStrings = [
    `export const ${storyId} = ${storyFn};`,
    `${storyId}.storyName = '${name}';`,
  ];

  // if (decorators && decorators.length > 0) {
  //   stronyStrings.push(`${storyId}.decorators = [${decorators.join(',')}];`);
  // }
  Object.keys(options).forEach((key) => {
    stronyStrings.push(`${storyId}.${key} = ${stringifyObject(options[key])};`);
  });
  stronyStrings.push('');

  return stronyStrings.join('\n');
}

export function stringifySection(section: StorybookSection): string {
  const sectionString = [
    stringifyImports(section.imports),
    stringifyDefault(section),
    ...section.stories.map((story) => stringifyStory(story)),
  ].join('\n');

  return sectionString;
}
