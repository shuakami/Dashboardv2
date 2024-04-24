/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import axios from 'axios';
import React from 'react';
import { setupAxiosInterceptors } from '@/app/setupAxiosInterceptors';

setupAxiosInterceptors();

// Define types for the fetched data
export type Mail = {
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  date: string;
  read: boolean;
  labels: string[];
  CCID: string;
  archive?: boolean;
};

export type Account = {
  label: string;
  email: string;
  icon: JSX.Element;
};

export type Contact = {
  name: string;
  email: string;
};

// Update:分页数据获取
export async function fetchMails(): Promise<Mail[]> {
  let allMails: Mail[] = [];
  let page = 1;
  const pageSize = 25;
  let pageCount = 1;

  while (page <= pageCount) {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mails`, {
      params: {
        pagination: { page, pageSize },
      },
    });

    const fetchedMails = response.data.data.map((mail: any) => ({
      id: mail.id,
      name: mail.attributes.name,
      email: mail.attributes.email,
      subject: mail.attributes.subject,
      text: mail.attributes.text,
      date: mail.attributes.date,
      read: mail.attributes.read,
      labels: mail.attributes.labels.split(','),
      archive: mail.attributes.archive === "true",
    }));

    allMails = allMails.concat(fetchedMails);

    // 更新页码和总页数
    pageCount = response.data.meta.pagination.pageCount;
    page += 1;
  }

  return allMails;
}

export async function fetchAccounts(): Promise<Account[]> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/accounts`);
  return response.data.data.map((account: any) => ({
    label: account.attributes.label,
    email: account.attributes.email,
    icon: account.attributes.icon,
  }));
}


export async function fetchContacts(): Promise<Contact[]> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/contacts`);
  return response.data.data.map((contact: any) => ({
    name: contact.attributes.name,
    email: contact.attributes.email,
  }));
}
