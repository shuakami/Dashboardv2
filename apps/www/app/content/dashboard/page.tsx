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

export default function DashboardPage() {
  return (
    <>
      <div  className="h-full w-full flex-col md:flex">
        <div className="">
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2">
              <CalendarDateRangePicker />
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
              <UptimeStatusCards/>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <WebsiteHourlyTraffic />

              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
