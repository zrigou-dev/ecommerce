"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/customer/scan/:name",
      handler: "custom.scan",
    },
    {
      method: "PUT",
      path: "/user/update-profile",
      handler: "custom.updateProfile",
    },
  ],
};
