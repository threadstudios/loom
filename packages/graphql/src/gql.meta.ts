import { Service } from "typedi";

import {
  MetaParamType,
  type ArgMetadata,
  type LazyReturnType,
  type MetaObjectType,
  type ObjectTypeMetadata,
  type OperationMetadata,
  type ParamMetadata,
  type ResolveFieldMetadata,
} from "./gql.types";
import type { LoomGuard } from "./guard";

@Service()
export class Loom__GraphQLMetadata {
  private objectRegistry = new Map<string, ObjectTypeMetadata>();
  private operationRegistry = new Map<string, OperationMetadata>();
  private argumentRegistry = new Map<string, ParamMetadata<unknown>[]>();
  private fieldResolverRegistry: ResolveFieldMetadata[] = [];
  private resolverRegistry = new Map<any, { objectType: LazyReturnType }>();
  public objectTypeRegistry = new Map<string, MetaObjectType>();
  private guardRegistry = new Map<string, LoomGuard[]>();

  registerObject(objectMeta: ObjectTypeMetadata) {
    this.objectRegistry.set(objectMeta.name, objectMeta);
  }

  addArgument(key: string, argMetadata: ParamMetadata<unknown>) {
    const existingArgs = this.argumentRegistry.get(key) || [];
    existingArgs.push(argMetadata);
    this.argumentRegistry.set(key, existingArgs);
  }

  getArguments(key: string): ParamMetadata<unknown>[] {
    return this.argumentRegistry.get(key) || [];
  }

  getArgArguments(key: string): ArgMetadata[] {
    return (this.argumentRegistry.get(key) || []).filter(
      (arg) => arg.paramType === MetaParamType.Arg
    ) as ArgMetadata[];
  }

  registerOperation(operationMeta: OperationMetadata) {
    this.operationRegistry.set(operationMeta.name, operationMeta);
  }

  registerFieldResolver(fieldResolverMeta: ResolveFieldMetadata) {
    this.fieldResolverRegistry.push(fieldResolverMeta);
  }

  registerResolver(name: string, resolverMeta: { objectType: LazyReturnType }) {
    this.resolverRegistry.set(name, resolverMeta);
  }

  registerGuard(target: string, guard: LoomGuard) {
    const existingGuards = this.guardRegistry.get(target) || [];
    existingGuards.push(guard);
    this.guardRegistry.set(target, existingGuards);
  }

  getGuards(target: string): LoomGuard[] {
    return this.guardRegistry.get(target) || [];
  }

  getResolver(name: string): { objectType: LazyReturnType } | undefined {
    return this.resolverRegistry.get(name);
  }

  getFieldResolvers(): ResolveFieldMetadata[] {
    return this.fieldResolverRegistry;
  }

  getObject(name: string): ObjectTypeMetadata | undefined {
    return this.objectRegistry.get(name);
  }

  getOperation(name: string): OperationMetadata | undefined {
    return this.operationRegistry.get(name);
  }

  getAllObjects(): ObjectTypeMetadata[] {
    return Array.from(this.objectRegistry.values());
  }

  getAllOperations(): OperationMetadata[] {
    return Array.from(this.operationRegistry.values());
  }
}
