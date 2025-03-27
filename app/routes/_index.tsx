import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {Experience} from '~/components/3d/Experience';
import {Header} from '~/components/Header';
import type {CartReturn} from '@shopify/hydrogen';
import type {HeaderQuery, FooterQuery} from 'storefrontapi.generated';
import {PageLayout} from '~/components/PageLayout';
import {FOOTER_QUERY} from '~/lib/fragments';

interface MediaEdge {
  node: {
    __typename: string;
    url?: string;
    alt?: string | null;
    previewImage?: {
      url: string;
    };
    sources?: Array<{
      url: string;
      format: string;
      mimeType: string;
      filesize: number;
    }>;
  };
}

interface ModelSource {
  url: string;
  format: string;
  mimeType: string;
  filesize: number;
}

type LoaderData = {
  header: HeaderQuery | null;
  cart: Promise<CartReturn | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  shop: Promise<any> | null;
  product: any | null;
  error: string | null;
  footer: Promise<FooterQuery | null>;
};

export function meta() {
  return [
    {title: 'The Third Dimension | Home'},
    {description: 'A revolutionary 3D ecommerce experience'},
  ];
}

export async function loader({context}: LoaderFunctionArgs): Promise<ReturnType<typeof defer<LoaderData>>> {
  console.log('=== LOADER STARTED ===');
  
  try {
    if (!context) {
      console.error('=== ERROR: Context is missing ===');
      return defer<LoaderData>({
        header: null,
        cart: Promise.resolve(null),
        isLoggedIn: Promise.resolve(false),
        publicStoreDomain: '',
        shop: null,
        product: null,
        error: 'Context is not available',
        footer: Promise.resolve(null)
      });
    }

    console.log('=== CONTEXT AVAILABLE ===');

    if (!context.storefront) {
      console.error('=== ERROR: Storefront context is missing ===');
      return defer<LoaderData>({
        header: null,
        cart: Promise.resolve(null),
        isLoggedIn: Promise.resolve(false),
        publicStoreDomain: '',
        shop: null,
        product: null,
        error: 'Storefront API is not configured',
        footer: Promise.resolve(null)
      });
    }

    console.log('=== STOREFRONT CONTEXT AVAILABLE ===');
    const {storefront} = context;

    // Fetch header data
    const {header} = await storefront.query<{header: HeaderQuery}>(HEADER_QUERY);
    const cart = context.cart.get();
    const isLoggedIn = context.customerAccount.isLoggedIn();
    const publicStoreDomain = context.env.PUBLIC_STORE_DOMAIN;
    const footer = storefront.query(FOOTER_QUERY, {
      variables: {
        footerMenuHandle: 'footer',
        language: context.storefront.i18n.language,
        country: context.storefront.i18n.country,
      },
    });

    // First, let's get a list of all products to see what's available
    const LIST_PRODUCTS_QUERY = `#graphql
      query {
        products(first: 10) {
          edges {
            node {
              id
              title
              handle
              availableForSale
            }
          }
        }
      }
    `;

    console.log('=== ATTEMPTING TO FETCH ALL PRODUCTS ===');
    let productsResult;
    try {
      productsResult = await storefront.query(LIST_PRODUCTS_QUERY);
      console.log('=== AVAILABLE PRODUCTS ===', JSON.stringify(productsResult, null, 2));
    } catch (productsError) {
      console.error('=== ERROR FETCHING PRODUCTS ===', productsError);
      throw productsError;
    }

    // Now try to get our specific product
    console.log('=== ATTEMPTING TO FETCH SPECIFIC PRODUCT ===');
    let productResult;
    try {
      productResult = await storefront.query(PRODUCT_QUERY, {
        variables: {
          handle: 'test-chair',
        },
      });
      console.log('=== SPECIFIC PRODUCT RESULT ===', JSON.stringify(productResult, null, 2));
    } catch (productError) {
      console.error('=== ERROR FETCHING SPECIFIC PRODUCT ===', productError);
      throw productError;
    }
    
    const {product} = productResult;
    
    if (!product) {
      console.error('=== ERROR: Product not found ===');
      return defer<LoaderData>({
        header,
        cart,
        isLoggedIn,
        publicStoreDomain,
        shop: storefront.query(SHOP_QUERY),
        product: null,
        error: 'Product not found',
        footer: Promise.resolve(null)
      });
    }

    // Find the 3D model in the media collection
    const model3d = product.media?.edges?.find((edge) => 
      edge.node?.__typename === 'Model3d' && 'sources' in edge.node
    )?.node;

    if (!model3d || !('sources' in model3d)) {
      console.error('=== ERROR: Product has no 3D model data ===', {
        hasMedia: !!product.media,
        mediaEdges: product.media?.edges?.length,
        mediaTypes: product.media?.edges?.map((edge) => edge.node?.__typename)
      });
      return defer<LoaderData>({
        header,
        cart,
        isLoggedIn,
        publicStoreDomain,
        shop: storefront.query(SHOP_QUERY),
        product: {
          ...product,
          model3d: null
        },
        error: 'Product has no 3D model',
        footer
      });
    }

    // Get the first GLB or GLTF source
    const modelSource = model3d.sources?.find((source) => 
      source.format === 'GLB' || 
      source.format === 'GLTF' ||
      source.mimeType === 'model/gltf-binary' ||
      source.mimeType === 'model/gltf+json'
    );

    if (!modelSource) {
      console.error('=== ERROR: No valid 3D model source found ===', {
        sources: model3d.sources
      });
      return defer<LoaderData>({
        header,
        cart,
        isLoggedIn,
        publicStoreDomain,
        shop: storefront.query(SHOP_QUERY),
        product: {
          ...product,
          model3d: null
        },
        error: 'No valid 3D model source found',
        footer
      });
    }

    console.log('=== PRODUCT LOADER SUCCESS ===');
    return defer<LoaderData>({
      header,
      cart,
      isLoggedIn,
      publicStoreDomain,
      shop: storefront.query(SHOP_QUERY),
      product: {
        ...product,
        model3d: modelSource ? {
          url: modelSource.url,
          format: modelSource.format,
          mimeType: modelSource.mimeType,
          filesize: modelSource.filesize,
        } : null,
      },
      error: null,
      footer
    });
  } catch (error) {
    console.error('=== ERROR IN LOADER ===', error);
    return defer<LoaderData>({
      header: null,
      cart: Promise.resolve(null),
      isLoggedIn: Promise.resolve(false),
      publicStoreDomain: '',
      shop: null,
      product: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      footer: Promise.resolve(null)
    });
  }
}

export default function Homepage() {
  const {header, cart, isLoggedIn, publicStoreDomain, product, error, footer} = useLoaderData<typeof loader>();
  console.log('=== RENDERING HOMEPAGE ===');
  console.log('=== LOADER DATA ===', {header, product, error});

  // Provide default header if missing
  const defaultHeader = {
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

  const headerData = header || defaultHeader;

  return (
    <PageLayout
      header={headerData}
      cart={cart}
      isLoggedIn={isLoggedIn}
      publicStoreDomain={publicStoreDomain}
      footer={footer || Promise.resolve(null)}
    >
      <Experience product={product} />
    </PageLayout>
  );
}

const HEADER_QUERY = `#graphql
  query header {
    shop {
      name
      primaryDomain {
        url
      }
    }
    menu(handle: "main-menu") {
      id
      items {
        id
        url
        title
      }
    }
  }
`;

const SHOP_QUERY = `#graphql
  query layout {
    shop {
      name
      description
    }
  }
`;

const PRODUCT_QUERY = `#graphql
  query HomepageProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      availableForSale
      media(first: 10) {
        edges {
          node {
            __typename
            ... on Model3d {
              id
              sources {
                url
                format
                mimeType
                filesize
              }
              alt
            }
          }
        }
      }
    }
  }
`;