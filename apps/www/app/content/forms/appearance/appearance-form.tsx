/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

"use client"
import ReactPlayer from 'react-player';
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import {useForm, useWatch} from "react-hook-form"
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
import {useEffect, useRef, useState} from "react";
import {Input} from "@/registry/new-york/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/registry/new-york/ui/select";
import {ToastAction} from "@/registry/new-york/ui/toast";
import {Card, CardTitle} from "@/registry/new-york/ui/card";
import { CheckIcon } from 'lucide-react';
import {useSettings} from "@/app/SettingsContext";

const settingsFormSchema = z.object({
  theme: z.enum(["light", "dark","default"]),
  themecolor:z.union([
    z.string(),
    z.literal("default"),
  ]),
  font: z.enum(["default", "miSans", "oppoSans"]),
  backgroundtransparency: z.union([
    z.literal("default"),
    z.string().regex(/^((\d{1,3}|100)%|default)(\|((\d{1,3}|100)%|default))?$/),
  ]),
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
  const [ballPosition, setBallPosition] = useState({x: 0, y: 0});
  const cardRef = useRef<HTMLDivElement>(null);
  const cardWidth = useRef<number>(0);
  const cardHeight = useRef<number>(0);


// 在Card组件挂载完成后获取其尺寸
  useEffect(() => {
    if (cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      cardWidth.current = cardRect.width;
      cardHeight.current = cardRect.height;
    }
  }, []);

// 确保圆球位置在卡片范围内
  const limitBallPosition = (position: { x: number; y: number }) => {
    return {
      x: Math.max(Math.min(position.x, cardWidth.current - 50), 50), // 减去圆球宽度以限制左右边界
      y: Math.max(Math.min(position.y, cardHeight.current / 2), -cardHeight.current / 2),
    };
  };

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    // 根据事件坐标和卡片中心计算圆球的新位置，并限制在卡片范围内
    // @ts-ignore
    const newX = event.clientX - cardRef.current?.getBoundingClientRect().left - 50;
    // @ts-ignore
    const newY = event.clientY - cardRef.current?.getBoundingClientRect().top - 50;
    setBallPosition(limitBallPosition({ x: newX, y: newY }));
  }




  const themes = [
    {
      name: "default",
      label: "default",
      activeColor: {
        light: "240 5.9% 10%",
        dark: "240 5.2% 33.9%",
      }
    },
    {
      name: "slate",
      label: "Slate",
      activeColor: {
        light: "215.4 16.3% 46.9%",
        dark: "215.3 19.3% 34.5%",
      }
    },
    {
      name: "stone",
      label: "Stone",
      activeColor: {
        light: "25 5.3% 44.7%",
        dark: "33.3 5.5% 32.4%",
      }
    },
    {
      name: "red",
      label: "Red",
      activeColor: {
        light: "0 72.2% 50.6%",
        dark: "0 72.2% 50.6%",
      }
    },
    {
      name: "rose",
      label: "Rose",
      activeColor: {
        light: "346.8 77.2% 49.8%",
        dark: "346.8 77.2% 49.8%",
      }
    },
    {
      name: "orange",
      label: "Orange",
      activeColor: {
        light: "24.6 95% 53.1%",
        dark: "20.5 90.2% 48.2%",
      }
    },
    {
      name: "green",
      label: "Green",
      activeColor: {
        light: "142.1 76.2% 36.3%",
        dark: "142.1 70.6% 45.3%",
      }
    },
    {
      name: "blue",
      label: "Blue",
      activeColor: {
        light: "221.2 83.2% 53.3%",
        dark: "217.2 91.2% 59.8%",
      }
    },
    {
      name: "yellow",
      label: "Yellow",
      activeColor: {
        light: "47.9 95.8% 53.1%",
        dark: "47.9 95.8% 53.1%",
      }
    },
    {
      name: "violet",
      label: "Violet",
      activeColor: {
        light: "262.1 83.3% 57.8%",
        dark: "263.4 70% 50.4%",
      }
    }
  ];

  const [config, setConfig] = useState({ theme: 'default' });
  const [mounted, setMounted] = useState(false);
  // @ts-ignore
  const mode: 'light' | 'dark' = // 获取模式的逻辑


  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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
            themecolor: data.themecolor,
            theme: data.theme,
            font: data.font,
            backgroundtransparency: data.backgroundtransparency,
            background: data.background || '',
          });
          Cookies.set('cookie-usersettings', JSON.stringify({
            themecolor: data.themecolor,
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

  const backgroundTransparency = useWatch({
    control: form.control,
    name: 'backgroundtransparency',
  });



  // 解析backgroundTransparency以提取透明度和模犊度
  const [transparency, blur] = backgroundTransparency?.includes('|')
    ? backgroundTransparency.split('|').map((value) => value.replace('%', ''))
    : ['75', '70']; // 如果是 'default' 或没有值，使用默认的透明度75和模糊度70

  const blurPx = `${parseInt(blur, 10)}px`; // 按照1% = 1px来计算


  const backgroundStyle = {
    background: `linear-gradient(140deg, rgba(249, 191, 59, ${parseInt(transparency, 10) / 100}), rgba(230, 126, 34, ${parseInt(transparency, 10) / 100}))`
  };
  const { triggerUpdate } = useSettings();
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
        triggerUpdate();
      } catch (error) {
        console.error('Failed to update settings', error);
        toast({ title: "Error updating settings", description: "An error occurred while updating your settings. Please try again later." });
      }
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}  className="scrollbar-width-none scrollbar-color-transparent -webkit-scrollbar h-screen max-w-full space-y-8 overflow-y-auto">

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
          name="themecolor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ThemeColor</FormLabel>
              <FormDescription>
                Select the themecolor for the dashboard.
              </FormDescription>
              <div className="mb-2 flex flex-wrap gap-3">
                {themes.map((theme) => {
                  const isActive = field.value === theme.name;
                  return (
                    <Button
                      type="button"
                      variant={"outline"}
                      size="sm"
                      key={theme.name}
                      onClick={() => {
                        field.onChange(theme.name); // 更新表单字段值
                      }}
                      className={cn(
                        "justify-start",
                        isActive && ""
                      )}
                      style={{
                        ['--theme-primary' as any]: `hsl(${theme.activeColor[mode === "dark" ? "dark" : "light"]})`,
                      }}
                    >
              <span
                className={cn(
                  "mr-1 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full",
                  "bg-[var(--theme-primary)]"
                )}
              >
                {isActive && <CheckIcon className="h-4 w-4 text-white"/>}
              </span>
                      {theme.label}
                    </Button>
                  );
                })}
              </div>
                <FormDescription>
                  <p>这个选项完全取决于<strong>内部的颜色支持</strong>，所以在实际中有可能不起作用。</p>
                  <br/>
                </FormDescription>

            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="backgroundtransparency"
          render={({field}) => (
            <FormItem>
              <FormLabel>Background Settings</FormLabel>
              <Input {...field} />
              <FormDescription>
                Set the background transparency and blur levels. <code>Format: [Transparency%]|[Blur%] or
                default.</code>
                <br/>
                mask layer transparency from 0% (semi-transparent) to a maximum of 100% (fully transparent),
                due to conversion limitations.
                <br/>
                The lower the percentage: The more transparent the mask layer becomes, revealing the underlying video
                content with greater clarity.
                <br/>
                Blur level, on the other hand, is defined in a different scale where it can go up to a maximum of 300%.
                <br/>

              </FormDescription>
              <Card ref={cardRef} onMouseMove={handleMouseMove}
                    className="relative min-h-36 w-full max-w-full bg-transparent backdrop-blur-md"
              >
                <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg" style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  zIndex: 999,
                  transform: `translate(${ballPosition.x}px, ${ballPosition.y}px)`,
                  filter: `blur(${blurPx})`,
                  opacity: '0.75',
                  background: `linear-gradient(to top left, rgba(255,255,255,${parseInt(transparency, 10) / 100}) 50%, transparent 50%),
                 linear-gradient(140deg, rgba(249, 191, 59, ${parseInt(transparency, 10) / 100}), rgba(230, 126, 34, ${parseInt(transparency, 10) / 100}))`
                }}/>
                <div className="absolute inset-0  flex items-center justify-center">
                  <div className="z-50 flex items-center justify-center">
                    <p className="text-container text-center text-2xl leading-none text-muted-foreground">
                      你可以在调整数值后，
                    </p>
                    <p className="text-container  text-center text-2xl font-medium leading-none">
                      尝试移动圆球。
                    </p>
                  </div>
                </div>
              </Card>
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="font"
          render={({field}) => (
            <FormItem>
            <FormLabel>Font</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger aria-label="Font">
                  <SelectValue/>
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
