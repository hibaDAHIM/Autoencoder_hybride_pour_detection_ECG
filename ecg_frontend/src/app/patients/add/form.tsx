"use client";

import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import { add, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import router, { useRouter } from "next/navigation";
import { useState } from "react";

const newPatientSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  age: z.number()
                
                .refine((val) => !isNaN(val), {
                              message: "Age is required", })
                .refine((val) => val > 0, {
                             message: "Age must be not null",}),
  gender: z.string().min(4, "gender is required"),
  date_naissance: z.date(),
  email: z.string().min(1, "Email is required"),
  phone: z.string(),
  address: z.string().min(1, "Address is required"),

})


export default function NewPatientFormPage() {

    const router = useRouter();
     const [message, setMessage] = useState<{ text: string; type: "success" | "error" | null }>({
    text: "",
    type: null,
  });
  const form = useForm<z.infer<typeof newPatientSchema>>({
    resolver: zodResolver(newPatientSchema),
    defaultValues: {
        name: "",
        age: undefined,
        gender: "",
        date_naissance: new Date(),
        email: "",
        phone: "",
        address: "",
    },
  });

  function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

  async function onSubmit(data: z.infer<typeof newPatientSchema>) {
  const calculatedAge = calculateAge(data.date_naissance);

  if (data.age !== calculatedAge) {
    alert("Entered age does not match birth date.");
    return;
  }

  const payload = {
    name: data.name,  // backend wants 'name'
    age: data.age,
    gender: data.gender,
    date_naissance: data.date_naissance.toISOString().split('T')[0], // format YYYY-MM-DD
    email: data.email,
    phone: data.phone,
    address: data.address, // facultatif ou null
  };

  try {
    const res = await fetch("http://localhost:5000/patients/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // tu peux aussi ajouter "Authorization" ici si besoin
      },
      body: JSON.stringify(payload),
      credentials: "include", // pour envoyer le cookie de session Flask
    });

    const result = await res.json();
    console.log(result);

    if (!res.ok) {
      setMessage({ text: result.error || "An error occurred", type: "error" });
    } else {
      setMessage({ text: "Patient created successfully!", type: "success" });
      setTimeout(() => router.push("/patients"), 1500); // redirect after delay
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
                <Input placeholder="Enter Patient's Full Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
            <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                    <Input placeholder="Enter Patient's Age" type="number"
                                                            value={field.value ?? ""}
                                                            onChange={(e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value === "" ? "" : Number(value));
                                                        }} /> 
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Patient's Gender" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="date_naissance"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Date of birth</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(field.value, "PPP")
                        ) : (
                            <span>Pick Patient&apos;s Birth Date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                        }
                        captionLayout="dropdown"
                    />
                    </PopoverContent>
                </Popover>
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
                <Input placeholder="Enter Patient's Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Enter Patient's Phone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter Patient's Address" {...field} />
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