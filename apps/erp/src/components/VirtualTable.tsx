'use client';

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Filter } from './HeroIconsHub';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchPlaceholder?: string;
  searchFilterKey?: (item: T) => string;
  emptyText?: string;
}

export function VirtualTable<T extends { id?: string | number }>({
  data,
  columns,
  pageSize = 10,
  searchPlaceholder = 'Siyahıda axtarış...',
  searchFilterKey,
  emptyText = 'Məlumat tapılmadı',
}: VirtualTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((item) => {
      if (searchFilterKey) {
        return searchFilterKey(item).toLowerCase().includes(term);
      }
      return Object.values(item as any).some((val) =>
        String(val ?? '').toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchFilterKey]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const valA = a[sortKey] ?? '';
      const valB = b[sortKey] ?? '';
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/40">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Cəmi: <strong className="text-slate-200">{filteredData.length}</strong> nəticə</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs tracking-wider text-slate-400 border-b border-slate-800 select-none">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable)}
                  style={{ width: col.width }}
                  className={`px-4 py-3.5 font-semibold ${
                    col.sortable ? 'cursor-pointer hover:text-slate-200 transition-colors' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-indigo-400" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr
                  key={item.id ?? index}
                  className="hover:bg-slate-800/40 transition-colors duration-150 group"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-200">
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>
            Səhifə {currentPage} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
            >
              Əvvəlki
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
            >
              Növbəti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
