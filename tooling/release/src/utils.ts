import type { JSONRecord } from "./types";

export function getDependencyChanges(
  dependencyRecord: JSONRecord,
  changeMap: { oldName: string; name: string; version: string }[]
) {
  const newDeps = { ...dependencyRecord };
  changeMap.forEach((change) => {
    if (dependencyRecord[change.oldName]) {
      delete newDeps[change.oldName];
      newDeps[change.name] = change.version;
    }
  });

  return newDeps;
}
