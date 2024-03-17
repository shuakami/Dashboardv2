/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KamiHero } from './KamiUIHero'
import { sendToAPI } from './KamiAI/api';
import { Textarea } from '@/registry/new-york/ui/textarea';
import {Label} from "@/registry/new-york/ui/label";
import {Button} from "@/registry/new-york/ui/button";
import {ReloadIcon} from "@radix-ui/react-icons";

const KamiUI = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [inputValue, setInputValue] = useState(''); // 新增状态存储输入框的值
  const [notificationTrigger, setNotificationTrigger] = useState(false);

  const handleNotificationClick = async (id: string, description: string) => {
    const result = await sendToAPI(id, description);
    return result;
  };

  const handleInputChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setInputValue(event.target.value); // 更新状态以反映输入框的内容
  };

  const handleSendClick = async () => {
    const result = await sendToAPI(inputValue);
    console.log(result);
    // 发送完成后，改变状态以触发KamiHero组件的响应
    setNotificationTrigger(!notificationTrigger);
  };


  const hour = new Date().getHours();
  let timeOfDay;
  if (hour < 5) timeOfDay = "凌晨好";
  else if (hour < 12) timeOfDay = "早上好";
  else if (hour < 14) timeOfDay = "中午好";
  else if (hour < 18) timeOfDay = "下午好";
  else timeOfDay = "晚上好";

  const colorPairs = [
    ['#2ECC71', '#1ABC9C', '#F9BF3B', '#E67E22'], // 自然绿色系与暖色调的组合
    ['#E74C3C', '#C0392B', '#3498DB', '#2E86C1'], // 红色调与蓝色调的协调
    ['#16A085', '#2ECC71', '#5DADE2', '#46A3FF'], // 冷色调的协调
    ['#9B59B6', '#d4b4ec', '#D770AD', '#EC87BF'], // 紫色调的协调
    ['#FF69B4', '#E74C3C', '#EC87BF', '#AF7AC5'], // 粉红色与紫红色的搭配
    ['#AF7AC5', '#FF69B4', '#E74C3C', '#C0392B'], // 紫红色与红色系的搭配
    ['#F9BF3B', '#F9E79F', '#E67E22', '#D35400'], // 黄色与橙红色的温暖搭配
    ['#3498DB', '#5DADE2', '#16A085', '#2ECC71'], // 蓝色与青色的冷色调搭配
    ['#8E44AD', '#D770AD', '#FF69B4', '#E74C3C'], // 紫色调与粉红色调的组合
    ['#E74C3C', '#e1a6a1', '#F9BF3B', '#F9E79F'], // 红色与黄色系的温暖搭配
    ['#D0F5BE', '#FFCDD2', '#E1BEE7', '#D1C4E9'], // 鲜艳的粉蓝紫
    ['#8BC34A', '#CDDC39', '#FF7043', '#FF8A65'], // 自然绿与暖红色调搭配
    ['#42A5F5', '#EF5350', '#FFF176', '#66BB6A'], // 蓝色与红黄绿的对比
    ['#7986CB', '#B39DDB', '#FFF176', '#FFE57F'], // 紫色调与黄色调的搭配
    ['#9FA8DA', '#E1BEE7', '#FFF176', '#FFAB91'], // 紫色调与黄红的温馨组合
    ['#26A69A', '#4DD0E1', '#F9A825', '#FF8A65'], // 青色与蓝色的冷色调,黄色与橙色的暖色调
    ['#47a4d7', '#EF5350', '#FFF176', '#42A5F5'], // 灰色与红黄蓝的基础色搭配
    ['#E53935', '#f39932', '#F0F4C3', '#4DB6AC'], // 鲜艳的红橙色调,搭配冷静的蓝绿色调
    ['#42A5F5', '#26C6DA', '#C5E1A5', '#FFF176'], // 蓝色到绿色的渐变搭配
    ['#FF5252', '#efb8a4', '#E8F5E9', '#4DB6AC']  // 鲜红色调与温和的青绿色搭配
  ];

  // 从颜色组数组中随机选择一个颜色组
  const getRandomColorPair = () => {
    const index = Math.floor(Math.random() * colorPairs.length);
    const [startColorWelcome, endColorWelcome, startColorTimeOfDay, endColorTimeOfDay] = colorPairs[index];
    return {startColorWelcome, endColorWelcome, startColorTimeOfDay, endColorTimeOfDay};
  };

  // 修改动画配置函数以使用特定的颜色
  const welcomeAnimation = () => {
    const {startColorWelcome, endColorWelcome} = getRandomColorPair();
    return {
      background: `linear-gradient(30deg, ${startColorWelcome} 0%, ${endColorWelcome} 100%)`,
      color: 'transparent',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    };
  };

  const timeOfDayAnimation = () => {
    const {startColorTimeOfDay, endColorTimeOfDay} = getRandomColorPair();
    return {
      background: `linear-gradient(30deg, ${startColorTimeOfDay} 0%, ${endColorTimeOfDay} 100%)`,
      color: 'transparent',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    };
  };


  return (
    <div className="mx-auto mt-1 flex h-full max-w-xl flex-col border-r border-solid p-1" style={{height: '100vh'}}>
      <div className="flex-1 overflow-auto">
        <div className="flex items-center px-4 py-2">
          <h1 className="text-xl font-bold" style={{marginTop: '-4px'}}>&nbsp;KAMI {'>'}</h1>
        </div>
        <div className="mt-1 border-t p-5" style={{marginTop: '4.4px'}}>
          <motion.h2
            animate={welcomeAnimation()}
            transition={{duration: 4, repeat: Infinity, repeatType: 'reverse'}}
            className="mb-2 text-4xl font-bold"
          >
            欢迎。
          </motion.h2>
          <motion.h2
            animate={timeOfDayAnimation()}
            transition={{duration: 4.5, repeat: Infinity, repeatType: 'reverse'}}
            className="mb-4 text-4xl font-bold "
          >
            {timeOfDay}
          </motion.h2>
          <KamiHero onNotificationClick={handleNotificationClick} trigger={notificationTrigger} className={undefined} />        </div>
      </div>
      <div className="p-5">
        <div className="grid h-full w-full gap-1.5">
          <Textarea onChange={handleInputChange} placeholder="Type your message here." id="Kimi"/>
          <Button
            size="sm"
            className="ml-auto"
            onClick={handleSendClick}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}

  export default KamiUI;
