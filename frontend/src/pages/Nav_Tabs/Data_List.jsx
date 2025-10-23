import * as React from "react"
import { useEffect, useState } from 'react'
import api from "../../api";

import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelection,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function DataList() {

  const[requests,setRequests] = useState([])
  const[loading,setLoading] = useState(false);

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState([])
  const [rowSelection, setRowSelection] = useState({})

  const columns =[
    {
      id: "select",
      header: ({ table }) => (
      <Checkbox
        checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'requestedBy',
      header: ({column}) => {
        return (
          <Button variant='ghost' onClick={() => column.getIsSorted() === "asc"}>
            Requestor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'dateRequested',
      header: ({column}) => {
        return (
          <Button variant='ghost' onClick={() => column.getIsSorted() === "asc"}>
            Date Requested
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'description',
      header: ({column}) => {
        return (
          <Button variant='ghost' onClick={() => column.getIsSorted() === "asc"}>
            Description
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'netTotal',
      header: ({column}) => {
        return (
          <Button variant='ghost' onClick={() => column.getIsSorted() === "asc"}>
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
  ]

  const table = useReactTable({
    data: requests,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onGlobalFilterChange: setGlobalFilter
  });

  useEffect (() => {
    getRequests()
  },[])

  const getRequests = () => {
    api.get("/api/rfps/")
    .then((res) => res.data)
    .then((data) => {setRequests(data); console.log(data) })
    .catch((err) => alert(err));
  };


  return (
    <div className="p-6 space-y-6">
      <div className='flex flex-col gap-[5px]'>
        <Input
          onChange={e => table.setGlobalFilter(String(e.target.value))}
          placeholder="Search..."
          className="max-w-sm"
        />
        <div className="rounded-md border h-[100%]">
          <Table className="h=[100%]"> 
            <TableHeader className='mx-[5px]'>                       
              {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
              
                {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className='text-center'>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                  <TableCell key={cell.id} className='text-center'>
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
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
              table.setPageSize(Number(value))
              }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <DoubleArrowLeftIcon className="h-4 w-4" />
              </Button>
              <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <DoubleArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ); 
}

export default DataList;