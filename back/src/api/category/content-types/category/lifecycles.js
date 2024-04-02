"use strict";

const slugify = require("slugify");

module.exports = {
  async beforeDelete(event) {
    const { where } = event.params;

    const entry = await strapi.entityService.findOne(
      "api::category.category",
      where.id,
      {
        populate: {
          image: true,
        },
      }
    );

    try {
      if (entry.image) {
        const imageEntry = await strapi.db.query("plugin::upload.file").delete({
          where: { id: entry.image.id },
        });
        // This will delete corresponding image files under the *upload* folder.
        strapi.plugins.upload.services.upload.remove(imageEntry);
      }
    } catch (error) {
      console.error(error);
    }
  },
  async beforeDeleteMany(event) {
    for (let id of event.params.where.$and[0].id.$in) {
      const entry = await strapi.entityService.findOne(
        "api::category.category",
        id,
        {
          populate: {
            image: true,
          },
        }
      );

      try {
        if (entry.image) {
          const imageEntry = await strapi.db
            .query("plugin::upload.file")
            .delete({
              where: { id: entry.image.id },
            });
          // This will delete corresponding image files under the *upload* folder.
          strapi.plugins.upload.services.upload.remove(imageEntry);
        }
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

  // async afterFindMany(event) {
  //   const { result, params } = event;

  //   for (let i = 0; i < result.length; i++) {
  //     const category = result[i];
  //     const count = await strapi.db.query("api::product.product").count({
  //       where: {
  //         category: {
  //           id: category.id,
  //         },
  //       },
  //     });
  //     category.nbrs_products = count;
  //     result[i] = category;
  //   }

  //   event.result = result;
  // },
};
