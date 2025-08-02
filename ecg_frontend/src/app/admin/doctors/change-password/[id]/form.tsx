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
import { useState } from "react"; 
import { cn } from "@/lib/utils";

const newPassSchema = z.object({
  password: z.string().min(8, "Password is required"),

})


export default function UpdatePassFormPage() {

  const { id } = useParams();
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | null }>({
    text: "",
    type: null,
  });
  const form = useForm<z.infer<typeof newPassSchema>>({
      resolver: zodResolver(newPassSchema),
      defaultValues: {
          password: "",
      },
    });

  async function onSubmit(data: z.infer<typeof newPassSchema>) {
    
        const response = await fetch(`http://localhost:5000/admin/doctors/change-password/${id}`, {
        method: "PUT" , 
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
        });

        if (response.ok) {
          setMessage({ text: "Password Updated!", type: "success" });
          setTimeout(() => router.push("/admin/doctors"), 1500);
        } else {
          setMessage({ text: "Update Failed!", type: "error" });
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter New Password" {...field} />
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