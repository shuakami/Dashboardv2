/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

// pages/api/getrecord.js

import axios from 'axios';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;

  try {
    // 使用JWT获取用户信息
    const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: authHeader,
      },
    });

    const username = userResponse.data.username;

    // 使用username获取accountips记录
    const recordsResponse = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/accountips`, {
      params: {
        filters: {
          user: { $eq: username },
        },
        sort: 'date:desc',
        pagination: {
          pageSize: 30,
        },
      },
    });

    // 数据格式转换
    const records = recordsResponse.data.data.map(record => {
      const ipParts = record.attributes.ip.split('.');
      const hiddenIp = `${ipParts[0]}.${ipParts[1]}.xxx.xxx`;


      if (record.attributes.fingerprint === "登录邮箱验证成功") {
        return {
          ...record,
          attributes: {
            ...record.attributes,
            ip: hiddenIp,
          },
        };
      } else {
        const fingerprintLength = record.attributes.fingerprint.length;
        const hiddenFingerprint = `${record.attributes.fingerprint.substring(0, fingerprintLength - 4)}xxxx`;
        return {
          ...record,
          attributes: {
            ...record.attributes,
            ip: hiddenIp,
            fingerprint: hiddenFingerprint,
          },
        };
      }
    });

    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
