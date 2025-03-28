import {useNonce, getShopAnalytics, Analytics} from '@shopify/hydrogen';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import type {CartReturn, ShopAnalytics} from '@shopify/hydrogen';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  useRouteError,
  useRouteLoaderData,
  ScrollRestoration,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  useLocation,
  LiveReload,
} from '@remix-run/react';
import favicon from '~/assets/favicon.svg';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from '~/components/PageLayout';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import {json} from '@shopify/remix-oxygen';
import type {CartApiQueryFragment, FooterQuery, HeaderQuery} from 'storefrontapi.generated';

export type RootLoader = typeof loader;

type LanguageCode = 'EN' | 'ES' | 'FR' | 'DE' | 'JA';

interface ConsentData {
  language?: LanguageCode;
  checkoutDomain?: string;
  storefrontAccessToken?: string;
}

interface RootData {
  cart: Promise<CartReturn | null>;
  isLoggedIn: Promise<boolean>;
  shop: Promise<ShopAnalytics | null>;
  header: HeaderQuery;
  footer: Promise<FooterQuery | null>;
  publicStoreDomain: string;
  consent: ConsentData;
}

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

export function meta() {
  return [
    {title: 'The Third Dimension'},
    {description: 'A revolutionary 3D ecommerce experience'},
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  const {context} = args;
  
  try {
    console.log('=== ROOT LOADER STARTED ===');
    console.log('Context available:', !!context);
    console.log('Storefront available:', !!context?.storefront);
    
    // Start fetching non-critical data without blocking time to first byte
    console.log('Loading deferred data...');
    const deferredData = loadDeferredData(args);
    console.log('Deferred data loaded');

    // Await the critical data required to render initial state of the page
    console.log('Loading critical data...');
    const criticalData = await loadCriticalData(args);
    console.log('Critical data loaded');

    const {storefront, env, cart, customerAccount} = context;
    console.log('Environment variables:', {
      hasStorefrontId: !!env.PUBLIC_STOREFRONT_ID,
      hasStoreDomain: !!env.PUBLIC_STORE_DOMAIN,
      hasCheckoutDomain: !!env.PUBLIC_CHECKOUT_DOMAIN,
      hasStorefrontApiToken: !!env.PUBLIC_STOREFRONT_API_TOKEN
    });

    const cartPromise = cart.get();
    const isLoggedInPromise = customerAccount.isLoggedIn();
    
    // Handle missing environment variables
    const publicStorefrontId = env.PUBLIC_STOREFRONT_ID || 'default';
    const publicStoreDomain = env.PUBLIC_STORE_DOMAIN || 'bsbunj-hc.myshopify.com';
    const publicCheckoutDomain = env.PUBLIC_CHECKOUT_DOMAIN || 'bsbunj-hc.myshopify.com';
    const publicStorefrontApiToken = env.PUBLIC_STOREFRONT_API_TOKEN || 'default';

    console.log('Fetching shop analytics...');
    const shopPromise = getShopAnalytics({
      storefront,
      publicStorefrontId,
    });
    console.log('Shop analytics promise created');

    // Ensure header is always defined
    const header = criticalData.header || {
      shop: {
        id: 'default',
        name: 'The Third Dimension',
        description: 'A revolutionary 3D ecommerce experience',
        primaryDomain: {
          url: 'https://the-third-dimension.xyz',
        },
        brand: {
          logo: {
            image: {
              url: '',
            },
          },
        },
      },
      menu: null,
    };

    console.log('=== ROOT LOADER SUCCESS ===');
    return json(
      {
        ...deferredData,
        ...criticalData,
        header,
        publicStoreDomain,
        cart: cartPromise,
        isLoggedIn: isLoggedInPromise,
        shop: shopPromise,
        consent: {
          language: context.storefront.i18n.language,
          checkoutDomain: publicCheckoutDomain,
          storefrontAccessToken: publicStorefrontApiToken,
        },
      } as RootData,
      {
        headers: {
          'content-security-policy': `
            default-src 'self' https://cdn.shopify.com https://shopify.com 'unsafe-eval';
            worker-src 'self' blob: 'unsafe-eval';
            connect-src 'self' https://monorail-edge.shopifysvc.com https://the-third-dimension.xyz https://bsbunj-hc.myshopify.com https://cdn.jsdelivr.net https://cdn.shopify.com https://shopify.com https://*.jsdelivr.net https://*.githubusercontent.com https://*.github.com;
            font-src 'self' https://cdn.jsdelivr.net;
            media-src 'self' https://cdn.shopify.com https://bsbunj-hc.myshopify.com;
            object-src 'none';
            base-uri 'self';
            form-action 'self';
            frame-ancestors 'none';
            block-all-mixed-content;
            script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:;
            style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
            img-src 'self' data: https://cdn.shopify.com https://bsbunj-hc.myshopify.com https://*.myshopify.com;
          `.replace(/\s+/g, ' ').trim(),
        },
      },
    );
  } catch (error) {
    console.error('=== ERROR IN ROOT LOADER ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Context state:', {
      hasContext: !!context,
      hasStorefront: !!context?.storefront,
      hasEnv: !!context?.env
    });
    
    return json(
      {
        header: {
          shop: {
            id: 'default',
            name: 'The Third Dimension',
            description: 'A revolutionary 3D ecommerce experience',
            primaryDomain: {
              url: 'https://the-third-dimension.xyz',
            },
            brand: {
              logo: {
                image: {
                  url: '',
                },
              },
            },
          },
          menu: null,
        },
        cart: Promise.resolve(null),
        isLoggedIn: Promise.resolve(false),
        shop: Promise.resolve(null),
        footer: Promise.resolve(null),
        publicStoreDomain: 'bsbunj-hc.myshopify.com',
        consent: {
          language: 'EN',
          checkoutDomain: 'bsbunj-hc.myshopify.com',
          storefrontAccessToken: 'default',
        },
      } as RootData,
      {
        status: 200,
        headers: {
          'content-security-policy': `
            default-src 'self' https://cdn.shopify.com https://shopify.com 'unsafe-eval';
            worker-src 'self' blob: 'unsafe-eval';
            connect-src 'self' https://monorail-edge.shopifysvc.com https://the-third-dimension.xyz https://bsbunj-hc.myshopify.com https://cdn.jsdelivr.net https://cdn.shopify.com https://shopify.com https://*.jsdelivr.net https://*.githubusercontent.com https://*.github.com;
            font-src 'self' https://cdn.jsdelivr.net;
            media-src 'self' https://cdn.shopify.com https://bsbunj-hc.myshopify.com;
            object-src 'none';
            base-uri 'self';
            form-action 'self';
            frame-ancestors 'none';
            block-all-mixed-content;
            script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:;
            style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
            img-src 'self' data: https://cdn.shopify.com https://bsbunj-hc.myshopify.com https://*.myshopify.com;
          `.replace(/\s+/g, ' ').trim(),
        },
      },
    );
  }
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData(args: LoaderFunctionArgs) {
  const {context} = args;
  const {storefront} = context;

  try {
    console.log('=== LOADING CRITICAL DATA STARTED ===');
    console.log('Storefront available:', !!storefront);
    console.log('Language:', context.storefront.i18n.language);
    console.log('Country:', context.storefront.i18n.country);

    const [header] = await Promise.all([
      storefront.query(HEADER_QUERY, {
        cache: storefront.CacheLong(),
        variables: {
          headerMenuHandle: 'main-menu',
          language: context.storefront.i18n.language,
          country: context.storefront.i18n.country,
        },
      }),
    ]);

    console.log('=== CRITICAL DATA LOADED SUCCESSFULLY ===');
    return {
      header,
    };
  } catch (error) {
    console.error('=== ERROR LOADING CRITICAL DATA ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Context state:', {
      hasContext: !!context,
      hasStorefront: !!context?.storefront,
      hasI18n: !!context?.storefront?.i18n
    });
    throw error;
  }
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData(args: LoaderFunctionArgs) {
  const {context} = args;
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer',
        language: context.storefront.i18n.language,
        country: context.storefront.i18n.country,
      },
    })
    .catch((error) => {
      console.error('Error loading footer:', error);
      return null;
    });

  const cartPromise = cart.get().catch((error) => {
    console.error('Error loading cart:', error);
    return null;
  });

  const isLoggedInPromise = customerAccount.isLoggedIn().catch((error) => {
    console.error('Error checking login status:', error);
    return false;
  });

  return {
    cart: cartPromise,
    isLoggedIn: isLoggedInPromise,
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root') as RootData;
  const location = useLocation();

  if (!data) {
    return null;
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        <Analytics.Provider
          cart={data.cart}
          shop={data.shop}
          consent={data.consent}
        >
          <PageLayout {...data}>{children}</PageLayout>
        </Analytics.Provider>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError() as Error | unknown;
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}
