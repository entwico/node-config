import { ConfigContainerConstructor } from ".";

type PropertyInfo = {
  key: string;
  repeated: boolean;
  type?: any;
}

const classes = new WeakMap<any, PropertyInfo[]>();

export function Property() {
  return (target: any, key: string) => {
    let props = classes.get(target);

    if (!props) {
      classes.set(target, props = []);
    }

    props.push({ key, repeated: false, type: Reflect.getMetadata("design:type", target, key) });
  }
}

export function List(listItemType: Function) {
  return (target: any, key: string) => {
    let props = classes.get(target);

    if (!props) {
      classes.set(target, props = []);
    }

    props.push({ key, repeated: true, type: listItemType });
  }
}

export interface ConfigPropertyDescriptor {
  key: string;
  regex?: string;
  type: 'string' | 'number' | 'boolean' | 'unknown';
}

export function getRegisteredDescriptors<T>(clss: ConfigContainerConstructor<T>) {
  const props: ConfigPropertyDescriptor[] = [];

  function traverse(path: string, clssType: any) {
    const proto = clssType.prototype;
    const clssprops = classes.get(proto);

    if (!clssprops) {
      props.push({ key: path, type: 'unknown' });

      return;
    }

    clssprops.forEach(prop => {
      let updatedPath = path + '.' + prop.key;

      if (prop.repeated) {
        updatedPath += '[]';
      }

      switch (prop.type) {
        case String: props.push({ key: updatedPath, type: 'string' }); break;
        case Number: props.push({ key: updatedPath, type: 'number' }); break;
        case Boolean: props.push({ key: updatedPath, type: 'boolean' }); break;
        default: prop.type && traverse(updatedPath, prop.type);
      }
    });
  }

  traverse('', clss);

  props.forEach(prop => {
    prop.key = prop.key.slice(1);
    prop.regex = `^${prop.key.replace(/\[\]/g, '\\[(\\d)\\]').replace(/\./g, '\\.')}$`;
  });

  return props;
}
