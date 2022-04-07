import { set } from 'lodash';
import { getRegisteredDescriptors } from './decorators';
import { ConfigFileProvider } from './config-providers/config-file-provider';
import { ConfigProvider } from './config-providers/config-provider';
import { coerceBoolean, coerceNumber, coerceString } from './utils';
import { ConfigEnvProvider } from './config-providers/config-env-provider';

export interface LoadConfigSettings {
  env: {
    prefix: string;
  };
  files: string[];
}

export interface ConfigContainerConstructor<T> {
  new(): T;
}

export function loadConfig<T>(container: ConfigContainerConstructor<T> | T, { env, files }: LoadConfigSettings) {
  const isFactory = typeof container === 'function';
  const result = !isFactory ? container : new (container as ConfigContainerConstructor<T>)();
  const descriptors = getRegisteredDescriptors((isFactory ? container : container.constructor) as ConfigContainerConstructor<T>);

  const providers: ConfigProvider[] = [
    new ConfigFileProvider(files),
    new ConfigEnvProvider(env.prefix, process.env),
  ];

  providers.forEach(provider => provider.provide().forEach(({ key, value }) => {
    if (value !== undefined) {
      const prop = descriptors.find(p => new RegExp(p.regex, provider.isCaseSensitive() ? '' : 'i').test(key));

      if (prop) {
        let targetKey = key;

        if (!provider.isCaseSensitive()) {
          // convert the case to the correct one
          let replaceGroup = 0;
          const replace = prop.key.replace(/\[\]/g, () => `[$${++replaceGroup}]`);

          targetKey = key.replace(new RegExp(prop.regex, 'i'), replace);
        }

        switch (prop.type) {
          case 'string': set(result as Object, targetKey, coerceString(value)); break;
          case 'number': set(result as Object, targetKey, coerceNumber(value)); break;
          case 'boolean': set(result as Object, targetKey, coerceBoolean(value)); break;

          // setting value as is
          case 'unknown': set(result as Object, targetKey, value); break;
        }
      }
    }
  }));

  return result;
}
