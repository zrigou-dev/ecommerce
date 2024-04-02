"use strict";

/**
 * customer controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::customer.customer",
  ({ strapi }) => ({
    async scan(ctx) {
      await this.validateQuery(ctx);

      const { user } = ctx.state;
      const { name } = ctx.params;

      const entity = await strapi.service("api::customer.customer").find({
        filters: {
          name: {
            $eq: name,
          },
        },
      });

      const { results } = await this.sanitizeOutput(entity, ctx);

      const customer = results[0];

      if (customer !== undefined) {
        const cart = await strapi.service("api::cart.cart").find({
          filters: {
            user_id: {
              $eq: user.id,
            },
          },
          fields: "*",
          populate: {
            cart_items: {
              fields: ["*"],
              populate: {
                product: {
                  fields: ["*"],
                  populate: {
                    customer: "*",
                  },
                },
              },
            },
          },
        });

        const { results } = await this.sanitizeOutput(cart, ctx);
        const cart_obj = results[0];

        if (cart_obj !== null && cart_obj !== undefined) {
          const order = await strapi.entityService.create("api::order.order", {
            data: {
              user_id: cart_obj.user_id,
            },
          });

          let items = [];
          let total = 0;
          let cart_items_deleted = [];
          const cart_items = cart_obj.cart_items;

          for (let i = 0; i < cart_items.length; i++) {
            const cart_item = cart_items[i];
            if (cart_item.product.customer.id === customer.id) {
              let order_item = await strapi.entityService.create(
                "api::order-item.order-item",
                {
                  data: {
                    user_id: cart_item.user_id,
                    product: cart_item.product,
                    quantity: cart_item.quantity,
                    price: cart_item.price,
                    discount_price: cart_item.discount_price,
                    total: cart_item.total,
                    product_name: cart_item.product_name,
                    is_variant: cart_item.is_variant,
                    order: order,
                  },
                }
              );

              total = total + cart_item.total;
              cart_items_deleted.push(cart_item);
              items.push(order_item);
            }
          }

          for (let i = 0; i < cart_items_deleted.length; i++) {
            const cart_item = cart_items_deleted[i];
            await strapi.entityService.delete(
              "api::cart-item.cart-item",
              cart_item.id
            );
          }

          let order_obj = await strapi.entityService.update(
            "api::order.order",
            order.id,
            {
              data: {
                order_items: items,
                total: total,
              },
              populate: "*",
            }
          );

          return await this.sanitizeOutput(order_obj, ctx);
        }
      }
    },
    async updateProfile(ctx) {
      const { body, files } = ctx.request;
      const { user } = ctx.state;

      const phone = body?.phone;
      const file = files["avatar"];

      let data = {};
      if (file !== undefined) {
        const avatar = await strapi.plugins.upload.services.upload.upload({
          data: {
            fileInfo: {
              name: file.name,
              caption: "Caption",
              alternativeText: "Alternative Text",
            },
          },
          files: file,
        });
        data["avatar"] = avatar;
      }

      if (phone !== undefined) {
        data["phone"] = phone;
      }

      return await strapi.query("plugin::users-permissions.user").update({
        where: { id: user.id },
        data: data,
        populate: {
          fields: "*",
          avatar: {
            fields: "*",
          },
        },
      });
    },
  })
);
