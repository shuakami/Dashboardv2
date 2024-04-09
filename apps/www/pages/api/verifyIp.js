/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 提取JWT

  let username;
  let promptSystem;
  try {
    // 使用JWT获取用户信息
    const userResponse = await axios.get('https://xn--7ovw36h.love/api/users/me', {
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

  let ip;

  const createNewRecord = async (ipInfo, username, fingerprint, response) => {
    try {
      const newRecordResponse = await axios.post('https://xn--7ovw36h.love/api/accountips', {
        data: {
          ip: ipInfo.ip,
          fingerprint: fingerprint,
          date: new Date().toISOString(),
          user: username,
          ccid: uuidv4(),
          country: ipInfo.country,
          province: ipInfo.province,
          city: ipInfo.city,
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

  try {
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

    const ipInfoResponse = await axios.get(`https://ip.useragentinfo.com/jsonp?&ip=${ip}`);
    const match = ipInfoResponse.data.match(/callback\((.*)\);?/);
    if (!match || match.length < 2) throw new Error('无法解析IP信息');

    const ipInfo = JSON.parse(match[1]);
    if (ipInfo.code !== 200) throw new Error('IP信息查询失败');
    console.log(`解析到的IP信息: ${JSON.stringify(ipInfo)}`);

    const getLatestRecords = async (username) => {

      try {
        const response = await axios.get('https://xn--7ovw36h.love/api/accountips', {
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
          return response.data.data; // 返回获取到的数据
        } else {
          return []; // 如果没有数据或数据格式不符，返回空数组
        }
      } catch (error) {
        console.error('Error fetching latest records:', error);
        return [];
      }
    };


    const latestRecords = await getLatestRecords(username); // 获取最新的记录，可能是0, 1, 或2条


// 构建用户提示
    const promptUser = `请基于以下信息做出决策：\n
- 当前尝试信息：${JSON.stringify(ipInfo, null, 2)},浏览器指纹${fingerprint}
- 最近登录记录：${latestRecords.length > 0 ? JSON.stringify(latestRecords, null, 2) : '无历史记录，请直接给过，因为这是新用户'}\n
  请根据这些信息，判断此次登录是否安全，并简洁明了地给出判断和原因，格式为：“[允许/不允许登录]|[给用户看的原因]”。`;

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
      const response = await axios.post('https://api.openai-hk.com/v1/chat/completions', data, {
        headers: {
          'Authorization': 'Bearer hk-8d4a581000010138775b1a58955c02d8bf41e2fa3bab3291',
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



  } catch (error) {
    console.error('Error during IP and fingerprint processing:', error);
    res.status(500).json({message: 'Internal Server Error'});
  }
}


