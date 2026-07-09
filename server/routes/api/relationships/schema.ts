import { z } from "zod";
import { RelationshipType } from "@server/models/Relationship";
import { ValidateDocumentId } from "@server/validation";
import { BaseSchema } from "../schema";

export const RelationshipsInfoSchema = BaseSchema.extend({
  body: z.object({
    id: z.uuid(),
  }),
});

export type RelationshipsInfoReq = z.infer<typeof RelationshipsInfoSchema>;

export const RelationshipsListSchema = BaseSchema.extend({
  body: z
    .object({
      type: z.enum(RelationshipType).optional(),
      documentId: z
        .string()
        .refine(ValidateDocumentId.isValid, {
          message: ValidateDocumentId.message,
        })
        .optional(),
      reverseDocumentId: z
        .string()
        .refine(ValidateDocumentId.isValid, {
          message: ValidateDocumentId.message,
        })
        .optional(),
    })
    .optional(),
});

export type RelationshipsListReq = z.infer<typeof RelationshipsListSchema>;

export const RelationshipsCreateSchema = BaseSchema.extend({
  body: z.object({
    /** Source document of the edge. */
    sourceDocumentId: z.string().refine(ValidateDocumentId.isValid, {
      message: ValidateDocumentId.message,
    }),
    /** Target document of the edge. */
    targetDocumentId: z.string().refine(ValidateDocumentId.isValid, {
      message: ValidateDocumentId.message,
    }),
    /** Semantic type of the edge. */
    type: z.enum(RelationshipType),
    /** Optional free-text provenance note. */
    source: z.string().trim().max(2000).optional(),
  }),
});

export type RelationshipsCreateReq = z.infer<typeof RelationshipsCreateSchema>;

export const RelationshipsDeleteSchema = BaseSchema.extend({
  body: z.object({
    id: z.uuid(),
  }),
});

export type RelationshipsDeleteReq = z.infer<typeof RelationshipsDeleteSchema>;
