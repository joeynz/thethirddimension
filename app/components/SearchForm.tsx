import {useRef} from 'react';
import {useNavigate} from '@remix-run/react';
import {useFocusOnCmdK} from '~/lib/hooks';

interface SearchFormProps {
  children: (props: {inputRef: React.RefObject<HTMLInputElement>}) => React.ReactNode;
}

/**
 * Search form component that sends search requests to the `/search` route.
 * @example
 * ```tsx
 * <SearchForm>
 *  {({inputRef}) => (
 *    <>
 *      <input
 *        ref={inputRef}
 *        type="search"
 *        defaultValue={term}
 *        name="q"
 *        placeholder="Search…"
 *      />
 *      <button type="submit">Search</button>
 *   </>
 *  )}
 *  </SearchForm>
 */
export function SearchForm({children}: SearchFormProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusOnCmdK(inputRef);

  return (
    <form
      role="search"
      className="relative flex w-full items-center"
      onSubmit={(e) => {
        e.preventDefault();
        const searchValue = e.currentTarget.search.value;
        if (!searchValue) return;
        navigate(`/search?q=${encodeURIComponent(searchValue)}`);
      }}
    >
      {children({inputRef})}
    </form>
  );
}

/**
 * Focuses the input when cmd+k is pressed
 */
function useFocusOnCmdK(inputRef: React.RefObject<HTMLInputElement>) {
  // focus the input when cmd+k is pressed
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && event.metaKey) {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (event.key === 'Escape') {
        inputRef.current?.blur();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputRef]);
}
