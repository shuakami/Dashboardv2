/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

// aiapi.tsx
"use client"
import axios from 'axios';
import { useEffect, useState } from 'react';
// @ts-ignore
import Cookies from "js-cookie";



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
  let days = 160;

  // 检查是否有站点下线且下线持续时间为0
  const downServicesWithZeroDowntime = adjustedStatuses.filter(service => service.status === 'down' && service.dailyDown.some(d => d.duration === 0));

  if (downServicesWithZeroDowntime.length > 0) {
    // 如果有站点下线但持续时间为0，则请求160天的数据
    days = 160;
    adjustedStatuses = await fetchUptimeStatus(days); // 重新获取160天的数据
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

      const cookieKey = `${status.name}_downtime_reminder`;
      const lastReminder = Cookies.get(cookieKey);

      if (!lastReminder || (Date.now() - parseInt(lastReminder)) > 3 * 24 * 60 * 60 * 1000) {
        analysisReasons.push(`站点 "${status.name}" 当前状态为下线。平均在线时间：${status.averageUptime}%，最后一次上线日期为 ${lastUptimeDate}，距今已 ${daysSinceLastUptime} 天。最近一次下线发生在 ${lastDowntimeDate}，从最后一次下线到现在已经过去了 ${daysSinceLastDowntime} 天。`);
        needAnalysis = true;
        Cookies.set(cookieKey, Date.now(), { expires: 3 }); // 设置 cookie 过期时间为 3 天
      }
    } else {
      const cookieKey = `${status.name}_downtime_reminder`;
      const lastReminder = Cookies.get(cookieKey);

      if (lastReminder) {
        // 如果有之前匹配的 cookie，表示该站点之前出现过故障
        // 现在站点恢复正常，需要更新 ailogs 的 solved 字段为 true
        axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/ailogs`, {
          siteName: status.name,
          solved: true
        })
          .then(response => {
            console.log(`站点 ${status.name} 恢复正常，已更新 ailogs 的 solved 字段为 true`);
            Cookies.remove(cookieKey); // 删除对应的 cookie
          })
          .catch(error => {
            console.error(`更新站点 ${status.name} 的 ailogs 状态失败:`, error);
          });
      }
    }
  });

  // 检测访问量是否异常减少
  const currentHour = new Date().getHours();
  if (currentHour >= 12 && parseInt(visitsSummary.nb_visits) < 5) { // 日访问量少于5为异常，且只在中午12点后检测
    const cookieKey = 'low_visits_reminder';
    const lastReminder = Cookies.get(cookieKey);

    if (!lastReminder || (Date.now() - parseInt(lastReminder)) > 3 * 24 * 60 * 60 * 1000) {
      needAnalysis = true;
      analysisReasons.push('网站访问量异常减少。');
      Cookies.set(cookieKey, Date.now(), { expires: 3 }); // 设置 cookie 过期时间为 3 天
    }
  }

  // 检测实时数据中活动数量是否异常
  if (liveCounters.actions > 500) {
    const cookieKey = 'high_actions_reminder';
    const lastReminder = Cookies.get(cookieKey);

    if (!lastReminder || (Date.now() - parseInt(lastReminder)) > 3 * 24 * 60 * 60 * 1000) {
      needAnalysis = true;
      analysisReasons.push('最近一小时活动数量异常增多。');
      Cookies.set(cookieKey, Date.now(), { expires: 3 }); // 设置 cookie 过期时间为 3 天
    }
  }

  return { needAnalysis, analysisReasons, days };
};


// GPT-4 API请求函数
const requestGPTAnalysis = async (analysisReasons: string[], visitsSummary: any, liveCounters: any) => {
  // 构建系统提示和用户提示
  const promptSystem = `你是智能运维面板助手。请根据以下数据，给用户发送消息通知。`;
  const promptUser = `异常情况：${analysisReasons.join('; ')}. 网站访问摘要数据显示，日访问量为${visitsSummary.nb_visits}，最近一小时活动数量为${liveCounters.actions}.`;

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
    const response = await axios.post(`${process.env.NEXT_PUBLIC_OPENAI_URL}/v1/chat/completions`, data, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
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

interface DataAnalysisComponentProps {
  onAnalysisComplete: (data: any) => void;
}

const DataAnalysisComponent: React.FC<DataAnalysisComponentProps> = ({ onAnalysisComplete }) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const uptimeStatuses = await fetchUptimeStatus(160);
        const [visitsSummaryData, liveCountersData] = await Promise.all([
          fetchVisitsSummary("day", "today"),
          fetchLiveCounters(160)
        ]);

        const { needAnalysis, analysisReasons, days } = await decideIfNeedGPTAnalysis(uptimeStatuses, visitsSummaryData, liveCountersData);

        if (needAnalysis) {
          const gptResponse = await requestGPTAnalysis(analysisReasons, visitsSummaryData, liveCountersData);
          console.log("GPT-4 Analysis Response:", gptResponse);

          const analysisReasonsString = analysisReasons.join('; ');
          console.log("Combined analysis reasons string:", analysisReasonsString);

          const regex = /站点 "(.+?)" 当前状态为下线。平均在线时间：(\d+)%，最后一次上线日期为 (N\/A|.+?)，距今已 (N\/A|\d+) 天。最近一次下线发生在 (.+?)，从最后一次下线到现在已经过去了 (\d+) 天。/g;

          const matches = Array.from(analysisReasonsString.matchAll(regex));
          console.log("Regex matches:", matches);


            const match = matches[0];

          // 构建postData对象，当无法匹配时提供默认值
          const postData = {
            data: {
              gptResponse: JSON.stringify(gptResponse || {}),
              siteName: match ? match[1] : "未知站点",
              visitsSummary: (visitsSummaryData.nb_visits || 0).toString(), // 转换为字符串
              liveCounters: (liveCountersData.actions || 0).toString(), // 转换为字符串
              averageUptime: match ? match[2] : "0",
              lastUptimeDate: match ? match[3] : "N/A",
              daysSinceLastUptime: match ? match[4] : "N/A",
              lastDowntimeDate: match ? match[5] : "N/A",
              daysSinceLastDowntime: match ? match[6] : "N/A",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              solved: false.toString(), // 布尔值转换为字符串
            },
          };


          await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/ailogs`, postData, {
            headers: {
              'Content-Type': 'application/json',
            },
          }).then(response => {
            console.log("Data posted successfully:", response.data);
          }).catch(error => {
            console.error("Error posting data:", error);
          });

        } else {
          console.log("No need for GPT-4 analysis.");
        }
      } catch (error) {
        console.error("An error occurred during data fetching or analysis:", error);
      }
    };

    fetchData();
  }, []);

  return null;
};

export default DataAnalysisComponent;
