import { describe, expect, it } from "bun:test";
import {
  GraphQLBoolean,
  GraphQLInt,
  type GraphQLOutputType,
  GraphQLString,
} from "graphql";
import { typeToGraphQLType } from "./typeToGraphQLType.js";

describe("typeToGraphQLType", () => {
  it("should map basic types correctly", () => {
    // Add tests for basic types

    expect(typeToGraphQLType<GraphQLOutputType>(() => String)).toBe(
      GraphQLString
    );
    expect(typeToGraphQLType<GraphQLOutputType>(() => Number)).toBe(GraphQLInt);
    expect(typeToGraphQLType<GraphQLOutputType>(() => Boolean)).toBe(
      GraphQLBoolean
    );
    expect(typeToGraphQLType<GraphQLOutputType>(() => Date)).toBe(
      GraphQLString
    );
  });
});
