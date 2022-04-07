import { isArray, flatMap, isPlainObject, keys, map, concat } from "lodash";

/**
 * Get all paths from object
 * https://stackoverflow.com/a/56064139/1990451
 * @param obj any object
 * @param parentKey
 * @returns array of paths
 */
export function getAllPaths(obj: any, parentKey?: string): string[] {
  var result: string[];

  if (isArray(obj)) {
    var idx = 0;
    result = flatMap(obj, function (obj: any) {
      return getAllPaths(obj, (parentKey || '') + '[' + idx++ + ']');
    });
  } else if (isPlainObject(obj)) {
    result = flatMap(keys(obj), function (key) {
      return map(getAllPaths(obj[key], key), function (subkey) {
        return (parentKey ? parentKey + '.' : '') + subkey;
      });
    });
  } else {
    result = [];
  }
  return concat(result, parentKey || []);
}

export function coerceString(value: string | number | boolean) {
  return String(value);
}

export function coerceNumber(value: string | number | boolean) {
  if (typeof value === 'boolean') {
    return Number(value);
  }

  if (typeof value === 'number') {
    return value;
  }

  return value ? Number(value) : null;
}

export function coerceBoolean(value: string | number | boolean) {
  if (typeof value !== 'string') {
    return Boolean(value);
  }

  if (value === 'true' || value === '1') {
    return true;
  }

  if (value === 'false' || value === '0') {
    return false;
  }

  return null;
}
