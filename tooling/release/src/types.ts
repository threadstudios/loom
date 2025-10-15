export type JSONRecord = {
  [key: string]: string | boolean | number | JSONRecord;
};

export type PackageJSONLike = JSONRecord & {
  dependencies?: JSONRecord;
  devDependencies?: JSONRecord;
  peerDependencies?: JSONRecord;
};

export type PackageChange = {
  field: string;
  from: string | boolean | number | JSONRecord;
  to: string | boolean | number | JSONRecord;
};

export type PackageFileMap = Map<
  string,
  {
    writePath: string;
    oldContent: PackageJSONLike;
    nextContent: PackageJSONLike;
    changes: PackageChange[];
  }
>;

export type PackageDependencyChangeData = {
  oldName: string;
  name: string;
  version: string;
};
