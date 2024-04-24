/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

"use client"

import React, {useEffect, useState} from 'react';
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
// @ts-ignore
import Cookies from 'js-cookie';
import axios from 'axios';

import { cn } from "@/lib/utils"
import { Button } from "@/registry/new-york/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york/ui/select"
import { Textarea } from "@/registry/new-york/ui/textarea"
import { toast } from "@/registry/new-york/ui/use-toast"

interface EmailOption {
  value: string; // 确保value是字符串类型
  label: string;
}



const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: "Please enter a valid URL." }),
      })
    )
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const [emailOptions, setEmailOptions] = useState<EmailOption[]>([]);
  const [userId, setUserId] = useState<string | null>(null); // 保存用户ID

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
  })

  const { fields, append } = useFieldArray({
    name: "urls",
    control: form.control,
  })

  useEffect(() => {
    const fetchUserData = async () => {
      const jwt = Cookies.get('jwt');
      if (jwt) {
        try {
          const { data } = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${jwt}` }
          });

          setUserId(data.id.toString()); // 保存用户ID
          setEmailOptions([
            { value: data.email, label: data.email }, // 假设邮件地址存储在email字段
          ]);
          form.reset({
            username: data.username,
            email: data.email,
            bio: data.bio,
            urls: data.urls ? data.urls.split(',').map((url: string) => ({ value: url })) : [],
          });
        } catch (error) {
          console.error('Failed to fetch user data', error);
        }
      }
    };
    fetchUserData();
  }, [form]);



  const onSubmit = async (data: ProfileFormValues) => {
    const jwt = Cookies.get('jwt');
    if (jwt && userId) {
      // 从data.urls数组中提取每个对象的value属性，并将它们连接成一个字符串
      const urlsAsString = data.urls?.map(urlObj => urlObj.value).join(',') || '';
      const submitData = {
        ...data,
        urls: urlsAsString,
      };

      try {
        await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${userId}`, submitData, {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        });
        toast({
          title: "Profile updated successfully",
        });
      } catch (error) {
        console.error('Failed to update profile', error);
        toast({
          title: "Error updating profile",
          description: "An error occurred while updating your profile. Please try again later.",
        });
      }
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a
                pseudonym. You can only change this once every 30 days.
              </FormDescription>
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
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormDescription>
                This email will be used for account notifications and password recovery.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                You can <span>@mention</span> other users and organizations to
                link to them.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && "sr-only")}>
                    URLs
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && "sr-only")}>
                    Add links to your website, blog, or social media profiles.
                  </FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ value: "" })}
          >
            Add URL
          </Button>
        </div>
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  )
}
