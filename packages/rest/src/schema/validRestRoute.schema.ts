import { HttpMethods } from "@loom/common";
import z from "zod/v4";

export const validRestRouteSchema = z.object({
  methods: z.array(z.enum(HttpMethods)),
  handler: z.any(),
  parent: z.any(),
  path: z.string(),
  target: z.any().optional(),
  inputSchema: z.any().optional(),
  outputSchema: z.any().optional(),
  middleware: z.array(z.any()).optional(),
});

export type ValidRestRoute = z.infer<typeof validRestRouteSchema>;
