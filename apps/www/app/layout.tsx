/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

"use client"
import React, { useEffect } from "react";
// @ts-ignore
import Cookies from 'js-cookie';
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { fontSans } from "@/lib/fonts";
import { ThemeProvider } from "@/components/providers";
import { SettingsProvider } from './SettingsContext';
import axios from 'axios';
import {TailwindIndicator} from "@/components/tailwind-indicator";
import {ThemeSwitcher} from "@/components/theme-switcher";
import {Toaster as NewYorkToaster} from "@/registry/new-york/ui/toaster";
import {Toaster as DefaultToaster} from "@/registry/default/ui/toaster";
import {Toaster as NewYorkSonner} from "@/registry/new-york/ui/sonner";

interface RootLayoutProps {
  children: React.ReactNode;
}

const storeError = (error: { message: string, stack?: string, type: string }) => {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key = `errorLogs-${date}`;
  const existingLogs = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : [];
  existingLogs.push({
    ...error,
    timestamp: new Date().toISOString(),
  });
  console.log("Storing error: ", error); // 控制台日志，查看存储的错误
  localStorage.setItem(key, JSON.stringify(existingLogs));
  console.log("Errors stored in localStorage: ", localStorage.getItem(key)); // 控制台日志，查看localStorage内容
}

const handleError = (event: ErrorEvent) => {
  console.log("Handling runtime error: ", event); // 控制台日志，查看捕获的错误事件
  storeError({
    message: event.message,
    stack: event.error?.stack,
    type: 'runtime'
  });
}

const handlePromiseRejection = (event: PromiseRejectionEvent) => {
  console.log("Handling promise rejection: ", event); // 控制台日志，查看Promise拒绝事件
  storeError({
    message: event.reason.toString(),
    stack: event.reason instanceof Error ? event.reason.stack : undefined,
    type: 'promise'
  });
}

export default function RootLayout({ children }: RootLayoutProps) {
  useEffect(() => {
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);

  // 添加 Axios 拦截器
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(response => response, error => {
      console.log("Handling Axios error: ", error); // 控制台日志，查看Axios错误
      storeError({
        message: error.message,
        stack: error.stack,
        type: 'axios'
      });
      return Promise.reject(error);
    });

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <>
      <html lang="zh" suppressHydrationWarning>
      <head title="ByteFreeze_Dashboard"/>
      <body className={cn("font-sans", fontSans)}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SettingsProvider>
          <main className="w-full flex-1 items-center justify-center">
            {children}
          </main>
        </SettingsProvider>
        <TailwindIndicator />
        <ThemeSwitcher />
        <NewYorkToaster />
        <DefaultToaster />
        <NewYorkSonner />
      </ThemeProvider>
      </body>
      </html>
    </>
  );
}
