import AuthLogo from "./extensions/favicon.png";
import favicon from "./extensions/favicon.png";

const config = {
  auth: {
    logo: AuthLogo,
  },
  // Replace the favicon
  head: {
    favicon: favicon,
  },
  menu: {
    logo: AuthLogo,
  },
  locales: ["fr"],
  theme: {
    light: {
      colors: {
        primary100: "#f6ecfc",
        primary200: "#e0c1f4",
        primary500: "#d77900",
        primary600: "#fb8a26",
        primary700: "#ae6200",
        danger700: "#b72b1a",
      },
    },
    dark: {
      primary100: "#f6ecfc",
      primary200: "#e0c1f4",
      primary500: "#d77900",
      primary600: "#fb8a26",
      primary700: "#ae6200",
      danger700: "#b72b1a",
    },
  },
  translations: {
    fr: {
      "content-manager.containers.List.nbrs_products": "Nombre des produits",
      "Auth.form.welcome.title": "Bienvenue anis !",
      "app.components.LeftMenu.navbrand.title": "Super dashboard",
      "app.components.LeftMenu.navbrand.workplace": "Administration",
    },
    en: {
      "content-manager.containers.List.nbrs_products": "Nbrs products",
      "Auth.form.welcome.title": "Welcome to anis",
      "app.components.LeftMenu.navbrand.title": "anis dashboard",
      "app.components.LeftMenu.navbrand.workplace": "Admin panel",
    },
  },
  // Disable video tutorials
  tutorials: false,
  // Disable notifications about new Strapi releases
  notifications: { release: false },
};

const bootstrap = (app) => {
  console.log(app);
  document.title = "anis e-commerce";
};

export default {
  config,
  bootstrap,
};
