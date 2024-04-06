/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import { Button } from "@/registry/new-york/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card"
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
