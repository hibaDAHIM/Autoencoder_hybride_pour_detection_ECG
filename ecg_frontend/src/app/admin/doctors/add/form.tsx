"use client";

import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import { useState } from "react"; 


import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import router, { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const newDoctorSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "username is required"),
  email: z.string().min(1, "Email is required"),
  password: z.string().min(8, "Password is required"),

})


export default function NewDoctorFormPage() {

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


  async function onSubmit(data: z.infer<typeof newDoctorSchema>) {
 

  const payload = {
    name: data.name,  // backend wants 'name'
    username: data.username,
    email: data.email,
    password: data.password,
  };

  try {
    const res = await fetch("http://localhost:5000/admin/doctors/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include", // pour envoyer le cookie de session Flask
    });

    const result = await res.json();
    console.log(result);

    if (!res.ok) {
      setMessage({ text: result.error || "An error occurred", type: "error" });
    } else {
      setMessage({ text: "Doctor created successfully!", type: "success" });
      setTimeout(() => router.push("/admin/doctors"), 1500);
      console.log(result);
      form.reset(); // reset form
    }
  } catch (err) {
    console.error("Submission error", err);
    setMessage({ text: "Failed to submit form", type: "error" });
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
                <Input placeholder="Enter Doctors's Email" {...field} />
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter Doctor's Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-20 hover:bg-gray-200 hover:text-black" >Add</Button>
      </form>
    </Form>
  )
}