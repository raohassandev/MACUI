import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { strings } from "@/constants/strings";

// Table container styling
const tableContainerVariants = cva(
  "w-full overflow-auto",
  {
    variants: {
      border: {
        none: "",
        default: "border rounded-md",
      },
    },
    defaultVariants: {
      border: "default",
    },
  }
);

// Table styling
const tableVariants = cva(
  "w-full caption-bottom text-sm",
  {
    variants: {
      variant: {
        default: "",
        striped: "[&_tbody_tr:nth-child(even)]:bg-muted/50",
        hoverable: "[&_tbody_tr:hover]:bg-muted/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Table head styling
const tableHeadVariants = cva(
  "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
  {
    variants: {
      sortable: {
        true: "cursor-pointer hover:text-foreground",
        false: "",
      },
    },
    defaultVariants: {
      sortable: false,
    },
  }
);

interface ColumnDef<T> {
  id: string;
  header: React.ReactNode;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  className?: string;
  width?: string;
}

export interface TableProps<T> extends 
  React.HTMLAttributes<HTMLTableElement>,
  VariantProps<typeof tableVariants> {
  data: T[];
  columns: ColumnDef<T>[];
  caption?: React.ReactNode;
  sortable?: boolean;
  pagination?: {
    pageSize: number;
    pageIndex: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
  loading?: boolean;
  noDataMessage?: string;
  onRowClick?: (row: T) => void;
  containerClassName?: string;
}

function SortIcon({ 
  direction 
}: { 
  direction: 'asc' | 'desc' | undefined 
}) {
  if (!direction) {
    return <ChevronsUpDown className="ml-2 h-4 w-4" />;
  }
  
  return direction === 'asc' 
    ? <ChevronUp className="ml-2 h-4 w-4" /> 
    : <ChevronDown className="ml-2 h-4 w-4" />;
}

export function Table<T>({
  className,
  variant,
  data,
  columns,
  sortable = false,
  pagination,
  loading = false,
  noDataMessage,
  onRowClick,
  caption,
  containerClassName,
  ...props
}: TableProps<T>) {
  // State for sorting
  const [sortState, setSortState] = React.useState<{
    column: string | null;
    direction: 'asc' | 'desc' | undefined;
  }>({
    column: null,
    direction: undefined,
  });
  
  // Handle column header click for sorting
  const handleColumnClick = (column: ColumnDef<T>) => {
    if (!sortable || !column.sortable) return;
    
    let direction: 'asc' | 'desc' | undefined;
    
    if (sortState.column === column.id) {
      if (sortState.direction === 'asc') {
        direction = 'desc';
      } else if (sortState.direction === 'desc') {
        direction = undefined;
      } else {
        direction = 'asc';
      }
    } else {
      direction = 'asc';
    }
    
    setSortState({
      column: direction ? column.id : null,
      direction,
    });
  };
  
  // Apply sorting to data
  const sortedData = React.useMemo(() => {
    if (!sortState.column || !sortState.direction) return data;
    
    const column = columns.find(col => col.id === sortState.column);
    if (!column || !column.sortFn) return data;
    
    return [...data].sort((a, b) => {
      const result = column.sortFn!(a, b);
      return sortState.direction === 'asc' ? result : -result;
    });
  }, [data, sortState, columns]);
  
  // Get paginated data
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData;
    
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    
    return sortedData.slice(start, end);
  }, [sortedData, pagination]);
  
  // Total pages calculation
  const totalPages = pagination
    ? Math.ceil(
        (pagination.totalCount || sortedData.length) / pagination.pageSize
      )
    : 0;
  
  return (
    <div className={cn(tableContainerVariants(), containerClassName)}>
      <table className={cn(tableVariants({ variant }), className)} {...props}>
        {caption && <caption>{caption}</caption>}
        
        <thead className="[&_tr]:border-b">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                className={cn(
                  tableHeadVariants({ sortable: sortable && column.sortable }),
                  column.className,
                  column.width && `w-${column.width}`,
                )}
                onClick={() => handleColumnClick(column)}
              >
                <div className="flex items-center">
                  {column.header}
                  {sortable && column.sortable && (
                    <SortIcon 
                      direction={
                        sortState.column === column.id
                          ? sortState.direction
                          : undefined
                      } 
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className={cn("[&_tr:last-child]:border-0", loading && "opacity-70")}>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  "border-b transition-colors",
                  onRowClick && "cursor-pointer hover:bg-muted/50"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "p-4 align-middle",
                      column.className
                    )}
                  >
                    {column.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="p-4 text-center text-muted-foreground"
              >
                {noDataMessage || strings.components.table.noData}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {pagination && (
        <div className="flex items-center justify-between py-4 px-2">
          <div className="text-sm text-muted-foreground">
            {strings.components.table.page} {pagination.pageIndex + 1} {strings.components.table.of} {totalPages}
          </div>
          
          <div className="flex items-center space-x-6 lg:space-x-8">
            {pagination.onPageSizeChange && (
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">{strings.components.table.rowsPerPage}</p>
                <select
                  className="h-8 w-[70px] rounded-md border border-input bg-background"
                  value={pagination.pageSize}
                  onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                >
                  {[5, 10, 20, 30, 40, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input p-0 hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
                disabled={pagination.pageIndex === 0}
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </button>
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input p-0 hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
                disabled={pagination.pageIndex + 1 >= totalPages}
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}