"use strict";

/**
 * user-interest controller
 */
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::user-interest.user-interest",
  ({ strapi }) => ({
    async find(ctx) {
      await this.validateQuery(ctx);
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);

      const { user } = ctx.state;

      const { results, pagination } = await strapi
        .service("api::user-interest.user-interest")
        .find({
          filters: {
            user_id: user.id,
          },
          ...sanitizedQueryParams,
        });

      const sanitizedResults = await this.sanitizeOutput(results, ctx);

      return this.transformResponse(sanitizedResults, { pagination });
    },
    async delete(ctx) {
      await this.validateQuery(ctx);

      const { id } = ctx.params;
      const { user } = ctx.state;
      const { query } = ctx;

      const { results, pagination } = await strapi
        .service("api::user-interest.user-interest")
        .find({
          filters: {
            id: id,
            user_id: user.id,
          },
          ...query,
        });

      if (results.length !== 0) {
        try {
          return await super.delete(ctx);
        } catch (error) {
          console.error("Error deleting entity:", error);
          return ctx.badRequest("Failed to delete entity");
        }
      } else {
        return ctx.notFound("Entity not found");
      }
    },
    async update(ctx) {
      await this.validateQuery(ctx);

      const { id } = ctx.params;
      const { user } = ctx.state;
      const { query } = ctx;

      const { results, pagination } = await strapi
        .service("api::user-interest.user-interest")
        .find({
          filters: {
            id: id,
            user_id: user.id,
          },
          ...query,
        });

      if (results.length !== 0) {
        try {
          return await super.update(ctx);
        } catch (error) {
          console.error("Error update entity:", error);
          return ctx.badRequest("Failed to update entity");
        }
      } else {
        return ctx.notFound("Entity not found");
      }
    },
  })
);
