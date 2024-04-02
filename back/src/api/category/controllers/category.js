"use strict";

/**
 * category controller
 */
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::category.category",
  ({ strapi }) => ({
    async findOne(ctx) {
      await this.validateQuery(ctx);

      const { id } = ctx.params;
      const { query } = ctx;

      if (!query.filters) {
        query.filters = {};
      }

      query.filters.id = { $eq: id };
      query.filters.is_active = { $eq: true };

      const entity = await strapi.service("api::category.category").find(query);
      const { results } = await this.sanitizeOutput(entity, ctx);

      return this.transformResponse(results[0]);
    },

    // async findOne(ctx) {
    //   await this.validateQuery(ctx);

    //   const { id } = ctx.params;
    //   const { query } = ctx;

    //   const { results, pagination } = await strapi
    //     .service("api::category.category")
    //     .find({
    //       filters: {
    //         id: id,
    //         is_active: {
    //           $eq: true,
    //         },
    //       },

    //       ...query,
    //     });

    //   const sanitizedResults = await this.sanitizeOutput(results, ctx);

    //   return this.transformResponse(sanitizedResults, { pagination });
    // },
  })
);
