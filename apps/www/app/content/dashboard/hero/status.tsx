/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface UptimeStatus {
  id: number;
  name?: string;
  status: 'active' | 'down' | 'loading';
}


export function UptimeStatusCards() {
  const [statuses, setStatuses] = useState<UptimeStatus[]>([
    { id: 0, status: 'active' },
    { id: 1, status: 'active' },
    { id: 2, status: 'active' },
    { id: 3, status: 'active' },
  ]);

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
            className="flex flex-col justify-between rounded-lg border px-4 py-3 text-black shadow-sm dark:text-white"
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
