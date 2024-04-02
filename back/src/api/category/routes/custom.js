"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/top-categories",
      handler: "custom.topCategories",
    },
    {
      method: "GET",
      path: "/four-product-by-categories",
      handler: "custom.fourProductByCategories",
    },
  ],
};
