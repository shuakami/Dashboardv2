/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import axios from 'axios';
import { setupAxiosInterceptors } from '@/app/setupAxiosInterceptors';

setupAxiosInterceptors();
const BASE_URL = 'https://xn--7ovw36h.love/api';

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
