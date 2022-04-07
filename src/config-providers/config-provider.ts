export interface ConfigKeyValue {
  key: string;
  value: string | number | boolean;
}

export interface ConfigProvider {
  isCaseSensitive(): boolean;
  provide(): ConfigKeyValue[];
}
