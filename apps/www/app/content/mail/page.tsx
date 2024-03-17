/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import { cookies } from "next/headers"
import Image from "next/image"

import { Mail } from "@/app/content/mail/components/mail"
// @ts-ignore
import { accounts, mails } from "@/app/content/mail/data"
import React from "react";
import Loading from "@/app/content/mail/loading";

export default function MailPage() {
  const layout = cookies().get("react-resizable-panels:layout")
  const collapsed = cookies().get("react-resizable-panels:collapsed")

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

  return (
    <>
      <div className="md:hidden">

      </div>
        <div className="relative flex h-full flex-col overflow-hidden">
          {/* 白色主题视频 */}
          <video autoPlay loop muted
                 className="absolute left-0 top-0 z-[-1] min-h-full w-auto min-w-full max-w-none dark:hidden"
                 style={{filter: 'blur(70px)', objectFit: 'cover'}}>
            <source src="/vid/backgroundwhite.mp4" type="video/mp4"/>
            Your browser does not support the video tag.
          </video>
          {/* 黑色主题视频 */}
          <video autoPlay loop muted
                 className="absolute left-0 top-0 z-[-1] hidden min-h-full w-auto min-w-full max-w-none dark:block"
                 style={{filter: 'blur(70px)', objectFit: 'cover'}}>
            <source src="/vid/background.mp4" type="video/mp4"/>
            Your browser does not support the video tag.
          </video>
          {/* 覆盖层 */}
          <div
            className="absolute left-0 top-0 z-0 min-h-full min-w-full bg-white bg-opacity-75 dark:bg-black dark:bg-opacity-75"></div>
          <div className="relative z-10 items-center p-2">
            <Mail
              accounts={accounts}
              mails={mails}
              defaultLayout={defaultLayout}
              defaultCollapsed={defaultCollapsed}
              navCollapsedSize={4}
            />
          </div>
        </div>
    </>
  )
}
