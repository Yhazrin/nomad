"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Extend the type enum to include the new semantic edge types.
    // `ALTER TYPE ... ADD VALUE` is non-transactional by default and is
    // idempotent via IF NOT EXISTS.
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_relationships_type" ADD VALUE IF NOT EXISTS 'supports';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_relationships_type" ADD VALUE IF NOT EXISTS 'decides';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_relationships_type" ADD VALUE IF NOT EXISTS 'depends_on';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_relationships_type" ADD VALUE IF NOT EXISTS 'source_for';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_relationships_type" ADD VALUE IF NOT EXISTS 'supersedes';`
    );

    // Add the optional provenance note column.
    await queryInterface.addColumn("relationships", "source", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Composite indexes for the two common lookup patterns:
    //   - all edges of a given type originating from a doc
    //   - all edges of a given type arriving at a doc
    // These are created outside any transaction so that the
    // `CONCURRENTLY` option is honored by PostgreSQL.
    await queryInterface.addIndex("relationships", ["documentId", "type"], {
      name: "relationships_document_type_idx",
      concurrently: true,
    });
    await queryInterface.addIndex(
      "relationships",
      ["reverseDocumentId", "type"],
      {
        name: "relationships_reverse_document_type_idx",
        concurrently: true,
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "relationships",
      "relationships_reverse_document_type_idx"
    );
    await queryInterface.removeIndex(
      "relationships",
      "relationships_document_type_idx"
    );
    await queryInterface.removeColumn("relationships", "source");

    // Postgres cannot DROP VALUE from an enum. The original `backlink` /
    // `similar` values remain in place after a rollback.
  },
};
