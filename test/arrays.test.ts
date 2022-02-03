import 'reflect-metadata';
import { loadConfig } from "../src/config";
import { join } from 'path';
import { List, Property } from '../src/decorators';

class Item {
  @Property() prop1: string;
}

class Config {
  @List(String) props1: string[];
  @List(Item) props2: Item[];
}

let originalEnv = process.env;

beforeEach(() => {
  process.env = { ...process.env };
});

afterEach(() => {
  process.env = originalEnv;
});

test('reads config from files', () => {
  const paths = [
    join(__dirname, 'files', 'arrays-1.yaml'),
  ];

  const conf = loadConfig(Config, { env: { prefix: '' }, files: paths },);

  // TODO
  // expect(conf.props1[0]).toBe('string-yaml-1');
  // expect(conf.props1[1]).toBe('string-yaml-2');
  // expect(conf.props2[0].prop1).toBe('string-yaml-1');
  // expect(conf.props2[1].prop1).toBe('string-yaml-2');
});
