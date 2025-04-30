import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataPoint } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface DataTableProps {
  data: DataPoint[];
  columns: string[];
  title?: string;
  maxHeight?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  title,
  maxHeight = '500px',
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // Generate columns configuration dynamically
  const tableColumns: ColumnDef<DataPoint>[] = columns.map((col) => ({
    accessorKey: col,
    header: () => <span className="font-medium">{col}</span>,
    cell: (info) => {
      const value = info.getValue();
      
      // Format different types of values
      if (value === null || value === undefined) {
        return <span className="text-gray-400">null</span>;
      } else if (typeof value === 'number') {
        return isNaN(value) 
          ? <span className="text-gray-400">NaN</span>
          : value.toLocaleString(undefined, { maximumFractionDigits: 6 });
      }
      
      return String(value);
    },
  }));

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-2"
    >
      {title && <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">{title}</h3>}
      
      <div className="overflow-x-auto">
        <div className={`overflow-y-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg`} style={{ maxHeight }}>
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`flex items-center ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: <ChevronUp className="ml-1 h-4 w-4" />,
                            desc: <ChevronDown className="ml-1 h-4 w-4" />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </motion.div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
              <AnimatePresence>
                {table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                    className="dark:hover:bg-gray-800/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="whitespace-nowrap px-3 py-2 text-sm text-gray-500 dark:text-gray-400"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between px-2 py-3"
      >
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-400">
          <span>
            Page{' '}
            <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span>{' '}
            of <span className="font-medium">{table.getPageCount()}</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-md bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-md bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DataTable;