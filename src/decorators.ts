import { ConfigContainerConstructor } from ".";

type PropertyDescription = {
  key: string;
  single: boolean;
  type?: any;
}

const classes = new WeakMap<any, PropertyDescription[]>();

export function Property() {
  return (target: any, key: string) => {
    let props = classes.get(target);

    if (!props) {
      classes.set(target, props = [])
    }

    props.push({ key, single: true, type: Reflect.getMetadata("design:type", target, key) });
  }
}

export function List(listItemType: Function) {
  return (target: any, key: string) => {
    let props = classes.get(target);

    if (!props) {
      classes.set(target, props = [])
    }

    props.push({ key, single: false, type: listItemType });
  }
}

export function flattenProps<T>(clss: ConfigContainerConstructor<T>) {
  const props: { key: string, type: 'string' | 'number' | 'boolean' | 'unknown' }[] = [];

  function traverse(path: string, clssType: any) {
    const proto = clssType.prototype;
    const clssprops = classes.get(proto);

    if (!clssprops) {
      props.push({ key: path, type: 'unknown' });

      return;
    }

    clssprops.forEach(prop => {
      const updatedPath = path + '.' + prop.key;

      switch (prop.type) {
        case String: props.push({ key: updatedPath, type: 'string' }); break;
        case Number: props.push({ key: updatedPath, type: 'number' }); break;
        case Boolean: props.push({ key: updatedPath, type: 'boolean' }); break;
        default: prop.type && traverse(updatedPath, prop.type);
      }
    });
  }

  traverse('', clss);

  props.forEach(prop => prop.key = prop.key.slice(1));

  return props;
}
