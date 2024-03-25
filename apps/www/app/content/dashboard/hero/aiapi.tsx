/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

// aiapi.tsx
"use client"
import axios from 'axios';
import { useEffect, useState } from 'react';



interface UptimeStatus {
  id: number;
  name: string;
  status: string;
  averageUptime: number;
  dailyUptime: Array<{ date: string; uptime: number }>;
  dailyDown: Array<{ date: string; times: number; duration: number }>;
}





const fetchUptimeStatus = async (days: number) => {
  try {
    const response = await axios.post('/api/uptime', { days });
    if (response.data && response.data.success) {
      // Assuming the API returns an array of status objects
      return response.data.data as UptimeStatus[];
    } else {
      throw new Error('Failed to fetch uptime status');
    }
  } catch (error) {
    console.error('Error fetching uptime status:', error);
    throw error;
  }
};

// Example of using the fetch function
const useUptimeStatus = (days: number) => {
  const [statuses, setStatuses] = useState<UptimeStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUptimeStatus(days)
      .then(setStatuses)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [days]);

  return { statuses, loading, error };
};

// Export the custom hook if you want to use it in other parts of your application
export { useUptimeStatus };

const useMatomoData = () => {
  const [visitsSummary, setVisitsSummary] = useState({});
  const [liveCounters, setLiveCounters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Assume we want to get today's visits summary and the last 60 minutes data
    Promise.all([
      fetchVisitsSummary("day", "today"),
      fetchLiveCounters(60),
    ])
      .then(([summaryData, countersData]) => {
        setVisitsSummary(summaryData);
        setLiveCounters(countersData);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { visitsSummary, liveCounters, loading, error };
};


// 定义Matomo API调用的URL和认证信息
const MATOMO_API_BASE_URL = "https://analytics.sdjz.wiki/index.php";
const MATOMO_TOKEN_AUTH = "55a0bf3079809e9e2719dfbc580751e6";
const MATOMO_SITE_ID = "1";

// 获取网站访问摘要数据
const fetchVisitsSummary = async (period: string, date: string) => {
  try {
    const response = await axios.post(MATOMO_API_BASE_URL, new URLSearchParams({
      module: "API",
      method: "VisitsSummary.get",
      idSite: MATOMO_SITE_ID,
      period: period,
      date: date,
      format: "JSON",
      token_auth: MATOMO_TOKEN_AUTH,
      filter_limit: '-1'
    }).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching VisitsSummary data:", error);
    throw error;
  }
};

// 获取最近一小时的实时访问数据
const fetchLiveCounters = async (lastMinutes: number) => {
  try {
    const response = await axios.post(MATOMO_API_BASE_URL, new URLSearchParams({
      module: "API",
      method: "Live.getCounters",
      idSite: MATOMO_SITE_ID,
      lastMinutes: lastMinutes.toString(),
      format: "JSON",
      token_auth: MATOMO_TOKEN_AUTH,
    }).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data[0]; // Assuming the response is an array with one object
  } catch (error) {
    console.error("Error fetching LiveCounters data:", error);
    throw error;
  }
};

// 计算从最后一次下线到现在的天数
const calculateDaysAgo = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  const today = new Date();
  // @ts-ignore
  const diffTime = Math.abs(today - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};


const decideIfNeedGPTAnalysis = async (initialStatuses: UptimeStatus[], visitsSummary: any, liveCounters: any) => {
  let needAnalysis = false;
  const analysisReasons: string[] = [];
  let adjustedStatuses = [...initialStatuses];
  let days = 160; // 初始设置为请求1天的数据

  // 检查是否有站点下线且下线持续时间为0
  const downServicesWithZeroDowntime = adjustedStatuses.filter(service => service.status === 'down' && service.dailyDown.some(d => d.duration === 0));

  if (downServicesWithZeroDowntime.length > 0) {
    // 如果有站点下线但持续时间为0，则请求160天的数据
    days = 160;
    adjustedStatuses = await fetchUptimeStatus(days); // 重新获取60天的数据
  }

  // 构建包含状态详细信息的分析原因字符串
  initialStatuses.forEach((status) => {
    console.log(`正在分析站点: ${status.name}`);

    if (status.status === 'down') {
      console.log(`站点 ${status.name} 当前状态为下线`);
      console.log(`站点 ${status.name} 的 dailyUptime 数组:`, status.dailyUptime);

      // 找到最后一次uptime为100的记录，即最后一次完全在线的日期
      const lastUptimeRecord = [...status.dailyUptime].reverse().find(record => record.uptime === 100);
      const lastUptimeDate = lastUptimeRecord ? lastUptimeRecord.date : 'N/A';
      const daysSinceLastUptime = lastUptimeDate !== 'N/A' ? calculateDaysAgo(lastUptimeDate) : 'N/A';

      console.log(`站点 ${status.name} 最后一次上线日期: ${lastUptimeDate}, 距今: ${daysSinceLastUptime} 天`);

      // 找到最近一次uptime为0的记录，即最后一次开始下线的日期
      const lastDowntimeRecord = [...status.dailyUptime].reverse().find(record => record.uptime === 0);
      const lastDowntimeDate = lastDowntimeRecord ? lastDowntimeRecord.date : 'N/A';
      const daysSinceLastDowntime = lastDowntimeDate !== 'N/A' ? calculateDaysAgo(lastDowntimeDate) : 'N/A';

      console.log(`站点 ${status.name} 最近一次下线发生在: ${lastDowntimeDate}, 从最后一次下线到现在已经过去了: ${daysSinceLastDowntime} 天`);

      analysisReasons.push(`站点 "${status.name}" 当前状态为下线。平均在线时间：${status.averageUptime}%，最后一次上线日期为 ${lastUptimeDate}，距今已 ${daysSinceLastUptime} 天。最近一次下线发生在 ${lastDowntimeDate}，从最后一次下线到现在已经过去了 ${daysSinceLastDowntime} 天。`);
      needAnalysis = true;
    }
  });


  // 检测访问量是否异常减少
  if (parseInt(visitsSummary.nb_visits) < 10) { // 日访问量少于10为异常
    needAnalysis = true;
    analysisReasons.push('网站访问量异常减少。');
  }

  // 检测实时数据中活动数量是否异常
  if (liveCounters.actions > 1000) {
    needAnalysis = true;
    analysisReasons.push('最近一小时活动数量异常增多。');
  }

  return { needAnalysis, analysisReasons, days };
};

// GPT-4 API请求函数
const requestGPTAnalysis = async (analysisReasons: string[], visitsSummary: any, liveCounters: any) => {
  // 构建系统提示和用户提示
  const promptSystem = `请根据以下数据提供分析：`;
  const promptUser = `存在异常情况：${analysisReasons.join('; ')}. 网站访问摘要数据显示，日访问量为${visitsSummary.nb_visits}，最近一小时活动数量为${liveCounters.actions}.`;

  const data = {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 2024,
    top_p: 1,
    messages: [
      {
        role: 'system',
        content: promptSystem
      },
      {
        role: 'user',
        content: promptUser
      }
    ]
  };

  try {
    const response = await axios.post('https://api.openai-hk.com/v1/chat/completions', data, {
      headers: {
        'Authorization': 'Bearer hk-8d4a581000010138775b1a58955c02d8bf41e2fa3bab3291',
        'Content-Type': 'application/json'
      },
    });
    console.log("GPT-4 response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error requesting GPT-4 analysis:", error);
    throw error;
  }
};

const DataAnalysisComponent = () => {
  useEffect(() => {
    // Step 1: 请求监控状态数据和Matomo API数据
    const fetchData = async () => {
      try {
        const uptimeStatuses = await fetchUptimeStatus(160);
        const [visitsSummaryData, liveCountersData] = await Promise.all([
          fetchVisitsSummary("day", "today"),
          fetchLiveCounters(160)
        ]);

        // Step 2: 分析数据，判断是否需要请求GPT-4分析
        const { needAnalysis, analysisReasons, days } = await decideIfNeedGPTAnalysis(uptimeStatuses, visitsSummaryData, liveCountersData);

        if (needAnalysis) {
          // Step 3: 请求GPT-4分析并输出响应到控制台
          // const gptResponse = await requestGPTAnalysis(analysisReasons, visitsSummaryData, liveCountersData);
          // 开发的时候这里要注释，不然一直花我钱
          // console.log("GPT-4 Analysis Response:", gptResponse);
        }
      } catch (error) {
        console.error("An error occurred during data fetching or analysis:", error);
      }
    };

    fetchData();
  }, []); // 这个effect没有依赖，所以它只会在组件加载时运行一次

  // 此组件不渲染任何UI，只用于执行数据请求和分析
  return null;
};

export default DataAnalysisComponent;
