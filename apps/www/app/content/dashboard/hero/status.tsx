/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface UptimeStatus {
  id: number;
  name?: string;
  status: 'active' | 'down' | 'loading';
}



// @ts-ignore
export function UptimeStatusCards({ onEntryClick }) {
  const [statuses, setStatuses] = useState<UptimeStatus[]>([
    { id: 0, status: 'active' },
    { id: 1, status: 'active' },
    { id: 2, status: 'active' },
    { id: 3, status: 'active' },
  ]);

  const handleCardClick = (name: string | undefined) => {
    // 构造一个具有预期结构的LogEntry对象
    const entry = {
      attributes: {
        siteName: name
      }
    };
    onEntryClick(entry); // 传递这个构造好的对象
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Sending request to /api/uptime');
        const response = await axios.post('/api/uptime', { days: 1 }); // 请求最近一天的数据
        console.log('Response from /api/uptime:', response.data);

        if (response.data.success) {
          // 直接取返回数据的前4个项目
          const firstFourStatuses = response.data.data.slice(0, 4).map((item: { name: string ;id: any; status: string; }) => ({
            id: item.id,
            name: item.name,
            status: item.status === 'up' ? 'active' : 'down',
          }));
          console.log('First four statuses:', firstFourStatuses);
          setStatuses(firstFourStatuses);
        }
      } catch (error) {
        console.error('Error fetching uptime data:', error);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="max-w-2/3 mx-auto">
      <div className="grid grid-cols-4 gap-4">
        {statuses.map(({ name, status }) => (
          <div
            key={name}
            className="flex cursor-pointer flex-col justify-between rounded-lg border px-4 py-3 text-black shadow-sm dark:text-white"
            onClick={() => handleCardClick(name)} // 点击卡片时调用
          >
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium">{name}</span>
              <span className={status === 'active' ? 'text-green-500' : 'text-red-500'}>
              {status === 'active' ? '↑' : '↓'}
            </span>
            </div>
            <div className="text-2xl font-bold">
              {status === 'active' ? '正常' : '异常'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
