"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { format } from "date-fns";
import { toast } from "sonner"
 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.




export type Records = {
    id: string 
    patient_id: string
    file_path: string
    plot_path: string
    has_anomaly: string
    loss_score: number
    upload_date: Date
    patient_name: string
    doctor_name: string
}




function ActionsCell({
  record,
}: {
  record: Records;
}) {

    const [showModal, setShowModal] = useState(false)
    
    const showPlot = () => {
    setShowModal(true)
  }

  return (
    <>
     <Dialog open={showModal} onOpenChange={setShowModal}>
    <DialogContent className="w-[90vw] max-w-6xl">
      <DialogHeader>
          <DialogTitle>ECG Plot</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          
        </DialogDescription>
        <img
          src={`http://localhost:5000/${record.plot_path}`}
          alt="ECG Plot"
          width={800}
          height={400}
          className="rounded-lg shadow w-full h-auto"
        />
    </DialogContent>
  </Dialog>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end"> 
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={showPlot}>Show Plot</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}


export const columns: ColumnDef<Records>[] = [
    
  {
    accessorKey: "id",
    header: () => <div className="text-center">ID</div>,
    cell: ({ row }) => {
      const id = parseFloat(row.getValue("id"))
 
      return <div className="text-right font-medium">{id}</div>
    },
  },
  {
    accessorKey: "patient_id",
    header: ({ column }) => {
      return (
        <div className="text-center font-medium">
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Patient ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const patient_id : string = row.getValue("patient_id")
 
      return <div className="text-center font-medium">{patient_id}</div>
    },
  },
  {
    accessorKey: "patient_name",
    header: ({ column }) => {
      return (
        <div className="text-center font-medium">
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Patient Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const patient_name : string = row.getValue("patient_name")
 
      return <div className="text-center font-medium">{patient_name}</div>
    },
  },
  {
    accessorKey: "doctor_name",
    header: ({ column }) => {
      return (
        <div className="text-center font-medium">
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Doctor Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const doctor : string = row.getValue("doctor_name")
 
      return <div className="text-center font-medium">{doctor}</div>
    },
  },
  {
    accessorKey: "file_path",
    header: () => <div className="text-center">File Path</div>,
    cell: ({ row }) => {
      const file_path  :string = row.getValue("file_path")
 
      return <div className="text-center font-medium">{file_path}</div>
    },
  },
  {
    accessorKey: "plot_path",
    header: () => <div className="text-center">Plot Path</div>,
    cell: ({ row }) => {
      const plot_path :string = row.getValue("plot_path")
 
      return <div className="text-center font-medium">{plot_path}</div>
    },
  },
  {
    accessorKey: "has_anomaly",
    header: () => <div className="text-center">Results</div>,
    cell: ({ row }) => {
      const has_anomaly: string= row.getValue("has_anomaly")
 
      return <div className="text-center font-medium ">
              <Button variant="outline" className={has_anomaly ? "rounded-full bg-red-100 text-red-800" : " rounded-full bg-green-100 text-green-800"} disabled>
                {has_anomaly ? "Anomaly" : "Normal"}
              </Button>
             </div>
    },
  },
  {
    accessorKey: "loss_score",
    header: () => <div className="text-center">Loss Score</div>,
    cell: ({ row }) => {
      const loss_score :string = row.getValue("loss_score")
      const formattedLossScore = parseFloat(loss_score).toFixed(2);
 
      return <div className="text-center font-medium">{formattedLossScore}</div>
    },
  },
  {
    accessorKey: "upload_date",
    header: () => <div className="text-center">Uploaded At</div>,
    cell: ({ row }) => {
      const upload_date = new Date (row.getValue("upload_date"))
 
      return <div className="text-center font-medium">{format(upload_date, "MMM dd, yyyy")}</div>
    },
  },
  
  {
    id: "actions",
    header: () => <div className="">Actions</div>,
    cell: ({ row }) => {
        const record = row.original;
        
      return <ActionsCell record={record}/>;
    },
  },
]