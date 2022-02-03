import 'reflect-metadata';
import { loadConfig } from "../src/config";
import { join } from 'path';
import { Property } from '../src/decorators';

class SubGroup {
  @Property() prop1: string;
  @Property() prop2: boolean;
  @Property() prop3: number;
}

class Group {
  @Property() subgroup: SubGroup;
  @Property() prop4: string;
}

class Config {
  @Property() group: Group;
  @Property() prop5: string;
}

let originalEnv = process.env;

beforeEach(() => process.env = { ...process.env });
afterEach(() => process.env = originalEnv);

test('reads config from files', () => {
  const paths = [
    join(__dirname, 'files', 'conf1.yaml'),
    join(__dirname, 'files', 'conf2.js'),
    join(__dirname, 'files', 'conf3.json'),
  ];

  const conf = loadConfig(Config, { env: { prefix: '' }, files: paths },);

  expect(conf.group?.subgroup?.prop1).toBe('string-yaml');
  expect(conf.group?.subgroup?.prop2).toBe(true);
  expect(conf.group?.subgroup?.prop3).toBe(12);
  expect(conf.group?.prop4).toBe('string-js');
  expect(conf.prop5).toBe('string-json');
});

test('reads config from environment variables', () => {
  process.env.APP_GROUP_SUBGROUP_PROP1 = 'env-override';
  process.env.APP_GROUP_SUBGROUP_PROP2 = 'false';
  process.env.APP_GROUP_SUBGROUP_PROP3 = '13';
  process.env.APP_GROUP_PROP4 = 'env-override';
  process.env.APP_PROP5 = 'env-override';

  const paths = [join(__dirname, 'files', 'conf1.yaml')];

  const conf = loadConfig(Config, { env: { prefix: 'APP_' }, files: paths },);

  expect(conf.group?.subgroup?.prop1).toBe('env-override');
  expect(conf.group?.subgroup?.prop2).toBe(false);
  expect(conf.group?.subgroup?.prop3).toBe(13);
  expect(conf.group?.prop4).toBe('env-override');
  expect(conf.prop5).toBe('env-override');
});

test('throws on unknown file types', () => {
  expect(() => loadConfig(Config, { env: { prefix: '' }, files: ['conf1.ts'] })).toThrow();
  expect(() => loadConfig(Config, { env: { prefix: '' }, files: ['conf1.avi'] })).toThrow();
  expect(() => loadConfig(Config, { env: { prefix: '' }, files: ['conf1.jpg'] })).toThrow();
});
