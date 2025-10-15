#!/usr/bin/env bun

import semver from "semver";
import { file, Glob } from "bun";
import fs from "node:fs";

import { program } from "commander";
import { input } from "@inquirer/prompts";
import type {
  PackageFileMap,
  PackageChange,
  PackageDependencyChangeData,
  JSONRecord,
} from "./types";
import { getDependencyChanges } from "./utils";

const packagesToPublish: Record<string, string> = {
  "@loom/common": "@threadws/loom-common",
  "@loom/graphql": "@threadws/loom-graphql",
  "@loom/core": "@threadws/loom-core",
  "@loom/rest": "@threadws/loom-rest",
};

const rootPkg = await require(`${process.cwd()}/package.json`);

program
  .name("Loom Release & Publish CLI")
  .description("CLI to manage the loom monorepo");

program
  .command("version")
  .description("Set the version across all packages")
  .argument(
    "<release>",
    "The type of release to create, major, premajor, minor, preminor, patch, prepatch, or prerelease"
  )
  .action(async (release) => {
    const nextVersion = semver.inc(rootPkg.version, release);
    const glob = new Glob("packages/**/package.json");
    const paths = new Map<string, { name: string; version: string }>();
    paths.set(`package.json`, rootPkg);
    for await (const file of glob.scan(".")) {
      if (!file.includes("node_modules")) {
        paths.set(file, await require(`${process.cwd()}/${file}`));
      }
    }

    const confirm = await input({
      message: `Preparing to write package versions:\r\n${Array.from(
        paths.values()
      )
        .map((pkg) => `${pkg.name} - ${nextVersion}`)
        .join("\r\n")}\r\n(y/n)`,
    });

    if (confirm.toLowerCase() !== "y") {
      return;
    }

    for (const [path, pkgJson] of Array.from(paths.entries())) {
      const newPath = `${process.cwd()}/${path}`;
      fs.writeFileSync(
        newPath,
        JSON.stringify({ ...pkgJson, version: nextVersion }, null, 2),
        "utf-8"
      );
    }
  });

program
  .command("publish")
  .description("publish all packages")
  .option("-d, --dry-run", "run without altering the file system")
  .action(async ({ dryRun }: { dryRun: boolean }) => {
    const glob = new Glob("packages/**/package.json");
    const packageFileData: PackageFileMap = new Map();
    const packageVersionData: PackageDependencyChangeData[] = [];

    const packageFilePaths = await Array.fromAsync(glob.scan("."));
    for (const packagePath of packageFilePaths) {
      const packageJSON = await require(`${process.cwd()}/${packagePath}`);
      const newPackageName = packagesToPublish[packageJSON.name];
      if (!newPackageName)
        throw new Error(`Package: ${newPackageName} not found in package map`);
      packageVersionData.push({
        oldName: packageJSON.name,
        name: newPackageName,
        version: packageJSON.version,
      });
      packageFileData.set(packagePath, {
        oldContent: packageJSON,
        nextContent: packageJSON,
        changes: [
          {
            field: "name",
            from: packageJSON.name,
            to: newPackageName,
          },
        ],
        writePath: packagePath,
      });
    }

    for (const [key, packageData] of packageFileData.entries()) {
      ["devDependencies", "dependencies", "peerDependencies"].forEach(
        (depType) => {
          if (packageData.oldContent[depType]) {
            packageData.changes.push({
              field: depType,
              from: packageData.oldContent[depType],
              to: getDependencyChanges(
                packageData.oldContent[depType] as JSONRecord,
                packageVersionData
              ),
            });
          }
        }
      );
      packageFileData.set(key, packageData);
    }

    if (dryRun) {
      for (const [key, { changes }] of packageFileData.entries()) {
        console.log(
          `${key}:\r\n${changes
            .map(
              (change) =>
                `${change.field} => ${JSON.stringify(change.to, null, 2)}`
            )
            .join("\r\n")}\r\n`
        );
      }
      return;
    }
  });

program.parse();
