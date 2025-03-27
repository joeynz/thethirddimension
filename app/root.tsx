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
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export type RootLoader = typeof loader;

interface RootData {
  cart: Promise<CartReturn | null>;
  isLoggedIn: Promise<boolean>;
  shop: Promise<ShopAnalytics | null>;
  header: any;
  footer: Promise<any>;
  publicStoreDomain: string;
  consent: {
    language?: string;
  };
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
    {
      'content-security-policy': `
        default-src 'self' https://cdn.shopify.com https://shopify.com 'unsafe-eval' 'unsafe-inline' blob:;
        worker-src 'self' blob:;
        connect-src 'self' https://monorail-edge.shopifysvc.com https://the-third-dimension.xyz https://bsbunj-hc.myshopify.com https://cdn.jsdelivr.net;
        font-src 'self' https://cdn.jsdelivr.net;
        media-src 'self' https://cdn.shopify.com https://bsbunj-hc.myshopify.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
      `.replace(/\s+/g, ' ').trim(),
    },
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  const {context} = args;
  
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env, cart, customerAccount} = context;
  const cartPromise = cart.get();
  const isLoggedInPromise = customerAccount.isLoggedIn();
  const shopPromise = getShopAnalytics({
    storefront,
    publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
  });

  return json(
    {
      ...deferredData,
      ...criticalData,
      publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
      cart: cartPromise,
      isLoggedIn: isLoggedInPromise,
      shop: shopPromise,
      consent: {
        language: context.storefront.i18n.language,
      },
    },
    {
      headers: {
        'content-security-policy': `
          default-src 'self' https://cdn.shopify.com https://shopify.com 'unsafe-eval' 'unsafe-inline' blob:;
          worker-src 'self' blob:;
          connect-src 'self' https://monorail-edge.shopifysvc.com https://the-third-dimension.xyz https://bsbunj-hc.myshopify.com https://cdn.jsdelivr.net;
          font-src 'self' https://cdn.jsdelivr.net;
          media-src 'self' https://cdn.shopify.com https://bsbunj-hc.myshopify.com;
          object-src 'none';
          base-uri 'self';
          form-action 'self';
          frame-ancestors 'none';
          block-all-mixed-content;
        `.replace(/\s+/g, ' ').trim(),
      },
    },
  );
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData(args: LoaderFunctionArgs) {
  const {context} = args;
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu',
      },
    }),
  ]);

  return {header};
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
      },
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root') as RootData;
  const location = useLocation();
  const isHomepage = location.pathname === '/';

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
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            {isHomepage ? (
              children
            ) : (
              <PageLayout {...data}>{children}</PageLayout>
            )}
          </Analytics.Provider>
        ) : (
          children
        )}
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
