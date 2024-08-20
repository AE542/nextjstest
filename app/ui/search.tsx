'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const {replace} = useRouter();
  // you have to call these outside of the handleSearch otherwise it can't access the searchParams

  // check if search term is being passed
  const handleSearch = useDebouncedCallback((term) => {
    console.log(`Searching...${term}`)
    const params = new URLSearchParams(searchParams);
    // URLSearchParams is a Web API that provides utility methods for manipulating the URL query parameters. 
    // Instead of creating a complex string literal, you can use it to get the params string like ?page=1&query=a.

    // const pathname = usePathname();
    // const {replace} = useRouter();
    // needs to be above the handleSearch function

    // Finally, when the user types a new search query, you want to reset the page number to 1. You can do this by updating the handleSearch function in your <Search> component:
    params.set('page', '1')

    if(term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    // Now that you have the query string. You can use Next.js's useRouter and usePathname hooks to update the URL.
    // Import useRouter and usePathname from 'next/navigation', and use the replace method from useRouter() inside handleSearch
    replace(`${pathname}?${params.toString()}`);
    // replaces the url in realtime with the pathname and the params to string
  }, 400);
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {handleSearch(e.target.value)}}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
