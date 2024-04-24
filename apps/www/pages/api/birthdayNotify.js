/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

// pages/api/birthdayNotify.js
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { isToday, parseISO, startOfDay, endOfDay } from 'date-fns';

// 存储结构，用于跟踪是否已经为某个ID发送了生日邮件
let todaysBirthdays = {};

// 用于跟踪当前日期，以便我们知道何时重置todaysBirthdays
let currentDay = new Date().getDate();

// 从Strapi后端获取特定用户的数据
async function fetchUser(userId) {
  try {
    const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${userId}`;
    console.log('请求的URL:', url);
    const response = await axios.get(url);
    console.log('API返回的用户数据:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取用户数据失败:', error);
    return null;
  }
}

async function checkAndNotifyBirthday(userId) {
  const user = await fetchUser(userId);
  if (user && user.birthtime) {
    const birthtimeUTC = parseISO(user.birthtime);
    if (isToday(birthtimeUTC)) {
      console.log('今天是该用户的生日:', user.id);
      const notificationData = {
        id: user.id,
        username: user.username,
        birthtime: user.birthtime
      };
      await sendBirthdayNotification(notificationData);
    }
  }
}

async function sendBirthdayNotification(data) {
  const { id, username, birthtime } = data;

  // 检查是否已经为这个ID发送了邮件
  if (!todaysBirthdays[id]?.emailSent) {
    // 更新存储结构，标记为已发送
    todaysBirthdays[id] = { username, birthtime, emailSent: true };

    // 准备邮件内容
    const name = 'Happy Birthday!';
    const emailAddress = 'admin@sdjz.wiki';
    const subject = `${username}生日快乐！🎉`;
    const text = `生日快乐${username}！今天是你的生日，Bytefreeze为你送上最美好的祝福！`;
    const labels = "生日快乐, 系统邮件";

    const postData = {
      data: {
        name,
        subject,
        text,
        date: new Date().toISOString(),
        labels,
        email: emailAddress,
        ccid: uuidv4(),
      }
    };

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mails`, postData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });


      console.log("邮件发送成功", response.data);
    } catch (error) {
      console.error("邮件发送失败", error);
      // 如果邮件发送失败，重置emailSent状态，以便可以重试
      todaysBirthdays[id].emailSent = false;
    }
  }
}

export default async function handler(req, res) {
  // 检查是否需要重置todaysBirthdays（即，如果当前日期不是存储的日期）
  const today = new Date().getDate();
  if (currentDay !== today) {
    todaysBirthdays = {}; // 重置存储结构
    currentDay = today; // 更新当前日期
  }

  if (req.method === 'GET') {
    const userId = req.query.userId;
    if (userId) {
      await checkAndNotifyBirthday(userId);
      const isBirthday = todaysBirthdays.hasOwnProperty(userId) && todaysBirthdays[userId].emailSent;
      res.status(200).json({ isBirthday });
    } else {
      res.status(400).json({ message: 'userId is required' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
