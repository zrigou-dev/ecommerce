"use strict";

/**
 * category controller
 */
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::category.category",
  ({ strapi }) => ({
    async topCategories(ctx) {
      await this.validateQuery(ctx);
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);

      const { results, pagination } = await strapi
        .service("api::category.category")
        .find({
          filters: {
            ranking: {
              $notNull: true,
            },
            is_active: {
              $eq: true,
            },
          },
          ...sanitizedQueryParams,
        });

      const sanitizedResults = await this.sanitizeOutput(results, ctx);

      return this.transformResponse(sanitizedResults, { pagination });
    },
    async fourProductByCategories(ctx) {
      await this.validateQuery(ctx);

      const { user } = ctx.state;
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);

      let product_ids_wishlist = [];
      if (user !== undefined) {
        const { results: wishlists } = await strapi
          .service("api::wishlist.wishlist")
          .find({
            filters: {
              user_id: {
                $eq: user.id,
              },
            },
            fields: ["id"],
            populate: {
              product: {
                fields: ["id"],
              },
            },
          });

        for (let i = 0; i < wishlists.length; i++) {
          const wishlist = wishlists[i];
          product_ids_wishlist.push(wishlist.product?.id);
        }
      }

      let filters = {
        ranking: {
          $notNull: true,
        },
        is_active: {
          $eq: true,
        },
        products: {
          id: {
            $notNull: true,
          },
        },
      };

      let _pagination = {};
      filters = Object.assign({}, filters, sanitizedQueryParams.filters);
      if (sanitizedQueryParams.pagination !== undefined) {
        _pagination = sanitizedQueryParams.pagination;
      }

      const { results: categories, pagination } = await strapi
        .service("api::category.category")
        .find({
          filters,
          fields: ["id", "name", "is_active", "slug", "nbrs_products"],
          populate: {
            image: {
              fields: "*",
            },
          },
          sort: { nbrs_products: "desc" },
          pagination: _pagination,
        });

      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];

        let { results: products } = await strapi
          .service("api::product.product")
          .find({
            pagination: { page: 1, pageSize: 4 },
            filters: {
              category: {
                id: {
                  $eq: category.id,
                },
              },
            },
            fields: ["id", "name", "is_vip", "price", "discount_price"],
            populate: {
              customer: {
                fields: ["id", "name"],
              },
              thumbnail: {
                fields: "*",
              },
              images: {
                fields: "*",
              },
            },
            sort: { id: "desc" },
          });

        if (user !== undefined) {
          for (let j = 0; j < products.length; j++) {
            const product = products[j];

            if (product_ids_wishlist.includes(product.id)) {
              product.is_favorite = true;
            } else {
              product.is_favorite = false;
            }

            products[j] = product;
          }
        }
        category.products = products;
        categories[i] = category;
      }

      const sanitizedResults = await this.sanitizeOutput(categories, ctx);

      return this.transformResponse(sanitizedResults, { pagination });
    },
  })
);
