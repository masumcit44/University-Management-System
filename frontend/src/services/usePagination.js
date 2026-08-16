import { useEffect, useMemo, useState } from "react";

// Pure client-side paging for the dense data tables. Pages the already-loaded
// array only - no API, no routing changes. Resets to page 1 whenever the
// filtered dataset changes.
export function usePagination(rows, { pageSize = 50 } = {}) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil((rows || []).length / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (rows || []).slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const startIndex = (rows || []).length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, (rows || []).length);

  return {
    page,
    setPage,
    pageCount,
    startIndex,
    endIndex,
    pageItems,
  };
}
