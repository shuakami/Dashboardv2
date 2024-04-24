/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import React, {useEffect, useRef, useState} from 'react';
import {AspectRatio} from "@/registry/new-york/ui/aspect-ratio";
import Image from "next/image"
import { setupAxiosInterceptors } from '@/app/setupAxiosInterceptors';

setupAxiosInterceptors();
type Data = {
  [key: string]: string[];
};

// @ts-ignore
const CustomMailText = ({ text, date }: { text: string; date: string }) => {
  // 将文本按段落分割
  const paragraphs = text.split('\n').filter((line: string) => line.trim() !== '');
  const [isDark, setIsDark] = useState(false);
  const weekNumber = getWeekNumber(date);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const imageRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    // 检测暗黑模式的变化
    const matchDark = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(matchDark.matches);

    // 监听暗黑模式的改变
    const handleChange = (e: { matches: boolean | ((prevState: boolean) => boolean); }) => setIsDark(e.matches);
    matchDark.addEventListener('change', handleChange);

    // 清理监听器
    return () => matchDark.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // 在组件加载完成后，设置 `isImageVisible` 为 `true`，显示图片
    setTimeout(() => setIsImageVisible(true), 100);

    // 监听模式变化
    const handleThemeChange = () => {
      // 重新设置 `isImageVisible` 为 `false`，触发动画
      setIsImageVisible(false);

      // 延迟 100 毫秒后，将 `isImageVisible` 设置为 `true`，显示图片
      setTimeout(() => setIsImageVisible(true), 100);
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleThemeChange);

    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'opacity') {
          // @ts-ignore
          textRef.current.style.opacity = imageOpacity;
        }
      });
    });
    // @ts-ignore
    return () => {
      observer.disconnect();
    };
  }, [isImageVisible]);

  // 根据isDark状态选择图片源
  const imageUrl = isDark
    ? "${process.env.NEXT_PUBLIC_STRAPI_URL}/uploads/dark_bg_data_18931fc718.png"
    : "${process.env.NEXT_PUBLIC_STRAPI_URL}/uploads/light_bg_data_ca0ff08d92.png";

  // 初始化一个变量来收集非数据段的文本
  const analysisTexts: any[] = [];

  // 解析数据，将其组织成 { 指标: [今日, 昨日, 本月, 总计] } 的形式
  const data: Data = {}; // 使用上面定义的类型
  let currentSection = '';

  function getWeekNumber(dateStr: string | number | Date) {
    const date = new Date(dateStr);

    // 计算年、月
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() 返回的月份从0开始

    // 计算月的第一天是周几
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWeekdayOfMonth = firstDayOfMonth.getDay(); // getDay() 返回的是星期几，0表示星期天

    // 计算当前日期是该月的第几天
    const dayOfMonth = date.getDate();

    // 计算当前日期是该月的第几周
    const weekOfMonth = Math.ceil((dayOfMonth + firstWeekdayOfMonth) / 7);

    return `${year}年${month}月第${weekOfMonth}周`;
  }

  paragraphs.forEach((paragraph: string) => {
    if (paragraph.startsWith('-') && !currentSection.match(/(线性分析|对比分析|预警及改进方案)/)) {
      // 是数据行，解析数据
      const [key, value] = paragraph.substring(1).trim().split(':').map(item => item.trim());
      // @ts-ignore
      if (!data[key]) {
        // @ts-ignore
        data[key] = [];
      }
      // @ts-ignore
      data[key].push(value);
    } else if (/^\d+\./.test(paragraph) || paragraph.match(/(线性分析|对比分析|预警及改进方案)/)) {
      // 是标题行，记录当前部分
      currentSection = paragraph;
      analysisTexts.push(paragraph);
    } else if (currentSection.match(/(线性分析|对比分析|预警及改进方案)/)) {
      // 当前部分是分析段落，直接添加到分析文本中
      analysisTexts.push(paragraph);
    }
  });

  // 根据解析的数据生成表格
  const generateTable = () => (
    <table className="w-full table-auto text-left text-sm text-gray-500">
      <thead className=" border-b text-xs uppercase text-gray-700 dark:text-blue-50">
      <tr>
        <th scope="col" className="px-6 py-3">指标</th>
        <th scope="col" className="px-6 py-3">今日</th>
        <th scope="col" className="px-6 py-3">昨日</th>
        <th scope="col" className="px-6 py-3">本月</th>
        <th scope="col" className="px-6 py-3">总计数据</th>
      </tr>
      </thead>
      <tbody>
      {Object.entries(data).map(([key, values]) => (
        <tr key={key} className="border-b dark:text-blue-50">
          <td className="px-6 py-4">{key}</td>
          {values.map((value, index) => {
            // 检查值是否以"ms"结尾并转换
            let formattedValue = value;
            if (value.endsWith('ms')) {
              let seconds = parseInt(value) / 1000;
              if (seconds > 100) {
                // 如果秒数大于100，则转换为分钟
                const minutes = seconds / 60;
                formattedValue = `${minutes.toFixed(2)}min`;
              } else {
                // 否则直接显示秒数
                formattedValue = `${seconds}s`;
              }
            }
            return (
              <td key={index} className="px-6 py-4">{formattedValue}</td>
            );
          })}
        </tr>
      ))}
      </tbody>
    </table>
  );

  // 渲染分析文本
  const renderAnalysisText = () => (
    analysisTexts.map((text, index) => {
      if (text.match(/(线性分析|对比分析|预警及改进方案|预警|改进方案)/)) {
        // 如果是标题，应用标题样式
        return <h2 key={index} className="mb-2 mt-8 text-lg font-bold">{text}</h2>;
      } else {
        // 去除每项前的`-`并渲染为段落
        const cleanedText = text.startsWith('-') ? text.substring(1).trim() : text;
        return <p key={index} className="mb-4 ml-1">{cleanedText}</p>;
      }
    })
  );

  // 渲染表格和分析文本
  return (
    <div>
      <div className="relative mt-2" style={{ width: '469px', height: '256px' }}>
      <AspectRatio ratio={16 / 9} className="mt-2 bg-transparent" >
        <Image
          ref={imageRef}
          src={imageUrl}
          alt="Photo by Drew Beamer"
          fill
          className={`${isImageVisible ? 'opacity-100' : 'opacity-0'} rounded-md object-cover transition-opacity duration-500 ease-in`}
        />
        {isDark ? (
          <p
            ref={textRef}
            className="absolute bottom-16 left-1 ml-10 p-4 text-white transition-opacity duration-500 ease-in"
            style={{ opacity: isImageVisible ? 1 : 0, whiteSpace: 'nowrap' }}
          >
            {weekNumber}
          </p>
        ) : (
          <p
            ref={textRef}
            className="absolute right-80 top-20 ml-6 p-4 text-xs text-black transition-opacity duration-500 ease-in"
            style={{ opacity: isImageVisible ? 1 : 0, whiteSpace: 'nowrap'  }}
          >
            {weekNumber}
          </p>
        )}
      </AspectRatio>
      </div>
      {renderAnalysisText()}
      <h2 className="mb-2 ml-1 mt-8 text-lg font-bold">附件数据指标:</h2>
      {generateTable()}
    </div>
  );
};

export default CustomMailText;
