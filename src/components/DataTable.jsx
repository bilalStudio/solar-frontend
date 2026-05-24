import { useState, useMemo } from 'react';

/**
 * Reusable DataTable with:
 * - Pagination
 * - Search/filter
 * - Mobile responsive (card view on small screens)
 * - Sortable columns
 */
export default function DataTable({
  columns,        // [{ key, label, render, sortable, mobileLabel }]
  data,           // array of objects
  pageSize = 10,  // rows per page
  searchKeys,     // array of keys to search across
  emptyMessage = 'No data found.',
  title,
  actions,        // optional JSX for top-right area
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');

  const filtered = useMemo(() => {
    let rows = [...(data || [])];
    if (search && searchKeys?.length) {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      rows.sort((a, b) => {
        const av = String(a[sortKey] ?? '');
        const bv = String(b[sortKey] ?? '');
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return rows;
  }, [data, search, sortKey, sortDir, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const pageNumbers = () => {
    const pages = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= safePage - delta && i <= safePage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <>
      <style>{`
        .dt-wrap { width: 100%; }
        .dt-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
        .dt-title { font-size: 15px; font-weight: 600; color: var(--wv-dark); margin: 0; }
        .dt-search { padding: 7px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; outline: none; min-width: 200px; background: #f8fafc; }
        .dt-search:focus { border-color: var(--wv-primary); background: #fff; }
        .dt-table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid #e8edf3; }
        .dt-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .dt-table th { background: #f8fafc; padding: 10px 14px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e8edf3; white-space: nowrap; user-select: none; }
        .dt-table th.sortable { cursor: pointer; }
        .dt-table th.sortable:hover { background: #f1f5f9; color: var(--wv-primary); }
        .dt-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: var(--wv-dark); vertical-align: middle; }
        .dt-table tr:last-child td { border-bottom: none; }
        .dt-table tr:hover td { background: #f8fafc; }
        .dt-empty { padding: 32px; text-align: center; color: #94a3b8; font-size: 13px; }
        .dt-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
        .dt-info { font-size: 12px; color: #64748b; }
        .dt-pagination { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
        .dt-page-btn { min-width: 32px; height: 32px; padding: 0 8px; border: 1px solid #e2e8f0; background: #fff; border-radius: 6px; font-size: 12px; cursor: pointer; color: var(--wv-dark); display: flex; align-items: center; justify-content: center; }
        .dt-page-btn:hover:not(:disabled) { border-color: var(--wv-primary); color: var(--wv-primary); }
        .dt-page-btn.active { background: var(--wv-primary); color: #fff; border-color: var(--wv-primary); font-weight: 600; }
        .dt-page-btn:disabled { opacity: 0.4; cursor: default; }
        /* Mobile card view */
        .dt-mobile-cards { display: none; }
        @media (max-width: 640px) {
          .dt-table-wrap { display: none; }
          .dt-mobile-cards { display: flex; flex-direction: column; gap: 10px; }
          .dt-card { background: #fff; border: 1px solid #e8edf3; border-radius: 10px; padding: 14px; }
          .dt-card-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; padding: 5px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          .dt-card-row:last-child { border-bottom: none; padding-bottom: 0; }
          .dt-card-label { color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; min-width: 90px; flex-shrink: 0; }
          .dt-card-value { color: var(--wv-dark); text-align: right; word-break: break-word; }
          .dt-search { min-width: 100%; width: 100%; }
          .dt-header { flex-direction: column; align-items: stretch; }
          .dt-footer { flex-direction: column; align-items: center; }
        }
      `}</style>

      <div className="dt-wrap">
        <div className="dt-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {title && <h3 className="dt-title">{title}</h3>}
            {filtered.length > 0 && (
              <span style={{ fontSize: 11, background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 20 }}>
                {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {searchKeys?.length > 0 && (
              <input
                className="dt-search"
                type="text"
                placeholder="Search..."
                value={search}
                onChange={handleSearch}
              />
            )}
            {actions}
          </div>
        </div>

        {/* Desktop table */}
        <div className="dt-table-wrap">
          <table className="dt-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={col.sortable !== false ? 'sortable' : ''}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    {col.label}
                    {col.sortable !== false && sortKey === col.key && (
                      <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={columns.length} className="dt-empty">{search ? `No results for "${search}"` : emptyMessage}</td></tr>
              ) : (
                paginated.map((row, i) => (
                  <tr key={row.id ?? i}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="dt-mobile-cards">
          {paginated.length === 0 ? (
            <div className="dt-empty">{search ? `No results for "${search}"` : emptyMessage}</div>
          ) : (
            paginated.map((row, i) => (
              <div key={row.id ?? i} className="dt-card">
                {columns.map((col) => (
                  <div key={col.key} className="dt-card-row">
                    <span className="dt-card-label">{col.mobileLabel || col.label}</span>
                    <span className="dt-card-value">
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer: info + pagination */}
        {filtered.length > pageSize && (
          <div className="dt-footer">
            <span className="dt-info">
              Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="dt-pagination">
              <button className="dt-page-btn" onClick={() => setPage(1)} disabled={safePage === 1}>«</button>
              <button className="dt-page-btn" onClick={() => setPage(p => p - 1)} disabled={safePage === 1}>‹</button>
              {pageNumbers().map((p, i) =>
                p === '...'
                  ? <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>
                  : <button key={p} className={`dt-page-btn ${safePage === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              )}
              <button className="dt-page-btn" onClick={() => setPage(p => p + 1)} disabled={safePage === totalPages}>›</button>
              <button className="dt-page-btn" onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>»</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
