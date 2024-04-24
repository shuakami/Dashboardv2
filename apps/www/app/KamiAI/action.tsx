/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import axios from 'axios';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

export const performAction = async (id: any, content: string) => {


  console.log(`[Action] - Received ID: ${id}, Content: ${content}`);

  if (content.startsWith('archive[')) {
    const days = parseInt(content.slice(8, -1));
    return await archiveEmails(days);
  } else if (content.startsWith('rearchive[')) {
    const days = parseInt(content.slice(10, -1));
    return await rearchiveEmails(days);
  } else if (content.startsWith('sendmail[')) {
    const [email, mailContent] = content.slice(9, -1).split('][');
    return await sendEmail(email, mailContent);
  } else if (content.startsWith('quick[')) {
    const days = parseInt(content.slice(6, -1));
    return await quickOrganizeEmails(days);
  } else {
    return `[Action] - 未知的指令: ${content}`;
  }
};


// 归档邮件函数
const archiveEmails = async (days: number) => {
  if (days > 60 || days < 1) {
    console.log(`[Action] - 无法归档 ${days} 天前的邮件,天数必须在1到60之间`);
    return `[Action] - 无法归档 ${days} 天前的邮件,天数必须在1到60之间`;
  }

  try {
    console.log(`[Action] - 开始获取邮件...`);
    const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mails`);
    const mails = response.data.data;
    console.log(`[Action] - 获取到 ${mails.length} 封邮件`);

    const filteredMails = mails.filter((mail: any) => {
      const createdAt = new Date(mail.attributes.createdAt);
      const daysAgo = (Date.now() - createdAt.getTime()) / (1000 * 3600 * 24);
      return daysAgo > days;
    });

    console.log(`[Action] - 筛选出 ${filteredMails.length} 封 ${days} 天前的邮件`);

    console.log(`[Action] - 开始归档邮件...`);
    for (const mail of filteredMails) {
      await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mails/${mail.id}`, {
        data: {
          archive: "true",
        },
      });
      console.log(`[Action] - 已归档邮件 ${mail.id}`);
    }

    console.log(`[Action] - 归档完成`);
    return `[Action] - 已归档 ${days} 天前的 ${filteredMails.length} 封邮件`;
  } catch (error) {
    console.error(`[Action] - 归档邮件时出错: ${error}`);
    return `[Action] - 归档邮件时出错`;
  }
};

// 取消归档邮件函数
const rearchiveEmails = async (days: number) => {
  try {
    console.log(`[Action] - 开始获取邮件...`);
    const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mails`);
    const mails = response.data.data;

    const filteredMails = mails.filter((mail: any) => {
      const createdAt = new Date(mail.attributes.createdAt);
      const daysAgo = (Date.now() - createdAt.getTime()) / (1000 * 3600 * 24);
      return daysAgo > days;
    });

    console.log(`[Action] - 筛选出 ${filteredMails.length} 封 ${days} 天前的邮件`);

    console.log(`[Action] - 开始取消归档邮件...`);
    for (const mail of filteredMails) {
      await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mails/${mail.id}`, {
        data: {
          archive: null,
        },
      });
      console.log(`[Action] - 已取消归档邮件 ${mail.id}`);
    }

    console.log(`[Action] - 取消归档完成`);
    return `[Action] - 已取消归档 ${days} 天前的 ${filteredMails.length} 封邮件`;
  } catch (error) {
    console.error(`[Action] - 取消归档邮件时出错: ${error}`);
    return `[Action] - 取消归档邮件时出错`;
  }
};



// 发送邮件函数
const sendEmail = async (email: string, content: string) => {
  try {
    const mailOptions = {
      text: content || "智能发送",
      name: "智能发送",
      subject: "智能发送",
      labels: "智能发送",
      email: email,
      username: "智能发送",
      ccId: uuidv4(),
      isFromAddSend: true,
      currentViewingMailTitle: null
    };

    const response = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mails`, {
      data: mailOptions
    });

    if (response.status === 200) {
      return `[Action] - 邮件发送成功`;
    } else {
      return `[Action] - 邮件发送失败`;
    }
  } catch (error) {
    console.error(`[Action] - 发送邮件时出错: ${error}`);
    return `[Action] - 发送邮件时出错`;
  }
};

// 快速整理邮件函数
const quickOrganizeEmails = async (days: number) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mails`);
    const mails = response.data.data;

    const filteredMails = mails.filter((mail: any) => {
      const updatedAt = new Date(mail.attributes.updatedAt);
      const daysAgo = (Date.now() - updatedAt.getTime()) / (1000 * 3600 * 24);
      return daysAgo <= days;
    });

    const mailTexts = filteredMails.map((mail: any) => mail.attributes.text);
    const limitedMailTexts = mailTexts.map((text: string) => text.slice(0, 20));

    return `[Action] - 已快速整理 ${days} 天内的邮件,邮件内容: ${limitedMailTexts.join('\n')}`;
  } catch (error) {
    console.error(`[Action] - 快速整理邮件时出错: ${error}`);
    return `[Action] - 快速整理邮件时出错`;
  }
};
