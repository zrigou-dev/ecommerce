"use strict";

/**
 * cart controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::cart.cart", ({ strapi }) => ({
  async find(ctx) {
    await this.validateQuery(ctx);
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);

    const { user } = ctx.state;

    const { results, pagination } = await strapi
      .service("api::cart.cart")
      .find({
        filters: {
          user_id: user.id,
        },
        ...sanitizedQueryParams,
      });

    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  },
  async findOne(ctx) {
    await this.validateQuery(ctx);

    const { id } = ctx.params;
    const { user } = ctx.state;
    const { query } = ctx;

    const { results, pagination } = await strapi
      .service("api::cart.cart")
      .find({
        filters: {
          id: id,
          user_id: user.id,
        },
        ...query,
      });

    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  },
}));
