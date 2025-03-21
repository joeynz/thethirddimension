import {defineConfig} from '@shopify/hydrogen/config';

export default defineConfig({
  shopify: {
    defaultCountryCode: 'US',
    defaultLanguageCode: 'EN',
    storeDomain: process.env.PUBLIC_STORE_DOMAIN,
    storefrontToken: process.env.PUBLIC_STOREFRONT_API_TOKEN,
    storefrontApiVersion: '2024-01',
  },
  session: {
    storage: 'memory',
  },
}); 