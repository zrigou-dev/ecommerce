"use strict";

/**
 * category controller
 */
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::product.product", ({ strapi }) => ({
  async getProductsByCategory(ctx) {
    await this.validateQuery(ctx);

    const { id } = ctx.params;
    const { user } = ctx.state;
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);

    const category = await strapi.entityService.findOne(
      "api::category.category",
      id,
      {
        populate: { categories: true },
      }
    );

    let category_ids = [id];

    for (let i = 0; i < category.categories.length; i++) {
      const element = category.categories[i];
      category_ids.push(element.id);
    }

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

    const { results: products, pagination } = await strapi
      .service("api::product.product")
      .find({
        ...sanitizedQueryParams,
        filters: {
          category: {
            id: {
              $in: category_ids,
            },
          },
          in_stock: {
            $eq: true,
          },
        },
        fields: ["id", "name", "slug", "price", "discount_price"],
        populate: {
          customer: {
            fields: ["id", "name"],
          },
          category: {
            fields: ["id", "name"],
          },
          thumbnail: {
            fields: "*",
          },
          images: {
            fields: "*",
          },
          sort: { id: "desc" },
        },
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

    const sanitizedResults = await this.sanitizeOutput(products, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  },
  async searchProduct(ctx) {
    const { search } = ctx.params;
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);

    const { results, pagination } = await strapi
      .service("api::product.product")
      .find({
        filters: {
          $and: [
            {
              $or: [
                { name: { $containsi: search } },
                { description: { $containsi: search } },
                { price: { $containsi: search } },
                { discount_price: { $containsi: search } },
                { slug: { $containsi: search } },
                {
                  category: {
                    $or: [
                      { id: { $containsi: search } },
                      { name: { $containsi: search } },
                      { description: { $containsi: search } },
                      { slug: { $containsi: search } },
                      {
                        parent: {
                          $or: [
                            { id: { $containsi: search } },
                            { name: { $containsi: search } },
                            { description: { $containsi: search } },
                            { slug: { $containsi: search } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  customer: {
                    $or: [
                      { id: { $containsi: search } },
                      { name: { $containsi: search } },
                    ],
                  },
                },
              ],
            },
            {
              in_stock: {
                $eq: true,
              },
            },
          ],
          // $or: {
          // name: {
          //   $containsi: search,
          // },
          // description: {
          //   $containsi: search,
          // },
          // price: {
          //   $eq: search,
          // },
          // discount_price: {
          //   $eq: search,
          // },
          // slug: {
          //   $containsi: search,
          // },
          // category: {
          //   id: search,
          //   name: {
          //     $containsi: search,
          //   },
          //   description: {
          //     $containsi: search,
          //   },
          //   slug: {
          //     $containsi: search,
          //   },
          //   parent: {
          //     $or: {
          //       name: {
          //         $containsi: search,
          //       },
          //       description: {
          //         $containsi: search,
          //       },
          //       slug: {
          //         $containsi: search,
          //       },
          //     },
          //   },
          // },
          // customer: {
          //   name: {
          //     $containsi: search,
          //   },
          // },
          //   in_stock: {
          //     $eq: true,
          //   },
          // },
        },
        fields: [
          "id",
          "name",
          "slug",
          "description",
          "price",
          "discount_price",
          "is_vip",
        ],
        populate: {
          customer: {
            fields: ["id", "name"],
          },
          product_variant: {
            fields: "*",
            populate: {
              images: {
                fields: "*",
              },
            },
          },
          thumbnail: {
            fields: "*",
          },
          images: {
            fields: "*",
          },
          sort: { id: "desc" },
        },
        ...sanitizedQueryParams,
      });

    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  },
}));
