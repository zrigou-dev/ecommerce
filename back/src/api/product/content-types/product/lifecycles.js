"use strict";

const slugify = require("slugify");

module.exports = {
  async beforeDelete(event) {
    const { where } = event.params;

    const entry = await strapi.entityService.findOne(
      "api::product.product",
      where.id,
      {
        populate: {
          thumbnail: true,
          images: true,
          category: true,
        },
      }
    );

    try {
      const count = await strapi.db.query("api::product.product").count({
        where: {
          category: {
            id: entry.category.id,
          },
        },
      });

      await strapi.entityService.update(
        "api::category.category",
        entry.category.id,
        {
          data: {
            nbrs_products: count - 1,
          },
        }
      );

      // if (entry.thumbnail) {
      //   const imageEntry = await strapi.db.query("plugin::upload.file").delete({
      //     where: { id: entry.thumbnail.id },
      //   });
      //   // This will delete corresponding image files under the *upload* folder.
      //   strapi.plugins.upload.services.upload.remove(imageEntry);
      // }

      // if (entry.images) {
      //   for (let addImg of entry.images) {
      //     const imageEntry = await strapi.db
      //       .query("plugin::upload.file")
      //       .delete({
      //         where: { id: addImg.id },
      //       });
      //     // This will delete corresponding image files under the *upload* folder.
      //     strapi.plugins.upload.services.upload.remove(imageEntry);
      //   }
      // }
    } catch (error) {
      console.error(error);
    }
  },
  async beforeDeleteMany(event) {
    let update = false;
    for (let id of event.params.where.$and[0].id.$in) {
      const entry = await strapi.entityService.findOne(
        "api::product.product",
        id,
        {
          populate: {
            thumbnail: true,
            images: true,
            category: true,
          },
        }
      );

      try {
        if (false === update) {
          let count = await strapi.db.query("api::product.product").count({
            where: {
              category: {
                id: entry.category.id,
              },
            },
          });
          await strapi.entityService.update(
            "api::category.category",
            entry.category.id,
            {
              data: {
                nbrs_products: count - event.params.where.$and[0].id.$in.length,
              },
            }
          );

          update = true;
        }
        //   if (entry.thumbnail) {
        //     const imageEntry = await strapi.db
        //       .query("plugin::upload.file")
        //       .delete({
        //         where: { id: entry.thumbnail.id },
        //       });
        //     // This will delete corresponding image files under the *upload* folder.
        //     strapi.plugins.upload.services.upload.remove(imageEntry);
        //   }
        //   if (entry.images) {
        //     for (let addImg of entry.images) {
        //       const imageEntry = await strapi.db
        //         .query("plugin::upload.file")
        //         .delete({
        //           where: { id: addImg.id },
        //         });
        //       // This will delete corresponding image files under the *upload* folder.
        //       strapi.plugins.upload.services.upload.remove(imageEntry);
        //     }
        //   }
      } catch (error) {
        console.error(error);
      }
    }
  },
  async beforeCreate(event) {
    if (event.params.data.name) {
      event.params.data.slug = slugify(event.params.data.name, { lower: true });
    }
  },
  async beforeUpdate(event) {
    if (event.params.data.name) {
      event.params.data.slug = slugify(event.params.data.name, { lower: true });
    }
  },
  async afterCreate(event) {
    const { result, params } = event;

    const category_id = params.data.category.connect[0].id;

    const count = await strapi.db.query("api::product.product").count({
      where: {
        category: {
          id: category_id,
        },
      },
    });

    await strapi.entityService.update("api::category.category", category_id, {
      data: {
        nbrs_products: count,
      },
    });
  },
};
