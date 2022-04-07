import { ConfigProvider } from "./config-provider";

export class ConfigEnvProvider implements ConfigProvider {

  constructor(private prefix: string, private env: typeof process.env) { }

  isCaseSensitive() {
    return false;
  }

  provide() {
    const prefix = this.prefix.toLowerCase();

    return Object.keys(this.env)
      .filter(key => key.toLowerCase().startsWith(prefix))
      .map(key => {
        // turns "PREFIX_FOO_BAR__1__BAZ" into "foo.bar[1].baz"
        const path = key
          .substring(this.prefix.length) // cut off prefix
          .replace(/\_\_(\d)\_\_/g, '[$1].') // turn __0__ into [0].
          .replace(/\_\_(\d)$/g, '[$1]') // turn __0 into [0]
          .replace(/\_/g, '.'); // turn _ into .

        return { key: path, value: this.env[key] };
      });
  }

}
