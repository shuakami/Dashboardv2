/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {




  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只支持POST请求' });
  }

  const { jwt, code } = req.body;
  if (!jwt || !code) {
    console.error('请求缺少JWT或验证码');
    return res.status(400).json({ message: '缺少必要信息' });
  }

  console.log('接收到的验证码:', code);

  try {
    const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const email = userResponse.data.email;
    console.log('从Strapi获取到的电子邮件地址:', email);

    if (!email) {
      return res.status(404).json({ message: '未找到电子邮件地址' });
    }

    // 首先，删除该用户的所有旧验证码记录
    const fetchResponse = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/verification-codes?filters[email][$eq]=${email}`, {
      headers: {
        Authorization: `Bearer 8f03f4460f706f1a80aee772b6ee7b9cd91ff1d6fa9b5de04bf316959c7f94ef6f608321a022e544a6aa0693e367f98204055bd327a4c1a2159cc5d90365705c1ea4e42c3af8a05b562f181b1be59f4937f3853e72d36d080202b63ede09bf09a8db2ba01c0af5148dbf94068532f5c2c6567cc23ec4f97a32b78712d67d8086`,
      },
    });

    const verificationRecords = fetchResponse.data.data;

    const fiveMinutesAgo = new Date(new Date().getTime() - 5 * 60000).toISOString();

    const oldVerificationRecords = verificationRecords.filter(record => {
      return new Date(record.attributes.createdAt) < new Date(fiveMinutesAgo);
    });

    // 遍历并删除每条记录
    for (const record of oldVerificationRecords) {
      await axios.delete(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/verification-codes/${record.id}`, {
        headers: {
          Authorization: `Bearer 8f03f4460f706f1a80aee772b6ee7b9cd91ff1d6fa9b5de04bf316959c7f94ef6f608321a022e544a6aa0693e367f98204055bd327a4c1a2159cc5d90365705c1ea4e42c3af8a05b562f181b1be59f4937f3853e72d36d080202b63ede09bf09a8db2ba01c0af5148dbf94068532f5c2c6567cc23ec4f97a32b78712d67d8086`,
        },
      });
    }

    const verificationResponse = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/verification-codes`, {
      params: {
        filters: {
          email: {
            $eq: email
          },
          createdAt: {
            $gte: new Date(new Date().getTime() - 5 * 60 * 1000).toISOString() // 获取最近5分钟内的验证码
          }
        },
        sort: 'createdAt:desc',
        pagination: {
          page: 1,
          pageSize: 100 // 5分钟内不会有超过100个验证码
        }
      },
      headers: {
        Authorization: `Bearer 8f03f4460f706f1a80aee772b6ee7b9cd91ff1d6fa9b5de04bf316959c7f94ef6f608321a022e544a6aa0693e367f98204055bd327a4c1a2159cc5d90365705c1ea4e42c3af8a05b562f181b1be59f4937f3853e72d36d080202b63ede09bf09a8db2ba01c0af5148dbf94068532f5c2c6567cc23ec4f97a32b78712d67d8086`,
      },
    });

    console.log('完整的记录数据:', verificationResponse.data.data);

    if (verificationResponse.data.data && verificationResponse.data.data.length > 0) {
      // 手动排序
      const sortedRecords = verificationResponse.data.data
        .sort((a, b) => new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt));

      // 取最新的一个记录
      const latestRecord = sortedRecords[0];

      if (latestRecord.attributes.code === code) {
        const attributes = latestRecord.attributes;
        console.log('找到的验证码记录:', attributes);

      const now = new Date();
      const expiresAt = new Date(attributes.expires_at);
      console.log(`当前时间: ${now}, 验证码过期时间: ${expiresAt}`);

      const deleteVerificationCode = async (id) => {
        console.log(`正在删除验证码记录: ${id}`);
        await axios.delete(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/verification-codes/${id}`, {
          headers: {
            Authorization: `Bearer 8f03f4460f706f1a80aee772b6ee7b9cd91ff1d6fa9b5de04bf316959c7f94ef6f608321a022e544a6aa0693e367f98204055bd327a4c1a2159cc5d90365705c1ea4e42c3af8a05b562f181b1be59f4937f3853e72d36d080202b63ede09bf09a8db2ba01c0af5148dbf94068532f5c2c6567cc23ec4f97a32b78712d67d8086`,
          },
        });
      };

      // 确保这里使用record.id
      if (now < expiresAt) {
        await deleteVerificationCode(latestRecord.id);// 正确使用顶层id进行删除

        try {
          const authHeader = req.headers['authorization'];
          const token = authHeader && authHeader.split(' ')[1]; // 提取JWT

          let username;
          let ip;
          try {
            // 使用JWT获取用户信息
            const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
              headers: {
                'Authorization': `Bearer ${jwt}`
              }
            });
            username = userResponse.data.username;


            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            if (ip.substr(0, 7) === "::ffff:") {
              ip = ip.substr(7);
            }
            if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip === "127.0.0.1" ||
              ip.startsWith("172.16.") || ip.startsWith("172.31.") || ip === "::1" || ip.startsWith("fc00:") || ip.startsWith("fd00:")) {
              ip = "1.1.1.1";  // 使用 Cloudflare 的公开 DNS 服务器 IP 作为示例
            }

            // 获取IP信息
            const ipInfoResponse = await axios.get(`https://opendata.baidu.com/api.php?query=${ip}&co=&resource_id=6006&oe=utf8`);

            const ipInfo = ipInfoResponse.data.data[0];
            console.log(`解析到的IP信息: ${JSON.stringify(ipInfoResponse.data)}`);
            if (ipInfoResponse.data.status !== '0') {
              console.error('IP信息查询失败', ipInfoResponse.data);
              throw new Error('IP信息查询失败');
            }
            ip = ipInfo.origip;

            // 创建新记录
            const newRecordResponse = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/accountips`, {
              data: {
                ip: ip,
                fingerprint: '登录邮箱验证成功,无浏览器指纹',
                date: new Date().toISOString(),
                user: username,
                ccid: uuidv4(),
                country: ipInfo.country,
                province: ipInfo.province,
                city: ipInfo.location,
                response: '登录邮箱验证成功'
              }
            });

            if (newRecordResponse.status === 200) {
              console.log('新建记录成功');
            } else {
              throw new Error('Failed to create new record');
            }
          } catch (error) {
            console.error('JWT verification, user fetching, or IP fetching error:', error);
            return res.status(500).json({message: 'Error verifying token, fetching user, or fetching IP'});
          }

          res.status(200).json({message: '验证码验证成功'});
        } catch (error) {
          console.error('处理验证码验证时发生错误:', error);
          res.status(500).json({message: '处理验证码验证时发生错误'})
        }
      }


      } else {
        res.status(400).json({ message: '验证码已过期' });
      }
    } else {
      console.error('未找到匹配的验证码记录');
      res.status(400).json({ message: '验证码不匹配' });
    }
  } catch (error) {
    console.error('处理验证码验证时发生错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}
