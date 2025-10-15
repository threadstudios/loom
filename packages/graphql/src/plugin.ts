import { HttpMethods, Logger, type LoomInstance } from "@threadws/loom-common";

import { createHandler } from "graphql-http/lib/use/fetch";
import { ruruHTML } from "ruru/server";
import Container from "typedi";
import { Loom__GraphQLMetadata } from "./gql.meta";
import { LoomGqlSchemaBuilder } from "./schemaBuilder";

export const LoomGqlPlugin = () => (instance: LoomInstance) => {
  const gqlMeta = Container.get(Loom__GraphQLMetadata);
  const logger = Container.get(Logger).getChild("gql");

  const schemaBuilder = new LoomGqlSchemaBuilder(gqlMeta);

  const schema = schemaBuilder.buildSchema();

  logger.info("GraphQL Schema built");

  instance.addRoute({
    methods: [HttpMethods.Post],
    path: "/graphql",
    handler: async (req) => {
      logger.info("Incoming GraphQL request");
      const handler = createHandler({ schema, context: { req, custom: {} } });
      const result = await handler(req);
      logger.info("GraphQL request processed");
      return result;
    },
  });

  instance.addRoute({
    methods: [HttpMethods.Get],
    path: "/graphiql",
    handler: () => {
      return new Response(
        ruruHTML({
          endpoint: "/graphql",
          htmlParts: { titleTag: `<title>${instance.applicationName}</title>` },
        }),
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    },
  });
};
