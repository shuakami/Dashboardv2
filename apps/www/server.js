/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

const { createServer } = require('http');
const next = require('next');
const cron = require('node-cron');
const axios = require('axios');
const { zonedTimeToUtc, utcToZonedTime, format } = require('date-fns-tz');
const { isToday, parseISO, startOfDay, endOfDay } = require('date-fns');

const port = parseInt(process.env.PORT, 10) || 3001;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// 从Strapi后端获取今天生日的用户数据
async function fetchUsers() {
  try {
    const today = new Date(); // 获取今天的日期
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users?filters[birthtime][$gte]=${startOfDay}&filters[birthtime][$lte]=${endOfDay}`;
    console.log('请求的URL:', url);  // 确认构造的URL是否正确
    const response = await axios.get(url);
    console.log('API返回的今日生日用户数据:', response.data); // 确认API返回的数据结构
    return response.data || []; // 确保这里是正确的路径访问用户数据
  } catch (error) {
    console.error('获取用户数据失败:', error);
    return [];
  }
}


async function checkAndNotifyBirthdays() {
  const users = await fetchUsers();
  console.log('用户总数:', users.length);
  users.forEach(user => {
    console.log('检查用户:', user.id, '原生日:', user.birthtime);
    if (user.birthtime) {
      const birthtimeUTC = parseISO(user.birthtime);  // 直接解析UTC时间
      const now = new Date();
      const startOfToday = startOfDay(now);
      const endOfToday = endOfDay(now);

      // 检查生日时间是否在今天的开始和结束之间
      if (birthtimeUTC >= startOfToday && birthtimeUTC <= endOfToday) {
        console.log('今天这些用户生日:', user.id);
        const notificationData = {
          id: user.id,
          username: user.username,
          birthtime: user.birthtime  // 使用原始时间
        };
        axios.post('http://localhost:3001/api/birthdayNotify', notificationData)
          .then(response => console.log(`生日通知发送成功: ${user.id}`, response.data))
          .catch(error => console.error('发送生日通知失败:', error));
      }
    }
  });
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);

    // 在服务器启动时立即执行一次
    checkAndNotifyBirthdays();

    // 修改Cron表达式为每小时执行一次
    cron.schedule('0 * * * *', () => {
      console.log('正在执行每小时的生日检查...');
      checkAndNotifyBirthdays();
    });
  });
});
