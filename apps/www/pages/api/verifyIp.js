/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  console.log('收到的请求体:', req.body);

  const { username, fingerprint } = req.body;
  console.log(`收到的用户名(token): ${username}, 浏览器指纹: ${fingerprint}`);

  let ip = req.headers['x-forwarded-for']?.split(',').shift() || req.connection.remoteAddress;
  console.log(`解析到的用户IP地址: ${ip}`);

  try {
    if (ip === '::1' || ip === '127.0.0.1') {
      console.log('检测到本地回环地址, 使用外部API查询公网IP');
      const publicIpResponse = await axios.get('https://ip.useragentinfo.com/jsonp');
      const publicIpMatch = publicIpResponse.data.match(/callback\((.*)\);?/);
      if (publicIpMatch && publicIpMatch.length >= 2) {
        const publicIpInfo = JSON.parse(publicIpMatch[1]);
        if (publicIpInfo.code === 200 && publicIpInfo.ip) {
          ip = publicIpInfo.ip;
          console.log(`获取到的公网IP地址: ${ip}`);
        }
      }
    }

    const ipInfoResponse = await axios.get(`https://ip.useragentinfo.com/jsonp?&ip=${ip}`);
    const match = ipInfoResponse.data.match(/callback\((.*)\);?/);
    if (!match || match.length < 2) throw new Error('无法解析IP信息');

    const ipInfo = JSON.parse(match[1]);
    if (ipInfo.code !== 200) throw new Error('IP信息查询失败');
    console.log(`解析到的IP信息: ${JSON.stringify(ipInfo)}`);

    const response = await axios.get('https://xn--7ovw36h.love/api/accountips', {
      params: {
        filters: {
          user: username
        }
      }
    });

    if (response.data.data.length > 0) {
      // 检查是否存在与当前用户名、省份和国家都匹配的记录
      const isMatch = response.data.data.some(record =>
        record.attributes.user === username &&
        record.attributes.province === ipInfo.province &&
        record.attributes.country === ipInfo.country
      );

      if (isMatch) {
        console.log('匹配成功，不需要新建记录');
        res.status(200).json({ message: 'Match found, access granted' });
      } else {
        console.log('匹配失败，但不新建记录');
        res.status(403).json({ message: 'No match found, access denied' });
      }
    } else {
      console.log('没有找到历史记录，新建记录并通过');
      // 新建记录逻辑
      const newRecordResponse = await axios.post('https://xn--7ovw36h.love/api/accountips', {
        data: {
          ip: ip,
          fingerprint: fingerprint,
          date: new Date().toISOString(),
          user: username,
          ccid: uuidv4(),
          country: ipInfo.country,
          province: ipInfo.province,
        }
      });

      if (newRecordResponse.status === 200) {
        res.status(200).json({ message: 'New record created, access granted' });
      } else {
        throw new Error('Failed to create new record');
      }
    }
  } catch (error) {
    console.error('Error during IP and fingerprint processing:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
