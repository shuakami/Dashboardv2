/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

"use client"

import * as React from "react"

import { useConfig } from "@/hooks/use-config"
import { ThemeWrapper } from "@/components/theme-wrapper"
import CardsDefault from "@/registry/default/example/cards"
import { Skeleton } from "@/registry/default/ui/skeleton"
import CardsNewYork from "@/registry/new-york/example/cards"

export function ThemesTabs() {
  const [mounted, setMounted] = React.useState(false)
  const [config] = useConfig()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="space-y-8">
      {!mounted ? (
        <div className="md:grids-col-2 grid md:gap-4 lg:grid-cols-10 xl:gap-6">
          <div className="space-y-4 lg:col-span-4 xl:col-span-6 xl:space-y-6">
            <Skeleton className="h-[218px] w-full" />
            <div className="grid gap-1 sm:grid-cols-[260px_1fr] md:hidden">
              <Skeleton className="h-[218px] w-full" />
              <div className="pt-3 sm:pl-2 sm:pt-0 xl:pl-4">
                <Skeleton className="h-[218px] w-full" />
              </div>
              <div className="pt-3 sm:col-span-2 xl:pt-4">
                <Skeleton className="h-[218px] w-full" />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="space-y-4 xl:space-y-6">
                <Skeleton className="h-[218px] w-full" />
                <Skeleton className="h-[218px] w-full" />
                <Skeleton className="h-[218px] w-full" />
              </div>
              <div className="space-y-4 xl:space-y-6">
                <Skeleton className="h-[218px] w-full" />
                <Skeleton className="h-[218px] w-full" />
                <div className="hidden xl:block">
                  <Skeleton className="h-[218px] w-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4 lg:col-span-6 xl:col-span-4 xl:space-y-6">
            <div className="hidden gap-1 sm:grid-cols-[260px_1fr] md:grid">
              <Skeleton className="h-[218px] w-full" />
              <div className="pt-3 sm:pl-2 sm:pt-0 xl:pl-4">
                <Skeleton className="h-[218px] w-full" />
              </div>
              <div className="pt-3 sm:col-span-2 xl:pt-4">
                <Skeleton className="h-[218px] w-full" />
              </div>
            </div>
            <div className="hidden md:block">
              <Skeleton className="h-[218px] w-full" />
            </div>
            <Skeleton className="h-[218px] w-full" />
          </div>
        </div>
      ) : (
        <ThemeWrapper>
          {config.style === "new-york" && <CardsNewYork />}
          {config.style === "default" && <CardsDefault />}
        </ThemeWrapper>
      )}
    </div>
  )
}
