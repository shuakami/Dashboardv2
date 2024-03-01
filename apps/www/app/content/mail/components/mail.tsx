/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

"use client"
import * as React from "react"
import {
  AlertCircle,
  Archive,
  HeartPulse,
  MessageSquare,
  File,
  Inbox,
  MessagesSquare,
  PenBox,
  Search,
  Settings,
  Activity,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
  Calendar,
  GaugeCircle
} from "lucide-react"

import { AccountSwitcher } from "@/app/content/mail/components/account-switcher"
import { MailDisplay } from "@/app/content/mail/components/mail-display"
import { MailList } from "@/app/content/mail/components/mail-list"
import { Nav } from "@/app/content/mail/components/nav"
import { Mail as MailType } from "@/app/content/mail/data" // 注意避免与Mail组件同名
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
import {useEffect} from "react";
import {use51laAnalytics} from './use51LaAnalytics';
import axios from 'axios';
import { toast } from "@/registry/new-york/ui/use-toast"

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
  const { config, setConfig, mails } = useMail() // 修正了这里
  const [searchQuery, setSearchQuery] = React.useState('');
  use51laAnalytics();
  const { refreshMails } = useMail();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  const filteredMails = mails.filter((mail) =>
    mail.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mail.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const checkAndGenerateReport = async () => {
      try {
        // 请求现有的周报数据
        const response = await axios.get('https://xn--7ovw36h.love/api/weekreports');
        const reports = response.data.data;

        // 寻找最新的报告日期
        const latestReportDate = reports.reduce((latestDate: string | number | Date, report: { attributes: { date: string | number | Date } }) => {
          const reportDate = new Date(report.attributes.date);
          return reportDate > new Date(latestDate) ? reportDate : new Date(latestDate);
        }, new Date(0)); // 初始化为很早以前的日期
        console.log(`Latest report date: ${latestReportDate.toISOString()}`);

        // 检查最新报告日期是否在7天内
        // @ts-ignore
        const daysDifference = (new Date() - latestReportDate) / (1000 * 60 * 60 * 24);
        console.log(`Days since last report: ${daysDifference}`);
        if (daysDifference < 7) {
          console.log("The latest report was generated within the last 7 days.");
          return;
        }

        // 如果超过7天，生成新的周报
        await generateAndSubmitReport();
        console.log('Weekly report generated and submitted successfully.');
        toast({
          title: "周报生成完毕",
          description: "🐱好耶！！请看邮件列表！新的周报！",
        });
        refreshMails();
      } catch (error) {
        console.error('Error during report checking or generation:', error);
      }
    };

    checkAndGenerateReport();
  }, []); // 空依赖数组确保仅在组件挂载时运行


  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`
        }}
        className="h-full max-h-[940px] items-stretch "
      >
        <ResizablePanel
          defaultSize={defaultLayout[14]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={9}
          maxSize={16}
          onCollapse={(collapsed) => {
            setIsCollapsed(collapsed)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              collapsed
            )}`
          }}
          className={cn(isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out")}
        >
          <div className={cn("flex h-[52px] items-center justify-center", isCollapsed ? 'h-[52px]': 'px-2')}>
            <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "消息",
                label: "128",
                icon: Inbox,
                variant: "default",
              },
              {
                title: "运维",
                label: "23",
                icon: MessageSquare,
                variant: "ghost",
              },
              {
                title: "日程",
                label: "",
                icon: Calendar,
                variant: "ghost",
              },
              {
                title: "回收站",
                label: "",
                icon: Trash2,
                variant: "ghost",
              },
              {
                title: "归档",
                label: "",
                icon: Archive,
                variant: "ghost",
              },
              {
                title: "设置",
                label: "",
                icon: Settings,
                variant: "ghost",
              },
            ]}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "更新",
                label: "342",
                icon: AlertCircle,
                variant: "ghost",
              },
              {
                title: "数据",
                label: "8",
                icon: Activity,
                variant: "ghost",
              },
              {
                title: "Github消息",
                label: "128",
                icon: MessagesSquare,
                variant: "ghost",
              },
              {
                title: "控制台",
                label: "",
                icon: GaugeCircle,
                variant: "ghost",
              },
              {
                title: "安全",
                label: "",
                icon: HeartPulse,
                variant: "ghost",
              },
            ]}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">消息</h1>
              <TabsList className="ml-auto">
                <TabsTrigger value="all" className="text-zinc-600 dark:text-zinc-200">所有信息</TabsTrigger>
                <TabsTrigger value="unread" className="text-zinc-600 dark:text-zinc-200">未读信息</TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search"
                    className="pl-8"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <MailList items={filteredMails} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <MailList items={filteredMails.filter((item) => !item.read)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]}>
          <MailDisplay
            mail={mails.find((item) => item.id === config.selected) || null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
