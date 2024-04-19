/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

"use client"
import Image from 'next/image';
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"
import axios from 'axios';
// @ts-ignore
import Cookies from 'js-cookie';
import { cn } from "@/lib/utils"
import { Button } from "@/registry/new-york/ui/button"
import { Calendar } from "@/registry/new-york/ui/calendar"
import { formatISO } from 'date-fns';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/registry/new-york/ui/command"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/new-york/ui/form"
import { Input } from "@/registry/new-york/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/ui/popover"
import { toast } from "@/registry/new-york/ui/use-toast"
import {useEffect, useState} from "react";

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
] as const

const accountFormSchema = z.object({
  icon: z.string().url().optional(),
  dob: z.date().optional(),
  language: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export function AccountForm() {
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null); // 用于保存用户ID


  useEffect(() => {
    const fetchUserData = async () => {
      const jwt = Cookies.get('jwt');
      if (jwt) {
        try {
          const { data } = await axios.get('https://xn--7ovw36h.love/api/users/me', {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });
          setUserId(data.id); // 保存用户ID
          setUserData(data);
          form.reset({
            icon: data.icon,
            dob: new Date(data.birthtime),
            language: data.language,
          });
        } catch (error) {
          console.error('Failed to fetch user data', error);
        }
      }
    };
    fetchUserData();
  }, []);


  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      // @ts-ignore
      icon: userData?.icon,
      // @ts-ignore
      dob: userData ? new Date(userData.birthtime) : undefined,
      // @ts-ignore
      language: userData?.language,
    },
  });

  const onSubmit = async (data: AccountFormValues) => {
    const jwt = Cookies.get('jwt');
    if (jwt && userId) {
      try {
        // 检查是否有提供生日日期，如果有则将其转换为ISO日期部分的字符串
        const birthtime = data.dob ? formatISO(data.dob, { representation: 'date' }) : null;

        const submitData = {
          ...data,
          birthtime,
        };

        await axios.put(`https://xn--7ovw36h.love/api/users/${userId}`, submitData, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        toast({ title: "Account updated successfully" });
      } catch (error) {
        console.error('Failed to update account', error);
        toast({ title: "Error updating account" });
      }
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <div>
                  <Input type="url" placeholder="Avatar URL" {...field} />
                       {field.value && (
                         <div className="mt-4" style={{ width: '100px', height: '100px', position: 'relative', borderRadius: '50%', overflow: 'hidden' }}>
                           <Image src={field.value} alt="Avatar" layout="fill" objectFit="cover" />
                         </div>
                       )}
                </div>
              </FormControl>
              <FormDescription>
                Enter the URL of the image you like to use as your avatar.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Your date of birth is used to calculate your age.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Language</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        " justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? languages.find(
                            (language) => language.value === field.value
                          )?.label
                        : "Select language"}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className=" p-0">
                  <Command>
                    <CommandInput placeholder="Search language..." />
                    <CommandEmpty>No language found.</CommandEmpty>
                    <CommandGroup>
                      {languages.map((language) => (
                        <CommandItem
                          value={language.label}
                          key={language.value}
                          onSelect={() => {
                            form.setValue("language", language.value)
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              language.value === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {language.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                This is the language that will be used in the dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update account</Button>
      </form>
    </Form>
  )
}
