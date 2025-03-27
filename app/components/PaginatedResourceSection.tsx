import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from '@remix-run/react';
import {useFetcher} from '@remix-run/react';
import {useInView} from 'react-intersection-observer';
import {useEffectEvent} from '~/lib/hooks';
import {Button} from '~/components/ui/button';
import {Skeleton} from '~/components/ui/skeleton';
import {cn} from '~/lib/utils';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 */
interface PaginatedResourceSectionProps {
  children: (props: {
    nodes: any[];
    isLoading: boolean;
    isNextPage: boolean;
    hasNextPage: boolean;
    state: 'idle' | 'loading' | 'submitting' | 'revalidating';
  }) => React.ReactNode;
  className?: string;
  connectionType: string;
  url: string;
  nodes: any[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  nextPageUrl: string;
  hasNextPage: boolean;
  state: 'idle' | 'loading' | 'submitting' | 'revalidating';
  startCursor?: string | null;
  endCursor?: string | null;
}

export function PaginatedResourceSection({
  children,
  className,
  connectionType,
  url,
  nodes: initialNodes,
  pageInfo,
  nextPageUrl,
  hasNextPage,
  state,
  startCursor,
  endCursor,
}: PaginatedResourceSectionProps) {
  const {nodes, nextPageUrl: newNextPageUrl, hasNextPage: newHasNextPage} = pageInfo;
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const {ref, inView} = useInView();

  const [resources, setResources] = useState(initialNodes);

  const loadMore = useCallback(
    () => {
      if (!nextPageUrl || !hasNextPage || fetcher.state !== 'idle') return;
      fetcher.load(nextPageUrl);
    },
    [fetcher, nextPageUrl, hasNextPage],
  );

  useEffect(() => {
    if (inView && !nextPageUrl && !hasNextPage) {
      navigate(endCursor ? `?${connectionType}cursor=${encodeURIComponent(endCursor)}` : url);
    }
  }, [inView, navigate, hasNextPage, nextPageUrl, url, endCursor, connectionType]);

  useEffect(() => {
    if (fetcher?.data?.nodes) {
      const lastNodeOfFirstSet = initialNodes[initialNodes.length - 1];
      const {startCursor, endCursor} = fetcher.data;
      const nodes = fetcher.data.nodes;

      if (startCursor === lastNodeOfFirstSet?.cursor) {
        setResources((prev: any[]) => [...prev, ...nodes]);
      }
    }
  }, [fetcher?.data?.nodes, fetcher?.data?.startCursor, initialNodes]);

  const resourcesMarkup = resources.length > 0 ? (
    <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {children({
        nodes: resources,
        isLoading: state === 'loading',
        isNextPage: !!nextPageUrl,
        hasNextPage: newHasNextPage,
        state,
      })}
    </div>
  ) : null;

  return (
    <>
      {resourcesClassName ? (
        <div className={resourcesClassName}>{resourcesMarkup}</div>
      ) : (
        resourcesMarkup
      )}
      {newHasNextPage && (
        <div
          ref={ref}
          className="flex items-center justify-center mt-6"
        >
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={fetcher.state !== 'idle'}
          >
            {fetcher.state !== 'idle' ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </>
  );
}
