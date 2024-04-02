"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/get-products-by-category/:id",
      handler: "custom.getProductsByCategory",
    },
    {
      method: "GET",
      path: "/search/:search",
      handler: "custom.searchProduct",
    },
  ],
};
