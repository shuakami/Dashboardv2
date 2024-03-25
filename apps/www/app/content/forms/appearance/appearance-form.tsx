/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

"use client"
import ReactPlayer from 'react-player';
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import { z } from "zod"
import axios from 'axios';
// @ts-ignore
import Cookies from 'js-cookie';
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/registry/new-york/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/new-york/ui/form"
import { RadioGroup, RadioGroupItem } from "@/registry/new-york/ui/radio-group"
import { toast } from "@/registry/new-york/ui/use-toast"
import {useEffect, useState} from "react";
import {Input} from "@/registry/new-york/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/registry/new-york/ui/select";
import {ToastAction} from "@/registry/new-york/ui/toast";

const settingsFormSchema = z.object({
  theme: z.enum(["light", "dark","default"]),
  font: z.enum(["default", "miSans", "oppoSans"]),
  backgroundtransparency: z.string(),
  background: z.union([
    z.literal("default"),
    z.string().url(),
    z.string().regex(/^https?:\/\/.*\|https?:\/\/.*$/),
  ]).optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function SettingsForm() {
  const [userId, setUserId] = useState<string | null>(null);
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    mode: "onChange",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const jwt = Cookies.get('jwt');
      if (jwt) {
        try {
          const { data } = await axios.get('https://xn--7ovw36h.love/api/users/me', {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          setUserId(data.id.toString());
          form.reset({
            theme: data.theme,
            font: data.font,
            backgroundtransparency: data.backgroundtransparency,
            background: data.background || '',
          });
          Cookies.set('cookie-usersettings', JSON.stringify({
            theme: data.theme,
            font: data.font,
            backgroundtransparency: data.backgroundtransparency,
            background: data.background,
          }));
        } catch (error) {
          console.error('Failed to fetch user data', error);
        }
      }
    };
    fetchUserData();
  }, [form]);

  const onSubmit = async (data: SettingsFormValues) => {
    const jwt = Cookies.get('jwt');
    if (jwt && userId) {
      try {
        await axios.put(`https://xn--7ovw36h.love/api/users/${userId}`, data, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        toast({ title: "Settings updated successfully" ,
          description: "You need to refresh to see the effect.",
          action: <ToastAction altText="RefreshPage" onClick={() => window.location.reload()}>RefreshPage</ToastAction>
        });
        Cookies.set('cookie-usersettings', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to update settings', error);
        toast({ title: "Error updating settings", description: "An error occurred while updating your settings. Please try again later." });
      }
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Theme</FormLabel>
              <FormDescription>
                Select the theme for the dashboard.
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid max-w-3xl grid-cols-3 gap-8 pt-2"
              >
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="light" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                      <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Light
                    </span>
                  </FormLabel>
                </FormItem>

                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="default" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                      <div className="space-y-2 rounded-sm bg-blue-950 p-2">
                        <div className="space-y-2 rounded-md bg-red-300 p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-yellow-500 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-blue-400 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Default
                    </span>
                  </FormLabel>
                </FormItem>


                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="dark" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                      <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                        <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Dark
                    </span>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="background"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Video URL</FormLabel>
              <Input {...field} />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '10px',
                borderRadius: '8px',
                width: '800px',
              }}>
                {/* 默认或单个链接的情况 */}
                {(field.value === 'default' || !field.value || !field.value.includes('|')) ? (
                  <>
                    <div style={{
                      flex: '1 0 0%',
                      marginRight: '10px',
                      overflow: 'hidden',
                      height: '225px',
                      borderRadius: '8px',
                    }}>
                      <ReactPlayer
                        url={field.value === 'default' ? "/vid/background.mp4" : field.value}
                        playing
                        loop
                        muted
                        width="100%"
                        height="100%"
                      />
                    </div>
                    <div style={{
                      flex: '1 0 0%',
                      marginLeft: '10px',
                      overflow: 'hidden',
                      height: '225px',
                      borderRadius: '8px',
                    }}>
                      <ReactPlayer
                        url={field.value === 'default' ? "/vid/backgroundwhite.mp4" : field.value}
                        playing
                        loop
                        muted
                        width="100%"
                        height="100%"
                      />
                    </div>
                  </>
                ) : (
                  // 链接|链接的情况
                  field.value.split('|').map((url, index) => (
                    <div key={index} style={{
                      flex: '1 0 0%',
                      marginRight: index === 0 ? '10px' : '0',
                      marginLeft: index === 1 ? '10px' : '0',
                      overflow: 'hidden',
                      height: '225px',
                      borderRadius: '8px',
                    }}>
                      <ReactPlayer
                        url={url.trim()}
                        playing
                        loop
                        muted
                        width="100%"
                        height="100%"
                      />
                    </div>
                  ))
                )}
              </div>
              <FormDescription>
                Enter default or the URL of the video you like to use as your background.
                <p>Refer to the format where URLs for videos under a dark theme
                  and a white theme are specified as follows:</p>
                <code>[Dark theme video link]|[White theme video link]
                </code>
              </FormDescription>
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="backgroundtransparency"
          render={({field}) => (
            <FormItem>
              <FormLabel>Background Transparency (%)</FormLabel>
              <Input {...field} />
              <FormDescription>
                Set the background transparency from 0% (fully transparent) to 100% (fully opaque).
              </FormDescription>
            </FormItem>
          )}
        />



        <FormField
          control={form.control}
          name="font"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Font</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger aria-label="Font">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="miSans">MI Sans</SelectItem>
                  <SelectItem value="oppoSans">OPPO Sans</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Set the font you want to use in the dashboard.
              </FormDescription>
            </FormItem>
          )}
        />

        <Button type="submit">Update preferences</Button>
      </form>
    </Form>
  )
}
