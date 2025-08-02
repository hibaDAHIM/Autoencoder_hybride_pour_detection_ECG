"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as React from "react"

import {
  ColumnDef,
  flexRender,
  SortingState,
  getSortedRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [pageSize, setPageSize] = React.useState(10) // ✅ nombre de lignes par défaut
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter, 
    },
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase()

      const name = String(row.getValue("patient_name") ?? "").toLowerCase()
      const email = String(row.getValue("doctor_name") ?? "").toLowerCase()

      return name.includes(search) || email.includes(search)
    }
  })

  // ✅ Appliquer le pageSize dynamiquement à la table
  React.useEffect(() => {
    table.setPageSize(pageSize)
  }, [pageSize, table])

  return (
    <>
      <div className="flex justify-between items-center mt-10 mb-5 gap-4">
        <Input
          placeholder="Search Record..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <label htmlFor="pageSize" className="text-sm font-medium">Rows per page:</label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            {[5, 10, 20, 30, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </>
  )
}
