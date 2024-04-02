"use strict";

/**
 * cart-item controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::cart-item.cart-item",
  ({ strapi }) => ({
    async create(ctx) {
      await this.validateQuery(ctx);

      const { body } = ctx.request;
      const { user } = ctx.state;
      const data = body?.data;
      const { quantity } = data;

      if (!quantity) {
        return ctx.badRequest("Quantity are required");
      }

      try {
        const product = await strapi.entityService.findOne(
          "api::product.product",
          data.product,
          {
            populate: { product_variant: true },
          }
        );

        const cart = await strapi.entityService.findOne(
          "api::cart.cart",
          data.cart
        );

        if (!product) {
          return ctx.badRequest("Product not found!");
        }

        if (!cart) {
          return ctx.badRequest("Cart not found!");
        }

        if (cart.user_id != user.id) {
          return ctx.forbidden("Access denied!");
        }

        const existing_cart_item = await strapi.db
          .query("api::cart-item.cart-item")
          .findOne({
            select: ["*"],
            where: {
              product: {
                id: product.id,
              },
            },
          });

        if (existing_cart_item) {
          const quantity = existing_cart_item.quantity + data.quantity;
          let total = existing_cart_item.price * quantity;

          if (
            existing_cart_item.discount_price !== 0 &&
            existing_cart_item.discount_price !== undefined
          ) {
            total = existing_cart_item.discount_price * quantity;
          }

          cart.total = cart.total - existing_cart_item.total;
          cart.total =
            parseFloat(cart.total.toFixed(3)) + parseFloat(total.toFixed(3));

          await strapi.entityService.update(
            "api::cart-item.cart-item",
            existing_cart_item.id,
            {
              data: {
                quantity: quantity,
                total: total,
              },
            }
          );

          await strapi.entityService.update("api::cart.cart", cart.id, {
            data: {
              total: cart.total,
            },
          });

          const cart_item = await strapi.entityService.findOne(
            "api::cart-item.cart-item",
            existing_cart_item.id,
            {
              populate: {
                product: true,
                cart: true,
              },
            }
          );

          return this.transformResponse(cart_item);
        } else {
          data.user_id = user.id.toString();
          let is_variant = false;

          if (product.name === data.product_name) {
            const discount_price = product.discount_price ?? 0;
            if (discount_price == 0) {
              data.price = product.price;
              data.total = product.price * data.quantity;
            } else {
              is_variant = true;
              data.price = product.price;
              data.discount_price = discount_price;
              data.total = discount_price * data.quantity;
            }
          } else {
            let price = 0;
            let variant_discount_price = 0;

            const variants = product.product_variant;
            for (let index = 0; index < variants.length; index++) {
              const variant = variants[index];

              if (variant.variant_name == data.product_name) {
                price = variant.variant_price;
                variant_discount_price = variant.variant_discount_price ?? 0;
                break;
              }
            }

            if (!price) {
              return ctx.badRequest("Product not found!");
            }

            if (variant_discount_price == 0) {
              data.price = price;
              data.total = price * data.quantity;
            } else {
              is_variant = true;
              data.price = price;
              data.discount_price = variant_discount_price;
              data.total = variant_discount_price * data.quantity;
            }
          }

          data.is_variant = is_variant;
          cart.total =
            parseFloat(cart.total.toFixed(3)) +
            parseFloat(data.total.toFixed(3));

          await strapi.entityService.update("api::cart.cart", cart.id, {
            data: {
              total: cart.total,
            },
          });

          // Create a new product
          body.data = data;
          ctx.request.body = body;
          return await super.create(ctx);
        }
      } catch (err) {
        // Handle errors
        return ctx.badRequest(err.message);
      }

      // if (data !== undefined) {
      // TODO update quantity of product if product is variant
      /*const product = await strapi.entityService.findOne(
          "api::product.product",
          data.product,
          {
            populate: { variants: true },
          }
        );

        if (product !== undefined) {
          const variants = product.variants;
          for (let index = 0; index < variants.length; index++) {
            const variant = variants[index];

            if (variant.sku === data.sku) {
              variant.quantity =
                parseInt(variant.quantity) - parseInt(data.quantity);
            }

            variants[index] = variant;
          }

          await strapi.entityService.update(
            "api::product.product",
            product.id,
            {
              data: {
                variants: variants,
              },
            }
          );
        }*/
      /*
        
        const response = await strapi.service('api::article.article').find({
          filters: {
            user: {   // this filter linked user, you also can use createdBy
              id: ctx.state.user.id
            }
          }
        }).then(
          res => {
            if (res.results.length >= 3) {
              return "You have already created 3 article"
            }
          }
        )
        */
      // }
    },
    async update(ctx) {
      await this.validateQuery(ctx);

      const { id } = ctx.params;
      const { user } = ctx.state;
      const { body } = ctx.request;

      const data = body?.data;
      const { quantity } = data;

      if (!quantity) {
        return ctx.badRequest("Quantity are required");
      }

      try {
        const cart_item = await strapi.entityService.findOne(
          "api::cart-item.cart-item",
          id,
          {
            populate: { cart: true },
          }
        );

        const product = await strapi.entityService.findOne(
          "api::product.product",
          data.product,
          {
            populate: { product_variant: true },
          }
        );

        if (!cart_item) {
          return ctx.badRequest("Cart item not found!");
        }

        if (!product) {
          return ctx.badRequest("Product not found!");
        }

        if (cart_item.user_id != user.id) {
          return ctx.forbidden("Access denied!");
        }

        const cart = await strapi.entityService.findOne(
          "api::cart.cart",
          cart_item.cart.id
        );

        let old_discount_price = cart_item.discount_price ?? 0;
        let old_total = cart_item.price * cart_item.quantity;
        if (old_discount_price != 0) {
          old_total = old_discount_price * cart_item.quantity;
        }

        let is_variant = false;

        if (product.name === data.product_name) {
          const discount_price = product.discount_price ?? 0;
          if (discount_price == 0) {
            data.price = product.price;
            data.total = product.price * data.quantity;
            data.discount_price = 0;
          } else {
            is_variant = true;
            data.price = product.price;
            data.discount_price = discount_price;
            data.total = discount_price * data.quantity;
          }
        } else {
          let price = 0;
          let variant_discount_price = 0;

          const variants = product.product_variant;
          for (let index = 0; index < variants.length; index++) {
            const variant = variants[index];

            if (variant.variant_name == data.product_name) {
              price = variant.variant_price;
              variant_discount_price = variant.variant_discount_price ?? 0;
              break;
            }
          }

          if (!price) {
            return ctx.badRequest("Product not found!");
          }

          if (variant_discount_price == 0) {
            data.price = price;
            data.total = price * data.quantity;
            data.discount_price = 0;
          } else {
            is_variant = true;
            data.price = price;
            data.discount_price = variant_discount_price;
            data.total = variant_discount_price * data.quantity;
          }
        }

        data.is_variant = is_variant;
        cart.total = cart.total - old_total;
        cart.total =
          parseFloat(cart.total.toFixed(3)) + parseFloat(data.total.toFixed(3));

        await strapi.entityService.update("api::cart.cart", cart.id, {
          data: {
            total: cart.total,
          },
        });

        // Create a new product
        body.data = data;
        ctx.request.body = body;
        return await super.update(ctx);
      } catch (err) {
        // Handle errors
        return ctx.badRequest(err.message);
      }
    },
    async delete(ctx) {
      await this.validateQuery(ctx);

      const { id } = ctx.params;
      const { user } = ctx.state;
      const { query } = ctx;

      const cart_item = await strapi.entityService.findOne(
        "api::cart-item.cart-item",
        id,
        {
          populate: { cart: true },
        }
      );

      if (!cart_item) {
        return ctx.badRequest("Cart item not found!");
      }

      if (cart_item.user_id != user.id) {
        return ctx.forbidden("Access denied!");
      }

      const cart = await strapi.entityService.findOne(
        "api::cart.cart",
        cart_item.cart.id
      );

      let old_discount_price = cart_item.discount_price ?? 0;
      let old_total = cart_item.price * cart_item.quantity;
      if (old_discount_price != 0) {
        old_total = old_discount_price * cart_item.quantity;
      }

      cart.total = cart.total - old_total;

      await strapi.entityService.update("api::cart.cart", cart.id, {
        data: {
          total: cart.total,
        },
      });

      try {
        return await super.delete(ctx);
      } catch (error) {
        console.error("Error deleting entity:", error);
        return ctx.badRequest("Failed to delete entity");
      }
    },
  })
);
