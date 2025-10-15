import {
  MetaParamType,
  type ArgMetadata,
  type ParamMetadata,
} from "../gql.types";

export function argMetadataFromParamMetadata(
  argMetadata: ParamMetadata<unknown>[]
): ArgMetadata[] {
  return argMetadata.filter(
    (arg) => arg.paramType === MetaParamType.Arg
  ) as ArgMetadata[];
}
