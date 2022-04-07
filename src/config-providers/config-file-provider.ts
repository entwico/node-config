import { ConfigProvider } from "./config-provider";
import { get, merge } from "lodash";
import { readFileSync } from 'fs';
import { extname, resolve } from 'path';
import { parse as parseYaml } from 'yaml';
import { getAllPaths } from "../utils";

export class ConfigFileProvider implements ConfigProvider {

  constructor(private files: string[]) {
    this.readConfigFiles(this.files);
  }

  isCaseSensitive() {
    return true;
  }

  provide() {
    const config = this.readConfigFiles(this.files);

    return getAllPaths(config).map(key => ({ key, value: get(config, key) }));
  }

  private readConfigFiles(files: string[]) {
    function readConfigFile(path: string) {
      path = resolve(path);

      switch (extname(path)) {
        case '.yml': case '.yaml': return parseYaml(readFileSync(path, 'utf8'));
        case '.js': case '.json': return require(resolve(path));
        // TODO dotenv
        default: throw new Error('Config file format unknown for ' + path);
      }
    }

    const fromFiles = {};

    files.forEach(p => merge(fromFiles, readConfigFile(p)));

    return fromFiles;
  }

}
