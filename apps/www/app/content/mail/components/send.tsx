/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import axios from 'axios';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { setupAxiosInterceptors } from '@/app/setupAxiosInterceptors';

setupAxiosInterceptors();
// MailOptions 接口定义
interface MailOptions {
  text: string;
  emailAddress: string;
  ccId?: string;
  isReplyFromHomepage?: boolean;
  currentViewingMailTitle?: string;
  isFromAddSend?: boolean; // 新增属性
  username?: string;
}



async function generateLabels(text: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_OPENAI_URL}/v1/chat/completions`;
  const headers = {
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
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
    const labels = response.data.choices[0].message.content;
    return labels;
  } catch (error) {
    console.error("生成标签时发生错误:", error);
    return ''; // 出错时返回空字符串
  }
}

async function sendMail(options: MailOptions, callback: (success: boolean) => void): Promise<void> {
  const { text, emailAddress, ccId = uuidv4(), isFromAddSend, currentViewingMailTitle, username } = options;  let subject = isFromAddSend ? currentViewingMailTitle : "群发：欸嘿！"; // 根据isFromAddSend使用适当的主题

  const labels = await generateLabels(text); // 生成labels
  let name = isFromAddSend && username ? username : "Shuakami"; // 如果来自AddSend且提供了username，则使用它

  // 如果标记了来自AddSend的请求，则邮件的name和subject应该根据AddSend的数据设置
  const postData = {
    data: {
      name,
      subject, // 直接使用传入的subject，避免"回复："前缀
      text,
      date: new Date().toISOString(),
      labels,
      email: emailAddress, // 使用固定的邮箱地址
      CCID: ccId,
    }
  };

  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mails`, postData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log("邮件发送成功", response.data);
    callback(true); // 调用回调函数，表示成功
  } catch (error) {
    // @ts-ignore
    console.error("发送邮件时发生错误:", error.response ? error.response.data : error.message);
    callback(false); // 调用回调函数，表示失败
  }
}

export default sendMail;
