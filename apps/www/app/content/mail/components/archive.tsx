/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import axios from 'axios';
import { setupAxiosInterceptors } from '@/app/setupAxiosInterceptors';

setupAxiosInterceptors();
const BASE_URL = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api`;

// 更新archiveMail函数以接受一个额外的参数，用于指明是要归档还是取消归档
export async function archiveMail(id: string, archive: boolean, callback: (success: boolean) => void): Promise<void> {
  const url = `${BASE_URL}/mails/${id}`;
  const data = {
    data: {
      // 根据archive参数决定设置为"true"还是null
      archive: archive ? "true" : null,
    },
  };

  console.log(archive ? "尝试归档邮件" : "尝试取消归档邮件", "请求URL:", url);
  console.log("请求体:", JSON.stringify(data, null, 2));

  try {
    const response = await axios.put(url, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    callback(true); // 调用回调函数并传递成功标志
    console.log(archive ? "归档成功" : "取消归档成功", response.data);
  } catch (error) {
    callback(false); // 调用回调函数并传递失败标志
    console.error(archive ? "归档失败" : "取消归档失败:", error);
  }
}
