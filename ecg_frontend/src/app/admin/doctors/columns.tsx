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

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.




export type Doctor = {
  id: string
  name: string
  username:string
  email: string
  created_at: Date
}


function ActionsCell({
  doctor,
}: {
  doctor: Doctor;
}) {
    const router = useRouter();
  const handleDelete = async () => {

    try {
      const res = await fetch(`http://localhost:5000/admin/doctors/${doctor.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete doctor");
      }
      else{
        toast.success(`Doctor "${doctor.name}" deleted successfully`);
        // Refresh the page or re-fetch data after deletion
        router.push("/admin/doctors");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting the doctor");
    }
  };
    const handleUpdate = () => {
    router.push(`/admin/doctors/update/${doctor.id}`);
    };
    const handleChangePass = () => {
    router.push(`/admin/doctors/change-password/${doctor.id}`);
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
        <DropdownMenuItem onClick={handleChangePass}>Change Password</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export const columns: ColumnDef<Doctor>[] = [
    
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
    accessorKey: "email",
    header: () => <div className="text-center">Email</div>,
    cell: ({ row }) => {
      const email :string = row.getValue("email")
 
      return <div className="text-center font-medium">{email}</div>
    },
  },
  {
    accessorKey: "username",
    header: () => <div className="text-center">Username</div>,
    cell: ({ row }) => {
      const username :string = row.getValue("username")
 
      return <div className="text-center font-medium">{username}</div>
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
    id: "actions",
    header: () => <div className="">Actions</div>,
    cell: ({ row }) => {
        const doctor = row.original;
        
      return <ActionsCell doctor={doctor}/>;
    },
  },
]