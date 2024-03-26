/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

// @ts-ignore

import axios from 'axios';
import { Mail } from "@/app/content/mail/components/mail"
// @ts-ignore
import { accounts, mails } from "@/app/content/mail/data"

import Loading from "@/app/content/mail/loading";
import { SwitchTransition, CSSTransition } from 'react-transition-group';
export default function MailPage() {














  return (
    <>
      <div className="relative flex h-full flex-col overflow-hidden">
        <CSSTransition

          timeout={270}
          classNames="fade"
          appear // 使用 appear prop 来确保动画在初次渲染时触发
        >
          <div>
        {/* 白色主题视频 */}
       <div
          className="absolute left-0 top-0 z-[-1] min-h-full w-auto min-w-full max-w-none bg-white dark:bg-black"></div>



          </div>
        </CSSTransition>



        <div className="relative z-10 items-center p-2">
          <Mail
            accounts={accounts}
            mails={mails}
            defaultLayout={undefined}
            defaultCollapsed={true}
            navCollapsedSize={4}
          />
        </div>
      </div>
    </>
  )
}
