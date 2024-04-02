module.exports = ({ env }) => ({
  upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000,
        },
      },
    },
  },
  "qrcode-generator": {
    enabled: true,
    config: {
      contentTypes: [
        {
          uid: "api::customer.customer",
          targetField: "name",
          frontend: {
            basePath: "/customer/scan",
          },
        },
      ],
    },
  },
});
