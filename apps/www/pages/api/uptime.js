/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

// pages/api/uptime.js
import axios from 'axios';
import dayjs from 'dayjs';

const UPTIME_ROBOT_API_KEY = 'u1866693-ec1fc9e9e70a9f7f2c684155';
const UPTIME_ROBOT_API_URL = 'https://cors.status.org.cn/uptimerobot/v2/getMonitors';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { days } = req.body; // 从请求体中获取天数
    try {
      const data = await getSiteData(UPTIME_ROBOT_API_KEY, days);
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('API Route Error:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  } else {
    // 处理非POST请求
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getSiteData(apikey, days) {
  const dates = [];
  const today = dayjs(new Date().setHours(0, 0, 0, 0));

  for (let d = 0; d < days; d++) {
    dates.push(today.subtract(d, 'day'));
  }

  const ranges = dates.map(date => `${date.unix()}_${date.add(1, 'day').unix()}`);
  const start = dates[dates.length - 1].unix();
  const end = dates[0].add(1, 'day').unix();
  ranges.push(`${start}_${end}`);

  const postdata = {
    api_key: apikey,
    format: 'json',
    logs: 1,
    log_types: '1-2',
    logs_start_date: start,
    logs_end_date: end,
    custom_uptime_ranges: ranges.join('-'),
  };

  const response = await axios.post(UPTIME_ROBOT_API_URL, postdata, { headers: { 'Content-Type': 'application/json' } });
  if (response.data && response.data.monitors) {
    const processedData = dataProcessing(response.data.monitors, dates);
    return processedData;
  } else {
    throw new Error('Failed to retrieve data from UptimeRobot');
  }
}

function dataProcessing(data, dates) {
  return data.map(monitor => {
    const ranges = monitor.custom_uptime_ranges.split("-").map(range => parseFloat(range));
    const averageUptime = ranges.pop(); // 假设最后一个元素是总体平均值

    const dailyUptime = dates.map((date, index) => {
      const uptime = ranges.length > index ? ranges[index] : null;
      return {
        date: date.format("YYYY-MM-DD"),
        uptime: uptime,
      };
    });

    // 对日志进行处理，计算每天的故障次数和故障持续时间
    const dailyDown = dates.map(date => ({
      date: date.format("YYYY-MM-DD"),
      times: 0,
      duration: 0,
    }));

    monitor.logs.forEach(log => {
      const logDate = dayjs.unix(log.datetime).format("YYYY-MM-DD");
      const index = dailyDown.findIndex(d => d.date === logDate);
      if (index !== -1) {
        dailyDown[index].times += 1;
        dailyDown[index].duration += log.duration;
      }
    });

    return {
      id: monitor.id,
      name: monitor.friendly_name,
      url: monitor.url,
      averageUptime,
      dailyUptime,
      dailyDown,
      status: monitor.status === 2 ? "up" : "down",
    };
  });
}
