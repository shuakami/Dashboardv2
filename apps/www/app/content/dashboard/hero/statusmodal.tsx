/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import Image from "next/image"
import Link from "next/link"
// @ts-ignore
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"
// @ts-ignore
import {
  MoreVertical,
  RefreshCcw,
  Search
} from "lucide-react"

import { Badge } from "@/registry/new-york/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/new-york/ui/breadcrumb"
import { Button } from "@/registry/new-york/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu"
import { Input } from "@/registry/new-york/ui/input"
import { Progress } from "@/registry/new-york/ui/progress"
import { Separator } from "@/registry/new-york/ui/separator"
import {ActivityLogIcon} from "@radix-ui/react-icons";
import { LogEntry } from "./ai";
import React, {useEffect, useState} from "react";
import axios from "axios";
import Loading from "@/app/content/mail/loading";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger
} from "@/registry/new-york/ui/alert-dialog";
import {toast} from "@/registry/new-york/ui/use-toast";
import { ToastAction } from "@/registry/new-york/ui/toast"


interface StatusModalProps {
  entryData: LogEntry;
  onBackClick: () => void;
}

interface UptimeData {
  id: number;
  name: string;
  url: string;
  averageUptime: number;
  dailyUptime: Array<{ date: string; uptime: number }>;
  dailyDown: Array<{ date: string; times: number; duration: number }>;
  status: string;
}





export function StatusModal({ entryData, onBackClick }: StatusModalProps) {
  console.log('StatusModal entryData:', entryData); // 初始检查
  const [siteData, setSiteData] = useState<UptimeData | null>(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const gptResponseContent = JSON.parse(entryData?.attributes?.gptResponse ?? '{}').choices?.[0]?.message?.content ?? null;
  const averageUptime = entryData?.attributes?.averageUptime ?? '未知';
  const [chartData, setChartData] = useState([]);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // 组件加载后设置fadeIn为true来触发动画
    setFadeIn(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('/api/uptime', { days: 7 });
        if (response.data.success) {
          const siteData = response.data.data.find((site: { name: string }) => site.name === entryData.attributes.siteName);
          if (siteData && siteData.dailyUptime) {
            const formattedData = siteData.dailyUptime.map((day: { date: any; uptime: any }) => ({
              date: day.date,
              uptime: day.uptime,
            }));
            setChartData(formattedData);

            // 计算过去七天的平均可用率
            const averageUptimeLast7Days = siteData.dailyUptime.reduce((acc: any, curr: { uptime: any }) => acc + curr.uptime, 0) / siteData.dailyUptime.length;
            setSiteData({ ...siteData, averageUptime: averageUptimeLast7Days });
          }
        }
      } catch (error) {
        console.error('Error fetching uptime data:', error);
      }
    };

    fetchData();
  }, [entryData.attributes.siteName]);


  const fetchSiteData = async () => {
    try {
      const response = await axios.post('/api/uptime', { days: 1 });
      if (response.data.success) {
        const site = response.data.data.find((site: { name: string }) => site.name === entryData.attributes.siteName);
        setSiteData(prevState => {
          // 如果 prevState 为 null，就跳过更新
          if (!prevState) {
            return prevState;
          }

          // 如果 prevState 存在，则执行更新逻辑
          // 但保持7天的平均可用率不变
          return { ...site, averageUptime: prevState.averageUptime };
        });

      }
    } catch (error) {
      console.error('Failed to fetch site data:', error);
    }
  };


  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleDeleteClick = () => {
    setShowDeleteModal(true); // 显示警告对话框
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false); // 隐藏警告对话框
    toast({
      variant: "destructive",
      title: "出错了",
      description: "请求已被拒绝",
    })
  };


  useEffect(() => {
    fetchSiteData();
    const interval = setInterval(fetchSiteData, 60000); // 每分钟更新一次
    return () => clearInterval(interval); // 清除定时器
  }, []);

  if (!siteData) {
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh', // 使用视口高度可以让容器填满整个屏幕
      position: 'relative' // 相对定位
    }}>
      <Loading/>
    </div>;
  }

  // 计算所需数据
  const latestUptime = siteData.dailyUptime[siteData.dailyUptime.length - 1].uptime;
  const latestDowntime = siteData.dailyDown[siteData.dailyDown.length - 1];
  const currentStatus = siteData.status;
  const latestAvailable = siteData.dailyUptime.reduce((acc, current) => current.uptime === 100 ? current : acc, siteData.dailyUptime[0]);
  const siteUrl = siteData.url;
  const hostname = new URL(siteUrl).hostname;

  return (
    <div className={fadeIn ? 'fade-in' : ''} >
    <div className="flex min-h-screen w-full flex-col">

      <div className="flex flex-col sm:gap-4 sm:py-4 ">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#" onClick={(e) => { e.preventDefault(); onBackClick(); }}>Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{entryData.attributes.siteName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Image
                  src="https://xn--7ovw36h.love/uploads/thumbnail_yuanshen_dr_xiao_6e8967ef4d.jpg"
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
        </header>


        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Card className="sm:col-span-2">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-3xl font-semibold tracking-tight"> {currentStatus === 'up' ? '🐳正常运行中' : '😣宕机了。'}</CardTitle>
                    <Button variant="outline" className="px-3 py-1 text-xs">查看详情</Button>
                  </div>
                  <CardDescription className="ml-1 mt-4 text-sm font-semibold tracking-tight">
                    {gptResponseContent}
                  </CardDescription>
                  {!gptResponseContent && (
                    <div className="ml-1 mt-5 grid grid-cols-2 gap-x-5 gap-y-4">
                      <div>
                        <CardDescription className="text-sm">操作系统</CardDescription>
                        <div className="text-md font-medium">Ubuntu 20.04 LTS</div>
                      </div>
                      <div>
                        <CardDescription className="text-sm">CPU</CardDescription>
                        <div className="text-md font-medium">8核 Intel Xeon</div>
                      </div>
                      <div>
                        <CardDescription className="text-sm">内存</CardDescription>
                        <div className="text-md font-medium">32GB DDR4</div>
                      </div>
                      <div>
                        <CardDescription className="text-sm">存储</CardDescription>
                        <div className="text-md font-medium">1TB SSD RAID 10</div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card x-chunk="dashboard-05-chunk-1">
                <CardHeader className="pb-2">
                  <CardDescription>平均正常率</CardDescription>
                  <CardTitle className="text-4xl">
                    {entryData.attributes.averageUptime ? `${entryData.attributes.averageUptime}%` : `${siteData?.averageUptime.toFixed(2)}%`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {siteData && siteData.averageUptime <= 20 ? "🧐什么逆天玩意啊" :
                      siteData && siteData.averageUptime <= 50 ? "😥真的有点差" :
                        siteData && siteData.averageUptime <= 70 ? "🤔继续努力" :
                          "🎉非常不错"}
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress
                    value={entryData.attributes.averageUptime ? parseFloat(String(entryData.attributes.averageUptime)) : siteData?.averageUptime}
                    aria-label={`${entryData.attributes.averageUptime ? entryData.attributes.averageUptime : siteData?.averageUptime.toFixed(2)}% uptime`}
                  />
                </CardFooter>
              </Card>

              <Card x-chunk="dashboard-05-chunk-2">
                <CardHeader className="pb-2">
                  <CardDescription>最近24小时可用百分比</CardDescription>
                  <CardTitle className="text-4xl">{siteData.averageUptime.toFixed(1)}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {siteData.averageUptime <= 20 ? "💦这也太低了吧..." :
                      siteData.averageUptime <= 50 ? "💤需要加强了" :
                        siteData.averageUptime <= 70 ? "💤有进步的空间" :
                          "🐳非常棒！"}
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress
                    value={parseFloat(String(siteData.averageUptime))}
                    aria-label={`${siteData.averageUptime}% uptime`}
                  />
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>近7天可用率</CardTitle>
                <CardDescription>
                  展示了最近一周的系统可用性表现。
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="h-[262px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}    margin={{ top: 10, right: 10, left: 10, bottom: 10 }} >
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-1 shadow-sm">
                              <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="text-[0.85rem] uppercase ">
            Uptime
          </span>
                                <span className="p-1 text-sm font-bold ">
            &nbsp;{payload[0].value}%
          </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }} />

                      <Line type="monotone" dataKey="uptime" stroke="#3E89FF" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>


          <div>
            <Card className="overflow-hidden" x-chunk="dashboard-server-detail-chunk">
              <CardHeader className="flex flex-row items-start bg-muted/50 p-4">
                <div className="grid gap-0.5">
                  <CardTitle className="text-lg font-semibold">
                    服务器详情 - {entryData.id ? `00${entryData.id}` : siteData ? siteData.id : '加载中...'}
                  </CardTitle>
                  <CardDescription>{entryData.attributes.siteName}</CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <RefreshCcw className="h-3.5 w-3.5" />
                    <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
          刷新状态
        </span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline" className="h-8 w-8">
                        <MoreVertical className="h-3.5 w-3.5" />
                        <span className="sr-only">更多操作</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>编辑配置</DropdownMenuItem>
                      <DropdownMenuItem>导出日志</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem  onSelect={handleDeleteClick}>删除服务器</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                      {showDeleteModal && (
                        <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确定要删除服务器吗？</AlertDialogTitle>
                              <AlertDialogDescription className="text-red-500">
                                此操作无法撤销。这将永久从服务器中移除所有的数据。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={handleCloseModal}>继续</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}


                </div>
              </CardHeader>

              <CardContent className="p-6 text-sm">
                <div className="grid gap-3">
                  <div className="font-semibold">基础运维</div>
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        最近一小时可用百分比
                      </span>
                      <span>{latestUptime}%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        最近24小时可用百分比
                      </span>
                      <span> {siteData.averageUptime}%</span>
                    </li>
                  </ul>
                  <Separator className="my-2" />
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">最近一次故障时间</span>
                      <span>{latestDowntime.date} </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">当前状态</span>
                      <span> {currentStatus === 'up' ? '在线' : '挂了'}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">服务器ID</span>
                      <span>SSV_{siteData.id}</span>
                    </li>
                    <li className="flex items-center justify-between font-semibold">
                      <span className="text-muted-foreground">最近一次记录</span>
                      <span>{latestAvailable.date}</span>
                    </li>
                  </ul>
                </div>

                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <div className="font-semibold">服务器描述</div>
                    <address className="grid gap-0.5 not-italic text-muted-foreground">
                      <span>Apisever</span>
                      <span>Strapi for building</span>
                    </address>
                  </div>
                  <div className="grid auto-rows-max gap-3">
                    <div className="font-semibold">维护者</div>
                    <div className="flex items-center gap-2">
                      <img src="https://xn--7ovw36h.love/uploads/thumbnail_yuanshen_dr_xiao_6e8967ef4d.jpg"
                           alt="Shuakami" className="h-5 w-5 rounded-full"/>
                      <span className="text-muted-foreground">Shuakami</span>
                    </div>
                  </div>


                </div>
                <Separator className="my-4"/>
                <div className="grid gap-3">
                  <div className="font-semibold">其他</div>
                  <dl className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">站点地址</dt>
                      <a className="border-b" href={siteUrl} target="_blank" rel="noopener noreferrer">
                        {hostname}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">邮件地址</dt>
                      <dd>
                        <a href="mailto:">admin@sdjz.wiki</a>
                      </dd>
                    </div>
                  </dl>
                </div>
                <Separator className="my-4" />
                <div className="grid gap-3">
                  <div className="font-semibold">上线的版本</div>
                  <dl className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1 text-muted-foreground">
                        <ActivityLogIcon className="h-4 w-4" />
                        test_2024324
                      </dt>
                      <dd>Release</dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
              <CardFooter className="flex flex-row items-center border-t px-6 py-3">
                <div className="text-xs text-muted-foreground">
                 <time>{new Date().toString()}</time>
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
    </div>
  )
}
