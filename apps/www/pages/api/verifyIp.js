/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  // 获取用户的真实 IP 地址
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip.substr(0, 7) === "::ffff:") {
    ip = ip.substr(7);
  }
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip === "127.0.0.1" ||
    ip.startsWith("172.16.") || ip.startsWith("172.31.") || ip === "::1" || ip.startsWith("fc00:") || ip.startsWith("fd00:")) {
    ip = "1.1.1.1";  // 使用 Cloudflare 的公开 DNS 服务器 IP 作为示例
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 提取JWT

  let username;
  let promptSystem;
  try {
    // 使用JWT获取用户信息
    const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    username = userResponse.data.username;
    const securityPolicy = userResponse.data.securitypolicy;

    if (securityPolicy === "none") {
      return res.status(200).json({ message: "Access granted due to 'none' security policy." });
    }


    // 根据用户的securityPolicy来定制系统提示
    // V3_1014 Prompt System
    switch (securityPolicy) {
      case 'low':
        promptSystem = `作为高级的人工智能安全系统，你的任务是根据低安全度策略来判断是否允许用户登录。低安全度非常宽松，基本上允许所有登录尝试，除非存在极其异常的情况。`;
        break;
      case 'medium':
        promptSystem = `作为高级的人工智能安全系统，你的任务是根据中等安全度策略来判断是否允许用户登录。中等安全度要求警惕地理位置的异常变化，但相对宽松，允许一定范围的地理位置和设备变化。`;
        break;
      case 'high':
        promptSystem = `作为高级的人工智能安全系统，你的任务是根据高安全度策略来判断是否允许用户登录。高安全度较为严格，对登录尝试的地理位置、设备和其他因素进行详细审查，以确保账户安全。`;
        break;
      case 'neurotic':
        promptSystem = `作为高级的人工智能安全系统，你的任务是根据国家级高安全度策略来判断是否允许用户登录。国家级高安全度是最严格的模式，对任何微小的异常都不放过，确保最高级别的账户保护。`;
        break;
      default:
        promptSystem = `作为高级的人工智能安全系统，你的任务是根据默认的安全策略来判断是否允许用户登录。默认安全策略通常非常宽松，兼顾安全性和用户便利性。`;
        break;
    }


  } catch (error) {
    console.error('JWT verification or user fetching error:', error);
    return res.status(500).json({message: 'Error verifying token or fetching user'});
  }




  console.log('收到的请求体:', req.body);

  const {fingerprint} = req.body;
  console.log(`收到的用户名(token): ${username}, 浏览器指纹: ${fingerprint}`);



  const createNewRecord = async (ipInfo, username, fingerprint, response) => {
    try {
      const newRecordResponse = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/accountips`, {
        data: {
          ip: ipInfo.origip,
          fingerprint: fingerprint,
          date: new Date().toISOString(),
          user: username,
          ccid: uuidv4(),
          country: ipInfo.country,
          province: ipInfo.province,
          city: ipInfo.location,
          response: response
        }
      });

      if (newRecordResponse.status === 200) {
        console.log('新建记录成功');
      } else {
        throw new Error('Failed to create new record');
      }
    } catch (error) {
      console.error('Error creating new record:', error);
    }
  };



  const ipInfoResponse = await axios.get(`https://opendata.baidu.com/api.php?query=${ip}&co=&resource_id=6006&oe=utf8`);

  const ipInfo = ipInfoResponse.data.data[0];
  console.log(`解析到的IP信息: ${JSON.stringify(ipInfoResponse.data)}`);
  if (ipInfoResponse.data.status !== '0') {
    console.error('IP信息查询失败', ipInfoResponse.data);
    throw new Error('IP信息查询失败');
  }


    const getLatestRecords = async (username) => {

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/accountips`, {
          params: {
            filters: {
              user: {$eq: username} // 根据Strapi的过滤语法
            },
            sort: 'date:desc', // 按日期降序排序
            pagination: {
              pageSize: 2 // 获取最多两条记录
            }
          }
        });

        // 确保我们正确地处理了响应数据
        if (response.data && response.data.data) {
          return response.data.data.map(item => item.attributes);  // 返回获取到的数据
        } else {
          return []; // 如果没有数据或数据格式不符，返回空数组
        }
      } catch (error) {
        console.error('Error fetching latest records:', error);
        return [];
      }
    };


    const latestRecords = await getLatestRecords(username); // 获取最新的记录，可能是0, 1, 或2条

    const latestRecordsStr = latestRecords.map(record => {
    return `ip: ${record.ip}, date: ${record.date}, fingerprint: ${record.fingerprint || '无'}, province: ${record.province || '无'}, response: ${record.response}, city: ${record.city || '无'}`;
  }).join(", ");  // 将多条记录以逗号分隔

    const ipInfoStr = `location: ${ipInfo.location}, origip: ${ipInfo.origip}, origipquery: ${ipInfo.origipquery}`;

// 构建用户提示
  const promptUser = `请基于以下信息做出决策：` +
    `- 当前尝试信息：${ipInfoStr}, 浏览器指纹：${fingerprint}。` +
    `- 最近登录记录：${latestRecords.length > 0 ? latestRecordsStr : '无历史记录，请直接给过，因为这是新用户'}。` +
    `- 请根据这些信息，判断此次登录是否安全，并简洁明了地给出判断和原因，格式为：“[允许/不允许登录]|[给用户看的原因]”。`;

    const data = {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 624,
      top_p: 1,
      messages: [
        {
          role: 'system',
          content: promptSystem
        },
        {
          role: 'user',
          content: promptUser
        }
      ]
    };

    let aiResponse;
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_OPENAI_URL}/v1/chat/completions`, data, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
          'Content-Type': 'application/json'
        },
      });
      console.log("SEND：", data);
      // 直接对外部声明的aiResponse变量赋值
      aiResponse = response.data.choices[0].message.content;
      console.log("Response:", aiResponse);
    } catch (error) {
      console.error('Error sending request to AI:', error);
      return res.status(500).json({message: 'Error sending request to AI'});
    }

    if (aiResponse) {
      try {
        const [permission, reason] = aiResponse.split('|');
        if (permission.trim() === "[允许登录]") {
          await createNewRecord(ipInfo, username, fingerprint, `${aiResponse} `);
          res.status(200).json({status: "Access granted", reason: reason ? reason.trim() : "No specific reason provided."});
        } else {
          console.log("Permission: ", permission); // 显示解析出的权限字段
          res.status(403).json({status: "Access denied", reason: reason ? reason.trim() : "No specific reason provided."});
        }
      } catch (error) {
        console.error('Error during IP and fingerprint processing or AI decision:', error);
        res.status(500).json({message: 'Internal Server Error'});
      }
    } else {
      console.error('AI response is undefined');
      res.status(500).json({message: 'AI processing error'});
    }




}


