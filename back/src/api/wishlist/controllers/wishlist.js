"use strict";

/**
 * wishlist controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::wishlist.wishlist",
  ({ strapi }) => ({
    async create(ctx) {
      await this.validateQuery(ctx);

      const { body } = ctx.request;
      const data = body?.data;
      const { user } = ctx.state;

      data.user_id = user.id.toString();

      const { results: wishlists } = await strapi
        .service("api::wishlist.wishlist")
        .find({
          filters: {
            $and: [
              {
                user_id: {
                  $eq: data.user_id,
                },
              },
              {
                product: {
                  id: {
                    $eq: data.product,
                  },
                },
              },
            ],
          },
        });

      if (wishlists.length !== 0) {
        return ctx.badRequest("Product already in your wishlist");
      }

      try {
        body["data"] = data;
        ctx.request.body = body;

        return await super.create(ctx);
      } catch (err) {
        // Handle errors
        return ctx.badRequest(err.message);
      }
    },
    async delete(ctx) {
      await this.validateQuery(ctx);

      const { id } = ctx.params;
      const { user } = ctx.state;

      const { results: wishlists } = await strapi
        .service("api::wishlist.wishlist")
        .find({
          filters: {
            $and: [
              {
                user_id: {
                  $eq: user.id,
                },
              },
              {
                product: {
                  id: {
                    $eq: id,
                  },
                },
              },
            ],
          },
        });

      if (wishlists.length === 0) {
        return ctx.badRequest("This Product does not exists in your wishlist");
      }

      return await strapi
        .service("api::wishlist.wishlist")
        .delete(wishlists[0]?.id);
    },
  })
);
