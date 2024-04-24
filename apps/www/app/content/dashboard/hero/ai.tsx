/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

"use client"

import * as React from "react"
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons"
import axios from 'axios';
import { Skeleton } from "@/registry/default/ui/skeleton"
import {Activity, ChevronUp, GithubIcon} from 'lucide-react';
import { Button } from "@/registry/default/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/ui/card"
import {Badge} from "@/registry/new-york/ui/badge";
import {useEffect, useRef, useState} from "react";


interface GPTResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    logprobs: null | any;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  system_fingerprint: string;
}

interface LogEntryAttributes {
  gptResponse: string;
  siteName: string;
  visitsSummary: string;
  liveCounters: string;
  averageUptime: string;
  lastUptimeDate: string;
  daysSinceLastUptime: string;
  lastDowntimeDate: string;
  daysSinceLastDowntime: string;
  createdAt: string;
  updatedAt: string;
  solved: string;
}

export interface LogEntry {
  id: number;
  attributes: LogEntryAttributes;
}

interface AITableProps {
  analysisData: any; // 根据实际情况替换为更具体的类型
}


export const AITable: React.FC<AITableProps & { onEntryClick: (data: LogEntry) => void }> = ({ analysisData, onEntryClick }) => {
  const [isChevronRight, setIsChevronRight] = React.useState(false);
  const [isCardVisible, setIsCardVisible] = React.useState(true);
  const [cardHeight, setCardHeight] = React.useState('auto');
  const cardRef = React.useRef(null);
  const [data, setData] = useState<LogEntry[]>([]); // 使用类型注解
  const [cardOpacity, setCardOpacity] = React.useState(1); // 新状态用于控制卡片透明度
  const fetchDataDebounced = useRef<ReturnType<typeof setTimeout>>(); // 用于存储定时器ID


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/ailogs`);
        // 对获取的数据进行排序和截取
        const sortedData = response.data.data.sort((a: { attributes: { updatedAt: string | number | Date; }; }, b: { attributes: { updatedAt: string | number | Date; }; }) => {
          // 将updatedAt转换为日期对象进行比较
          // @ts-ignore
          return new Date(b.attributes.updatedAt) - new Date(a.attributes.updatedAt);
        }).slice(0, 7); // 仅保留最新的7条记录
        setData(sortedData);
      } catch (error) {
        console.error('Error fetching data from API:', error);
      }
    };

    const fetchDataWithDebounce = () => {
      if (fetchDataDebounced.current) {
        clearTimeout(fetchDataDebounced.current); // 如果存在正在进行的定时器，清除它
      }
      fetchDataDebounced.current = setTimeout(() => {
        fetchData(); // 设置新的定时器
      }, 30000); // 30秒后执行
    };

    fetchData(); // 组件挂载时立即执行一次数据获取
    fetchDataWithDebounce(); // 然后设置自动刷新

    return () => {
      if (fetchDataDebounced.current) {
        clearTimeout(fetchDataDebounced.current); // 组件卸载时清除定时器
      }
    };
  }, []); // 确保这个effect只在组件挂载时运行

  React.useEffect(() => {
    if (cardRef.current) {
      // 仅在组件挂载时设置初始高度，确保有足够的内容计算高度
      // @ts-ignore
      setCardHeight(`${cardRef.current.scrollHeight}px`);
    }
  }, [data]); // 依赖于data，确保内容加载后设置高度

  const handleButtonClick = () => {
    setIsChevronRight(!isChevronRight);
    if (!isCardVisible) {
      // 卡片即将展开
      // @ts-ignore
      setCardHeight(`${cardRef.current.scrollHeight}px`); // 预设高度以启动动画
      setTimeout(() => {
        setCardOpacity(1); // 恢复透明度
      }, 10); // 给动画一点时间开始
    } else {
      // 卡片即将折叠
      setCardOpacity(0); // 先降低透明度
      setTimeout(() => {
        setCardHeight('0px'); // 再设置高度为0
      }, 0); // 等待透明度动画完成
    }
    setIsCardVisible(!isCardVisible);
  };




  return (
    <>
      <Button variant="ghost" onClick={handleButtonClick} className="flex items-center space-x-2 px-2 py-1 text-sm" style={{height: '30px'}}>
        <ChevronUp className={`transition-transform ${isChevronRight ? 'rotate-90' : 'rotate-0'}`} size={14}/>
        <span>AI Log Explorer Pro</span>
      </Button>

      <Card
        ref={cardRef}
        className={`origin-top overflow-hidden transition-all duration-700 ease-in-out ${cardOpacity === 1 ? 'opacity-100' : 'opacity-0'}`}
        style={{height: cardHeight}}
      >
        <CardContent className="py-3">
          {data.map((entry, index) => {
            const handleClick = () => onEntryClick(entry);
            const attributes = entry.attributes;
            const content = JSON.parse(attributes.gptResponse).choices[0].message.content || "LOG Title";
            const badgeName = attributes.siteName || "浏览量异常";
            const updatedAtDaysAgo = Math.floor((new Date().getTime() - new Date(attributes.updatedAt).getTime()) / (1000 * 60 * 60 * 24));

            let timeAgoString;
            if (updatedAtDaysAgo > 0) {
              timeAgoString = `${updatedAtDaysAgo}天前`;
            } else {
              const hoursAgo = Math.floor((new Date().getTime() - new Date(attributes.updatedAt).getTime()) / (1000 * 60 * 60));
              if (hoursAgo > 0) {
                timeAgoString = `${hoursAgo}小时前`;
              } else {
                const minutesAgo = Math.floor((new Date().getTime() - new Date(attributes.updatedAt).getTime()) / (1000 * 60));
                if (minutesAgo > 0) {
                  timeAgoString = `${minutesAgo}分钟前`;
                } else {
                  const secondsAgo = Math.floor((new Date().getTime() - new Date(attributes.updatedAt).getTime()) / 1000);
                  timeAgoString = secondsAgo > 0 ? `${secondsAgo}秒前` : '刚刚';
                }
              }
            }
            const availability = parseFloat(attributes.averageUptime);
            const solved = attributes.solved;

            return (
              <div key={entry.id} onClick={handleClick} className="cursor-pointer">
                {index > 0 && <hr className="my-4"/>}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex space-x-0.5">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500"></div>
                      <div className="flex h-4 w-4 rotate-45 items-center justify-center rounded-full bg-red-500"></div>
                    </div>
                    <div className="ml-2">
                      <h3 className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold"
                          style={{maxWidth: '50em'}}>
                        {content}
                      </h3>
                    </div>
                  </div>
                  <DotsHorizontalIcon className="h-5 w-5 text-gray-300"/>
                </div>
                <div className="-ml-1 mt-2 flex space-x-2">
                  {solved && (
                    <Badge className="rounded-2xl border hover:border-red-400/45 hover:dark:border-red-500/45"
                           variant="outline"
                           style={{color: 'rgb(255,97,102)', backgroundColor: 'hsla(354,100%,50%,0.13)'}}>
                      <span style={{
                        backgroundColor: '#ff0000',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        display: 'inline-block',
                        marginRight: '6px'
                      }}></span>
                      {badgeName}
                    </Badge>
                  )}
                  {!solved && (
                    <Badge
                      className="rounded-2xl text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
                      variant="outline">
                      <span style={{
                        backgroundColor: '#00dfd8',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        display: 'inline-block',
                        marginRight: '6px'
                      }}></span>
                      {badgeName}
                    </Badge>
                  )}
                  <Badge className="rounded-2xl text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
                         variant="outline">
                    <GithubIcon style={{width: '10px', height: '12px', marginRight: '6px'}}/>
                    {`${timeAgoString}`}
                  </Badge>
                  <Badge className="rounded-2xl text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
                         variant="outline">
                    <Activity style={{width: '10px', height: '12px', marginRight: '6px'}}/>
                    {`可用度: ${availability}%`}
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
};
