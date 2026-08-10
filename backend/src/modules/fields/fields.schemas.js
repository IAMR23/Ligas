import { z } from "zod";

export const listFieldsSchema = z.object({
  params: z.object({}).optional(),
  body: z.object({}).optional(),
  query: z.object({
    active: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional()
  })
});
