"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { format } from "date-fns";
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
 
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

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.




export type Patient = {
  id: string
  name: string
  age: number
  gender:string
  date_naissance: Date
  email: string
  phone: string
  created_at: Date
}


function ActionsCell({
  patient,
}: {
  patient: Patient;
}) {
    const router = useRouter();
  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete patient "${patient.name}"?`);
    if (!confirmed)  return
    

    try {
      const res = await fetch(`http://localhost:5000/patients/${patient.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete patient");
      }

      toast.success(`Patient "${patient.name}" deleted successfully`);
       // Refresh the page or re-fetch data after deletion
        router.push("/patients");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting the patient");
    }
  };
    const handleUpdate = () => {
    router.push(`/patients/update/${patient.id}`);
    };
    const handleAnalyzeSignal = () => {
        router.push(`/patients/analyze/${patient.id}`);
    };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
        <DropdownMenuItem onClick={handleUpdate}>Update</DropdownMenuItem>
        <DropdownMenuItem onClick={handleAnalyzeSignal}>Analyze Signal</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export const columns: ColumnDef<Patient>[] = [
    
  {
    accessorKey: "id",
    header: () => <div className="text-center">ID</div>,
    cell: ({ row }) => {
      const id = parseFloat(row.getValue("id"))
 
      return <div className="text-right font-medium">{id}</div>
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="text-center font-medium">
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Full Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const name : string = row.getValue("name")
 
      return <div className="text-center font-medium">{name}</div>
    },
  },
  {
    accessorKey: "age",
    header: () => <div className="text-center">Age</div>,
    cell: ({ row }) => {
      const age = parseFloat(row.getValue("age"))
 
      return <div className="text-center font-medium">{age}</div>
    },
  },
  {
    accessorKey: "gender",
    header: () => <div className="text-center">Gender</div>,
    cell: ({ row }) => {
      const gender :string = row.getValue("gender")
 
      return <div className="text-center font-medium">{gender}</div>
    },
  },
  {
    accessorKey: "date_naissance",
    header: () => <div className="text-center">Birth Date</div>,
    cell: ({ row }) => {
      const birth_date = new Date(row.getValue("date_naissance"))
 
      return <div className="text-center font-medium">{format(birth_date, "MMM dd, yyyy")}</div>
    },
  },
  {
    accessorKey: "email",
    header: () => <div className="text-center">Email</div>,
    cell: ({ row }) => {
      const email :string = row.getValue("email")
 
      return <div className="text-center font-medium">{email}</div>
    },
  },
  {
    accessorKey: "phone",
    header: () => <div className="text-center">Phone</div>,
    cell: ({ row }) => {
      const phone: string = row.getValue("phone")
 
      return <div className="text-center font-medium">{phone}</div>
    },
  },
  {
    accessorKey: "created_at",
    header: () => <div className="text-center">Created At</div>,
    cell: ({ row }) => {
      const created_at = new Date(row.getValue("created_at"))
 
      return <div className="text-center font-medium">{format(created_at, "MMM dd, yyyy")}</div>
    },
  },
  {
    accessorKey: "address",
    header: () => <div className="text-center">Address</div>,
    cell: ({ row }) => {
      const address: string = row.getValue("address")
 
      return <div className="text-center font-medium">{address}</div>
    },
  },
  {
    id: "actions",
    header: () => <div className="">Actions</div>,
    cell: ({ row }) => {
        const patient = row.original;
        
      return <ActionsCell patient={patient}/>;
    },
  },
]