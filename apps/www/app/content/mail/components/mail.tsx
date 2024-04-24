/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

"use client"
import * as React from "react"
import {
  AlertCircle,
  Archive,
  HeartPulse,
  MessageSquare,
  Inbox,
  MessagesSquare,
  Search,
  Settings,
  Activity,
  Trash2,
  Calendar,
  GaugeCircle
} from "lucide-react"
import SettingsLayout from "@/app/content/forms/layout";
import { AccountSwitcher } from "@/app/content/mail/components/account-switcher"
import { MailDisplay } from "@/app/content/mail/components/mail-display"
import { MailList } from "@/app/content/mail/components/mail-list"
import { Nav } from "@/app/content/mail/components/nav"
import { Mail as MailType } from "@/app/content/mail/data"
import { useMail } from "@/app/content/mail/use-mail"
import { cn } from "@/lib/utils"
import { Separator } from "@/registry/new-york/ui/separator"
import { Input } from "@/registry/new-york/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/new-york/ui/tabs"
import { TooltipProvider } from "@/registry/new-york/ui/tooltip"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/registry/new-york/ui/resizable"
import { generateAndSubmitReport } from './weekReportLogic';
import {useEffect, useState} from "react";
import {use51laAndRecaptcha} from './use51LaAnalytics';
import axios from 'axios';
import { toast } from "@/registry/new-york/ui/use-toast"
import { setupAxiosInterceptors } from '@/app/setupAxiosInterceptors';
import {Navtop} from "@/app/content/mail/components/navtop";
import KamiUI from "@/app/Kami";
import { CSSTransition } from 'react-transition-group';
import "@/styles/transitions.css"
import DashboardPage from "@/app/content/dashboard/page";
setupAxiosInterceptors();

interface MailProps {
  accounts: {
    label: string
    email: string
    icon: React.ReactNode
  }[]
  mails: MailType[]
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
}


export function Mail({
                       accounts,
                       mails: mailsProp, // 更改名称以避免与useMail钩子的mails冲突
                       defaultLayout = [265, 440, 655],
                       defaultCollapsed = false,
                       navCollapsedSize,
                     }: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  // 正确地解构useMail钩子返回的对象
  const { config, setConfig, mails } = useMail();
  const [searchQuery, setSearchQuery] = React.useState('');
  use51laAndRecaptcha();
  const { refreshMails } = useMail();
  const [selectedLink, setSelectedLink] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const savedShowDashboard = localStorage.getItem('showDashboard');
    const savedShowSettings = localStorage.getItem('showSettings');

    // 更新showDashboard状态
    if (savedShowDashboard !== null) {
      setShowDashboard(savedShowDashboard === 'true');
    }

    // 更新showSettings状态
    if (savedShowSettings !== null) {
      setShowSettings(savedShowSettings === 'true');
    }
  }, []);


  // 这里计算未读邮件的数量
  const unreadMailsCount = mails.filter(mail => !mail.read).length;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.trim().toLowerCase());
  };

  const filteredMails = mails.filter((mail) =>
    mail.subject.toLowerCase().includes(searchQuery) ||
    mail.text.toLowerCase().includes(searchQuery) ||
    (mail.name && mail.name.toLowerCase().includes(searchQuery))
  );

  useEffect(() => {
    const savedShowSettings = localStorage.getItem('showSettings');
    if (savedShowSettings !== null) {
      setShowSettings(savedShowSettings === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('showDashboard', showDashboard.toString());
  }, [showDashboard]);

  // 当 showSettings 改变时，更新 localStorage
  useEffect(() => {
    localStorage.setItem('showSettings', showSettings.toString());
  }, [showSettings]);



  useEffect(() => {
    const checkAndGenerateReport = async () => {
      try {
        // 请求现有的周报数据
        const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/weekreports`);
        const reports = response.data.data;

        // 寻找最新的报告日期
        const latestReportDate = reports.reduce((latestDate: string | number | Date, report: { attributes: { date: string | number | Date } }) => {
          const reportDate = new Date(report.attributes.date);
          return reportDate > new Date(latestDate) ? reportDate : new Date(latestDate);
        }, new Date(0)); // 初始化为很早以前的日期
        console.log(`Latest report date: ${latestReportDate.toISOString()}`);

        // 检查最新报告日期是否在6天内
        // @ts-ignore
        const daysDifference = (new Date() - latestReportDate) / (1000 * 60 * 60 * 24);
        console.log(`Days since last report: ${daysDifference}`);
        if (daysDifference < 6) {
          console.log("The latest report was generated within the last 6 days.");
          return;
        }

        // 如果超过6天，生成新的周报
        await generateAndSubmitReport();
        console.log('Weekly report generated and submitted successfully.');
        toast({
          title: "周报生成完毕",
          description: "🐱好耶！！请看邮件列表！新的周报！",
        });
        await refreshMails();
      } catch (error) {
        console.error('Error during report checking or generation:', error);
      }
    };

    checkAndGenerateReport();
  }, []); // 空依赖数组确保仅在组件挂载时运行


  return (
    <>
      <CSSTransition in={true} timeout={300} classNames="fade" appear>
        <div className="fixed left-0 top-0 z-50 w-full shadow-none">
          <Navtop
            unreadMailsCount={unreadMailsCount}
            setSelectedLink={setSelectedLink}
            setShowSettings={setShowSettings}
            setShowDashboard={setShowDashboard}
          />
        </div>
      </CSSTransition>
      <div className="pt-7">
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
          }}
          className="h-full items-stretch "
        >
          <ResizablePanel
            defaultSize={defaultLayout[14]}
            className="hidden"
            collapsedSize={navCollapsedSize}
            collapsible={true}
            minSize={9}
            maxSize={18}
            onCollapse={(collapsed) => {
              setIsCollapsed(collapsed);
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(collapsed)}`;
            }}
          >
            <div className={cn("flex h-[52px] items-center justify-center", isCollapsed ? 'h-[52px]' : 'px-2')}>
              <AccountSwitcher isCollapsed={isCollapsed}/>
            </div>
            <Separator/>
            <Separator/>
          </ResizablePanel>
          <ResizableHandle withHandle className="h-0 w-0 opacity-0"/>
          {showDashboard ? (
            <DashboardPage />
          ) : (
          showSettings ? (
            <SettingsLayout/>
          ) : (
            <>
              <CSSTransition in={true} timeout={300} classNames="fade" appear>
                <KamiUI/>
              </CSSTransition>
              <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                <Tabs defaultValue="all">
                  <div className="flex items-center px-4 py-2">
                    {selectedLink === '归档' && <h1 className="text-xl font-bold">&nbsp;已归档的消息</h1>}
                    {selectedLink !== '归档' && <h1 className="text-xl font-bold">&nbsp;消息</h1>}
                    <TabsList className="ml-auto">
                      <TabsTrigger value="all" className="text-zinc-600 dark:text-zinc-200">所有信息</TabsTrigger>
                      <TabsTrigger value="unread" className="text-zinc-600 dark:text-zinc-200">未读信息</TabsTrigger>
                    </TabsList>
                  </div>
                  <Separator/>
                  <div className=" p-4  ">
                    <form>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <Input
                          placeholder="Search"
                          className="pl-8"
                          value={searchQuery}
                          onChange={handleSearchChange}/>
                      </div>
                    </form>
                  </div>
                  <TabsContent value="all" className="m-0">
                    <MailList items={filteredMails}/>
                  </TabsContent>
                  <TabsContent value="unread" className="m-0">
                    <MailList items={filteredMails.filter((item) => !item.read)}/>
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
              <ResizableHandle withHandle/>
              <CSSTransition in={true} timeout={300} classNames="fade" appear>
                <ResizablePanel defaultSize={defaultLayout[2]}>
                  <MailDisplay
                    mail={mails.find((item) => item.id === config.selected) || null}/>
                </ResizablePanel>
              </CSSTransition>
            </>
          )
          )}
        </ResizablePanelGroup>
      </div>
    </>
  )
}
