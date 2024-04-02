"use strict";

/**
 * cart controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::cart.cart", ({ strapi }) => ({
  async create(ctx) {
    await this.validateQuery(ctx);

    const data = {};
    const { query } = ctx;
    const { body } = ctx.request;
    const { user } = ctx.state;

    if (!query.filters) {
      query.filters = {};
      query.populate = {};
    }
    query.filters.user_id = { $eq: user.id };
    query.populate.cart_items = "*";

    const { results: cart } = await strapi
      .service("api::cart.cart")
      .find(query);

    if (cart.length !== 0) {
      return this.transformResponse(cart[0]);
    }

    try {
      data.user_id = user.id.toString();
      body["data"] = data;

      ctx.request.body = body;

      return await super.create(ctx);
    } catch (err) {
      // Handle errors
      return ctx.badRequest(err.message);
    }
  },
  // async find(ctx) {
  //   await this.validateQuery(ctx);

  //   const { user } = ctx.state;
  //   const { query } = ctx;

  //   if (!query.filters) {
  //     query.filters = {};
  //   }
  //   query.filters.user_id = { $eq: user.id };

  //   const entity = await strapi.service("api::cart.cart").find(query);
  //   const { results, pagination } = await this.sanitizeOutput(entity, ctx);

  //   return this.transformResponse(results, { pagination });
  // },
  async findOne(ctx) {
    await this.validateQuery(ctx);

    const { id } = ctx.params;
    const { user } = ctx.state;
    const { query } = ctx;

    if (!query.filters) {
      query.filters = {};
    }

    query.filters.id = { $eq: id };
    query.filters.user_id = { $eq: user.id };

    const entity = await strapi.service("api::cart.cart").find(query);
    const { results } = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(results[0]);
  },
}));
