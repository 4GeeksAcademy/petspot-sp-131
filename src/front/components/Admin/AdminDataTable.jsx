import React, { useState, useMemo } from "react";
import AdminEmptyState from "./AdminEmptyState";

export default function AdminDataTable({
  columns,
  data,
  searchable = true,
  pageSize = 10,
  emptyMessage = "No records found",
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return typeof val === "string" && val.toLowerCase().includes(q);
      })
    );
  }, [data, query, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleSearch(e) {
    setQuery(e.target.value);
    setPage(1);
  }

  return (
    <div className="admin-table-wrapper">
      {searchable && (
        <div className="admin-table-toolbar">
          <div className="admin-table-search">
            <i className="fa-solid fa-magnifying-glass admin-table-search__icon" aria-hidden="true" />
            <input
              type="search"
              className="admin-table-search__input"
              placeholder="Search..."
              value={query}
              onChange={handleSearch}
            />
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)" }}>
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {pageData.length === 0 ? (
        <AdminEmptyState title={emptyMessage} />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="admin-pagination">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="admin-pagination__controls">
            <button
              className="admin-pagination__btn"
              onClick={() => setPage((p) => p - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - currentPage) <= 2)
              .map((p) => (
                <button
                  key={p}
                  className={`admin-pagination__btn ${p === currentPage ? "admin-pagination__btn--active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            <button
              className="admin-pagination__btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
