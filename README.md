# @entwico/node-config

An opinionated implementation of node server configuration.

## Installation

```
npm i @entwico/node-config
```

## Usage

### Config definition

First, describe a config container:

```ts
class SubSub {
  @Property() prop: string;
}

class Sub {
  @Property() sub: SubSub;
  @Property() prop: string;
}

class Config {
  @Property() sub: Sub;
  @Property() prop1: string;
  @Property() prop2: number;
  @Property() prop3: boolean;
  @List(String) strings: string[];
  @List(SubSub) subsubs: SubSub[];
}
```

### Config files

You can pass multiple config files:

```ts
const conf = loadConfig(Config, { env: { prefix: 'APP_' }, files: ['config.yaml'] });
```

The files will override each other's settings (the later the file is in the list, the more priority it will have).

Following file formats supported:

- `.yml` / `.yaml`
- `.js`
- `.json`

Example file:

```yml
sub:
  sub:
    prop: test
  prop: test
prop1: test
prop2: 123
prop3: false
strings:
  - test1
  - test2
subsubs:
  - prop: test
```

### Environment variables

```ts
const conf = loadConfig(Config, { env: { prefix: 'APP_' }, files: paths });
```

The environment variables take precedence over the files' settings.

Examples:

```sh
export APP_SUB_PROP=test # sets conf.sub.prop = 'test'
export APP_STRINGS__0=test # sets conf.strings[0] = 'test'
export APP_SUBSUBS__1__PROP=test # sets conf.subsubs[0].prop = 'test'
```

## License

[MIT](LICENSE)
