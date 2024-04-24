/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */
"use client"
import { Button } from "@/registry/new-york/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/new-york/ui/tabs"
import { CalendarDateRangePicker } from "@/app/content/dashboard/components/date-range-picker"
import  EnhancedWebsiteHourlyTraffic from "./hero/analytics"
import WebsiteHourlyTraffic from "./hero/analytics";
import {UptimeStatusCards} from "./hero/status";
import { AITable, LogEntry } from "./hero/ai";
import DataAnalysisComponent from "./hero/aiapi";
import {SetStateAction, useState} from "react";
import {StatusModal} from "@/app/content/dashboard/hero/statusmodal";


export default function DashboardPage() {
  const [analysisData, setAnalysisData] = useState(null); // 用于存储分析数据
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);
  const [fadeClass, setFadeClass] = useState('fade-in');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAnalysisData = (data: any) => {
    setAnalysisData(data);
  };

  const handleEntryClick = (entry: LogEntry) => {
    setIsAnimating(true); // 开始动画
    setFadeClass('fade-out');

    setTimeout(() => {
      setSelectedEntry(entry);
      setFadeClass('fade-in');
      setIsAnimating(false); // 动画结束
    }, 300);
  };


  const handleBackClick = () => {
    setFadeClass('fade-out'); // 返回时设置为渐隐
    setTimeout(() => {
      setSelectedEntry(null); // 延迟以等待渐隐动画完成
      setFadeClass('fade-in'); // 重置为渐显以供下次使用
    }, 500);
  };



  return (
    <>
      <div className={`h-full w-full flex-col md:flex ${fadeClass}`}>
        <div className="">
        </div>
        {selectedEntry ? (
          // 如果有选中的LogEntry，则显示StatusModal，并将selectedEntry作为prop传入
          <StatusModal entryData={selectedEntry} onBackClick={handleBackClick}/>
        ) : (
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <div className="flex items-center space-x-2">
                <CalendarDateRangePicker/>
                <Button>Download</Button>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics" disabled>
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="reports" disabled>
                  Reports
                </TabsTrigger>
                <TabsTrigger value="notifications" disabled>
                  Notifications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="h-screen space-y-4">
                <AITable analysisData={analysisData} onEntryClick={handleEntryClick}/>
                <UptimeStatusCards onEntryClick={handleEntryClick} />
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-2">
                  <WebsiteHourlyTraffic/>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <DataAnalysisComponent onAnalysisComplete={handleAnalysisData}/>
                </div>

              </TabsContent>
            </Tabs>

          </div>
        )}
      </div>
    </>
  )
}
