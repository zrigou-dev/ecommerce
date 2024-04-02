import type { Schema, Attribute } from '@strapi/strapi';

export interface CartCartProductItem extends Schema.Component {
  collectionName: 'components_ext_cart_product_items';
  info: {
    displayName: 'Cart Product Item';
    icon: 'arrowRight';
    description: '';
  };
  attributes: {
    product: Attribute.Relation<
      'cart.cart-product-item',
      'oneToOne',
      'api::product.product'
    >;
    quantity: Attribute.Integer & Attribute.Required;
    price: Attribute.Decimal & Attribute.Required;
    total: Attribute.Decimal & Attribute.Required;
    variant: Attribute.String;
    product_name: Attribute.String;
  };
}

export interface CartCartProducts extends Schema.Component {
  collectionName: 'components_ext_cart_products';
  info: {
    displayName: 'Cart Products';
    icon: 'grid';
    description: '';
  };
  attributes: {
    items: Attribute.Component<'ext.cart-product-item', true>;
  };
}

export interface ExtPictogram extends Schema.Component {
  collectionName: 'components_ext_pictograms';
  info: {
    displayName: 'Pictogram';
    icon: 'pinMap';
    description: '';
  };
  attributes: {
    image: Attribute.Media;
    color: Attribute.String & Attribute.Required;
    size: Attribute.String;
  };
}

export interface OrderOrderProductItem extends Schema.Component {
  collectionName: 'components_order_order_product_items';
  info: {
    displayName: 'Order Product Item';
    icon: 'arrowRight';
    description: '';
  };
  attributes: {
    product: Attribute.Relation<
      'order.order-product-item',
      'oneToOne',
      'api::product.product'
    >;
    quantity: Attribute.Integer & Attribute.Required;
    price: Attribute.Decimal & Attribute.Required;
    total: Attribute.Decimal & Attribute.Required;
    variant: Attribute.String;
    product_name: Attribute.String;
  };
}

export interface OrderOrderProducts extends Schema.Component {
  collectionName: 'components_order_order_products';
  info: {
    displayName: 'Order Products';
    icon: 'grid';
    description: '';
  };
  attributes: {
    items: Attribute.Component<'order.order-product-item', true>;
  };
}

export interface ProductProductVariant extends Schema.Component {
  collectionName: 'components_ext_product_variants';
  info: {
    displayName: 'ProductVariant';
    icon: 'dashboard';
    description: '';
  };
  attributes: {
    variant_name: Attribute.String & Attribute.Required;
    variant_price: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    variant_discount_price: Attribute.Decimal & Attribute.DefaultTo<0>;
    images: Attribute.Media;
    thumbnail: Attribute.Media & Attribute.Required;
    quantity: Attribute.BigInteger &
      Attribute.Required &
      Attribute.DefaultTo<'0'>;
    in_stock: Attribute.Boolean & Attribute.DefaultTo<true>;
    size: Attribute.String;
    color: Attribute.String &
      Attribute.CustomField<'plugin::color-picker.color'>;
    product_free: Attribute.Relation<
      'product.product-variant',
      'oneToOne',
      'api::product.product'
    >;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'cart.cart-product-item': CartCartProductItem;
      'cart.cart-products': CartCartProducts;
      'ext.pictogram': ExtPictogram;
      'order.order-product-item': OrderOrderProductItem;
      'order.order-products': OrderOrderProducts;
      'product.product-variant': ProductProductVariant;
    }
  }
}
