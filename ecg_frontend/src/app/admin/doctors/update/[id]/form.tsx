"use client";

import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const newDoctorSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "username is required"),
  email: z.string().min(1, "Email is required"),
  password: z.string().min(8, "Password is required"),

})


export default function UpdateDoctorFormPage() {

  const { id } = useParams();
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | null }>({
    text: "",
    type: null,
  });
  const form = useForm<z.infer<typeof newDoctorSchema>>({
      resolver: zodResolver(newDoctorSchema),
      defaultValues: {
          name: "",
          username: "",
          email: "",
          password: "",
      },
    });
  
  // Get existing doctor data
  useEffect(() => {
  async function fetchData() {
    const res = await fetch(`http://localhost:5000/admin/doctors/${id}`, {
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Failed to fetch doctor");
      return;
    }

    const json = await res.json();
    const data = json.doctor;


    form.reset({
      name: data.name,
      username: data.username,
      password: data.password,
      email: data.email,
    });
  }

  fetchData();
}, [id, form]);


  async function onSubmit(data: z.infer<typeof newDoctorSchema>) {
    
        const response = await fetch(`http://localhost:5000/admin/doctors/update/${id}`, {
        method: "PUT" , 
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
        });

        if (response.ok) {
          setMessage({ text: "Doctor Updated!", type: "success" });
          setTimeout(() => router.push("/admin/doctors"), 1500); // redirect after delay
        } else {
          setMessage({ text: "Update Failed", type: "error" });
        }
    
    
}
  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
      {message.text && (
          <div
            className={cn(
              "text-sm font-medium p-2 rounded-md w-50",
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}
          >
            {message.text}
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter Doctor's Full Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter Doctor's Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter Doctor's Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-20 hover:bg-gray-200 hover:text-black" >Update</Button>
      </form>
    </Form>
  )
}