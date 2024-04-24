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

export async function deleteMail(id: string, callback: (success: boolean, data?: any) => void): Promise<void> {
  const url = `${BASE_URL}/mails/${id}`;

  try {
    const response = await axios.delete(url);
    console.log("邮件删除成功", response.data);
    callback(true, response.data); // 将成功标志和返回的数据传给回调函数
  } catch (error) {
    console.error("邮件删除失败:", error);
    callback(false); // 只传递失败标志
  }
}
