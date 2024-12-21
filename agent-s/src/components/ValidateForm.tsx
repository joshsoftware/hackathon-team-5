'use client';

import { Form, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { linkSchema } from "@/validators/LinkValidator";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { z } from "zod";
import axios from "axios"; 
import { useMutation } from "@tanstack/react-query";


export default function ValidateForm() {
    const form = useForm({
      resolver: zodResolver(linkSchema),
      defaultValues: { url: "" },
      mode: "onChange",
    });
  
    const {mutate} = useMutation({
      mutationFn: (data: { url: string }) => axios.post("/api/analyze", data),
      onSuccess: (data) => {
        console.log("Success:", data.data);
      },
      onError: (error) => {
        console.error("Error:", error.message);
      },
    });
  
    const onSubmit = (data: { url: string }) => {
        mutate(data, {
            onSuccess: () => {
                form.reset(); 
            },
          });
    };
  
    return (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
          <FormField
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your website URL"
                    type="url"
                    {...field}
                    className="flex-1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={!form.formState.isValid } 
          >
            Analyze
          </Button>
        </form>
      </FormProvider>
    );
  }