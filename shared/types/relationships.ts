/**
 * Semantic relationship types for typed edges between documents.
 *
 * The legacy types (`backlink`, `similar`) are kept for backwards
 * compatibility with existing data; new typed edges should use the
 * semantic set defined below.
 */
export type SemanticRelationshipType =
  | "supports"
  | "decides"
  | "depends_on"
  | "source_for"
  | "supersedes";

export type LegacyRelationshipType = "backlink" | "similar";

/**
 * Union of all valid relationship types. Used for both server-side
 * validation and client-side rendering of edge pills.
 */
export type RelationshipType =
  | SemanticRelationshipType
  | LegacyRelationshipType;

/** Ordered list for UI rendering (semantic types first). */
export const SEMANTIC_RELATIONSHIP_TYPES: SemanticRelationshipType[] = [
  "supports",
  "decides",
  "depends_on",
  "source_for",
  "supersedes",
];

/**
 * Human-readable labels for the semantic relationship types.
 */
export const RELATIONSHIP_TYPE_LABELS: Record<
  SemanticRelationshipType,
  string
> = {
  supports: "Supports",
  decides: "Decides",
  depends_on: "Depends on",
  source_for: "Source for",
  supersedes: "Supersedes",
};

/**
 * Direction descriptor for a relationship type. Used by the UI to
 * decide which document is the "source" in the edge from the user's
 * perspective (e.g. "A depends on B" vs "B is depended on by A").
 */
export type EdgeDirection = "outgoing" | "incoming";

export interface RelationshipEdge {
  /** Unique identifier for the edge. */
  id: string;
  /** Document that originated the edge. */
  sourceDocumentId: string;
  /** Document the edge points to. */
  targetDocumentId: string;
  /** Semantic type of the edge. */
  type: RelationshipType;
  /** User that created the edge. */
  createdById: string;
  /** Free-text provenance note. */
  source?: string | null;
  /** Creation timestamp. */
  createdAt: string;
}

/** Narrowed edge type with semantic guarantee. */
export interface SemanticRelationshipEdge extends RelationshipEdge {
  type: SemanticRelationshipType;
}
