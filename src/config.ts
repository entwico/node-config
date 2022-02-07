import { readFileSync } from 'fs';
import { get, merge, set } from 'lodash';
import { extname, resolve } from 'path';
import { parse as parseYaml } from 'yaml';
import { flattenProps } from './decorators';

function readConfigFile(path: string) {
  path = resolve(path);

  switch (extname(path)) {
    case '.yml': case '.yaml': return parseYaml(readFileSync(path, 'utf8'));
    case '.js': case '.json': return require(resolve(path));
    // TODO dotenv
    default: throw new Error('Config file format unknown for ' + path);
  }
}

function coerceBoolean(string: string) {
  if (string === 'true' || string === '1') {
    return true;
  }

  if (string === 'false' || string === '0') {
    return false;
  }

  return null;
}

export interface LoadConfigSettings {
  env: {
    prefix: string;
  };
  files: string[];
}

export function loadConfig<T>(configClass: new () => T, { env, files }: LoadConfigSettings) {
  const result = new configClass();
  const fromFiles = {};

  files.forEach(p => merge(fromFiles, readConfigFile(p)));

  const props = flattenProps(configClass);

  props.forEach(prop => {
    const value = get(fromFiles, prop.key);

    if (value !== undefined) {
      switch (prop.type) {
        case 'string': set(result as any, prop.key, String(value)); break;
        case 'number': set(result as any, prop.key, Number(value)); break;
        case 'boolean': set(result as any, prop.key, Boolean(value)); break;
        case 'unknown': set(result as any, prop.key, value); break;
      }
    }
  });

  props.forEach(prop => {
    const envName = (env.prefix + prop.key.replace(/\./g, '_')).toUpperCase();
    const stringVal = process.env[envName];

    if (stringVal !== undefined) {
      switch (prop.type) {
        case 'string': set(result as any, prop.key, String(stringVal)); break;
        case 'number': set(result as any, prop.key, Number(stringVal)); break;
        case 'boolean': set(result as any, prop.key, coerceBoolean(stringVal)); break;
        case 'unknown': break; // cannot be converted from string w/o knowledge about the type
      }
    }
  })

  return result;
}
