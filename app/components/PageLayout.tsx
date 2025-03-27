import {Await, Link} from '@remix-run/react';
import {Suspense, useId} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import type {CartReturn, ShopAnalytics} from '@shopify/hydrogen';
import {Aside, useAside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

interface PageLayoutProps {
  cart: Promise<CartReturn | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
  shop?: Promise<ShopAnalytics | null>;
  consent?: {
    language?: string;
  };
}

function CartAside({cart}: {cart: CartReturn | null}) {
  return (
    <Aside type="cart" heading="CART">
      <CartMain cart={cart} layout="aside" />
    </Aside>
  );
}

function SearchAside() {
  return (
    <Aside type="search" heading="SEARCH">
      <div className="predictive-search">
        <br />
        <SearchFormPredictive>
          {({fetchResults, inputRef}) => (
            <div>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                onBlur={() => {
                  setTimeout(() => {
                    window.scrollTo(0, 0);
                  }, 300);
                }}
                placeholder="Search"
                ref={inputRef}
                type="search"
              />
              <div className="predictive-search__results">
                <Suspense>
                  <SearchResultsPredictive>
                    {({items, total, term, state, closeSearch}) => {
                      if (state === 'loading' && term.current) {
                        return <div>Loading...</div>;
                      }

                      if (!total) {
                        return <SearchResultsPredictive.Empty term={term} />;
                      }

                      return (
                        <>
                          <SearchResultsPredictive.Products
                            products={items.products}
                            closeSearch={closeSearch}
                            term={term}
                          />
                          {term.current && total ? (
                            <Link
                              onClick={closeSearch}
                              to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                            >
                              <p>
                                View all results for <q>{term.current}</q>
                                &nbsp; →
                              </p>
                            </Link>
                          ) : null}
                        </>
                      );
                    }}
                  </SearchResultsPredictive>
                </Suspense>
              </div>
            </div>
          )}
        </SearchFormPredictive>
      </div>
    </Aside>
  );
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
  shop,
  consent,
}: PageLayoutProps) {
  const cartAsideId = useId();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Header
          cart={cart}
          header={header}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
        <main>{children}</main>
        <Suspense>
          <Await resolve={cart}>
            {(resolvedCart) => (
              <CartAside cart={resolvedCart} />
            )}
          </Await>
        </Suspense>
        <SearchAside />
        <Suspense>
          <Await resolve={footer}>
            {(footer) => (
              <Footer
                footer={Promise.resolve(footer)}
                header={header}
                publicStoreDomain={publicStoreDomain}
              />
            )}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}
