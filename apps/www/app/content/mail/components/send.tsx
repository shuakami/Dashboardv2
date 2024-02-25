/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import axios from 'axios';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

// MailOptions 接口定义
interface MailOptions {
  text: string;
  emailAddress: string;
  ccId?: string;
  isReplyFromHomepage?: boolean;
  currentViewingMailTitle?: string;
}


async function generateLabels(text: string): Promise<string> {
  const url = 'https://api.openai-hk.com/v1/chat/completions';
  const headers = {
    'Authorization': 'Bearer hk-8d4a581000010138775b1a58955c02d8bf41e2fa3bab3291',
    'Content-Type': 'application/json'
  };

  const data = {
    max_tokens: 60,
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    top_p: 1,
    presence_penalty: 0,
    messages: [
      {
        role: 'system',
        content: '根据下面的内容，生成3到4个适合的标签（labels），标签之间用逗号分隔。标签应具体、相关，并且紧凑。只输出标签，不包含其他文字。'
      },
      {
        role: 'user',
        content: text
      }
    ]
  };

  try {
    const response = await axios.post(url, data, { headers });
    const labels = response.data.choices[0].message.content; // 假设API响应的格式正确
    return labels;
  } catch (error) {
    console.error("生成标签时发生错误:", error);
    return ''; // 出错时返回空字符串
  }
}

async function sendMail(options: MailOptions, callback: (success: boolean) => void): Promise<void> {
  const { text, emailAddress, ccId = uuidv4(), isReplyFromHomepage, currentViewingMailTitle } = options;
  let subject = "群发：欸嘿！"; // 默认主题

  // 如果在首页进行回复，并且有当前查看的邮件标题，则设置回复主题
  if (isReplyFromHomepage && currentViewingMailTitle) {
    subject = `回复：${currentViewingMailTitle}`;
  }

  const labels = await generateLabels(text); // 生成labels

  const postData = {
    data: {
      name: "Shuakami",
      subject,
      text,
      date: new Date().toISOString(),
      labels,
      email: emailAddress,
      CCID: uuidv4(),
    }
  };

  // console.log("发送的邮件数据:", JSON.stringify(postData, null, 2));

  try {
    const response = await axios.post('https://xn--7ovw36h.love/api/mails', postData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

   // console.log("邮件发送成功", response.data);
    callback(true); // 调用回调函数，表示成功
  } catch (error) {
    // @ts-ignore
    console.error("发送邮件时发生错误:", error.response ? error.response.data : error.message);
    callback(false); // 调用回调函数，表示失败
  }
}

export default sendMail;
