/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import { BellIcon, CheckIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/new-york/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card"
import { Switch } from "@/registry/new-york/ui/switch"
import {useEffect, useRef, useState} from "react";
import { CSSTransition } from 'react-transition-group';

const notifications = [
  {
    title: "快速整理邮件",
    description: "帮我整理一下这周的邮件",
    id:"quick[7]",
  },
  {
    title: "批量归档",
    description: "帮我把一周前的邮件都归档",
    id:"archive[-7]",
  },
  {
    title: "取消归档",
    description: "帮我把一周前的邮件都取消归档",
    id:"rearchive[-7]",
  },
  {
    title: "快速发送",
    description: "帮我给admin@sdjz.wiki发个邮件 内容随便",
    id:"sendmail[admin@sdjz.wiki]",
  },
]

type CardProps = React.ComponentProps<typeof Card>

// @ts-ignore
export function KamiHero({ className, onNotificationClick, trigger, ...props }) {
  const [ballPosition, setBallPosition] = useState({x: 0, y: 0});
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');


  // 鼠标移动事件处理函数，更新圆球位置
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const {left, top} = cardRef.current.getBoundingClientRect();
      setBallPosition({
        x: event.clientX - left - 50, // 减去圆球宽度的一半，使鼠标位于圆球中心
        y: event.clientY - top - 50, // 减去圆球高度的一半
      });
    }
  };

  useEffect(() => {
    console.log("tt")
    // 仅在trigger变化时设置isVisible为true

    setIsLoading(false);
    setIsVisible(true);
    setResult(result);
  }, [trigger]); // 侦听trigger的变化

  // 点击事件处理函数
  const handleNotificationClick = async (notification: { id: string; title: string; description?: string }) => {
    console.log("Clicked notification ID: ", notification.id, "Description: ", notification.description);
    setIsVisible(false);
    setIsLoading(true);
    if (onNotificationClick) {
      const result = await onNotificationClick(notification.id, notification.description || '');
      // @ts-ignore
      setResult(result);
      setIsLoading(false);
    }
  };


  return (
    <div className={cn("relative mt-10 w-[380px] overflow-hidden rounded-xl", className)} {...props}>
      {isLoading ? (
        <Card className="w-full bg-transparent backdrop-blur-md">
          <CardHeader>
            <CardTitle>加载中...</CardTitle>
          </CardHeader>
        </Card>
      ) : !isVisible && result ? (
        <Card className="w-full bg-transparent backdrop-blur-md">
          <CardHeader>
            <CardTitle>结果</CardTitle>
            <div className="absolute right-4 top-4 cursor-pointer" onClick={() => setIsVisible(true)}>
              <CheckIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p>{result}</p>
          </CardContent>
        </Card>
      ) : (
        <CSSTransition
          in={isVisible}
          timeout={300}
          classNames="fade"
          unmountOnExit
        >
          <Card ref={cardRef} onMouseMove={handleMouseMove} className="w-full bg-transparent backdrop-blur-md">
            <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg" style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(140deg, #F9BF3B, #E67E22)',
              transform: `translate(${ballPosition.x}px, ${ballPosition.y}px)`,
              filter: 'blur(80px)',
              opacity: '0.75'
            }}/>
            <CardHeader>
              <CardTitle>快速上手</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="z-50 mb-4 grid cursor-pointer grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span className="z-50 flex h-2 w-2 translate-y-1 rounded-full bg-sky-500"/>
                    <div className="z-50 space-y-1">
                      <p className="z-50 text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="z-50 text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CSSTransition>
      )}
    </div>
  )
}
