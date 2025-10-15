import type { JSONRecord, PackageFileDetails, PackageJSONLike } from "./types";

export function getDependencyChanges(
  dependencyRecord: JSONRecord,
  changeMap: { name: string; version: string }[]
) {
  const newDeps = { ...dependencyRecord };
  changeMap.forEach((change) => {
    newDeps[change.name] = change.version;
  });

  return newDeps;
}

export function applyPackageChanges(packageData: PackageFileDetails) {
  return packageData.changes.reduce((acc: PackageJSONLike, change) => {
    acc[change.field] = change.to;
    return acc;
  }, packageData.nextContent);
}
