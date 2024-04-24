/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

// pages/api/verifyv3.js
import axios from 'axios';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只支持POST请求' });
  }

  const { jwt } = req.body;
  if (!jwt) {
    return res.status(400).json({ message: '缺少JWT' });
  }

  try {
    // 使用JWT从Strapi获取用户信息
    const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const email = response.data.email;
    if (!email) {
      return res.status(404).json({ message: '未找到电子邮件地址' });
    }

    // 生成6位数验证码
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 设置SMTP服务
    const transporter = nodemailer.createTransport({
      host: 'smtp.exmail.qq.com',
      port: 465,
      secure: true, // 使用SSL
      auth: {
        user: 'admin@sdjz.wiki',
        pass: '2C9tW7A773nWvzwM',
      },
      authMethod: 'LOGIN' // 使用LOGIN认证方法
    });

    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const deviceInfo = getDeviceInfo(req);
    const obfuscatedIP = obfuscateIP(ipAddress);

    function obfuscateIP(ip) {
      return ip.replace(/\.\d+$/, '.***');
    }

// 获取设备信息，这可能需要您根据项目的具体情况来实现
    function getDeviceInfo(req) {
      // 这里只是一个示例函数，您需要根据自己的需求实现真正的设备信息获取逻辑
      return req.headers['user-agent']; // 这通常包含了设备信息
    }


    // 发送验证码邮件
    await transporter.sendMail({
      from: '"ByteFreeze" <admin@sdjz.wiki>', // 发件人地址
      to: email, // 收件人地址，从Strapi获取
      subject: 'ByteFreeze_Dashboard 登录验证', // 主题
      text: `您的验证码是：${verificationCode}`, // 纯文本正文
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ByteFreeze_Dashboard 登录验证</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #333;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: left;
        }
        .content {
            max-width: 480px;
            width: 100%;
        }
        h1, h2 {
            font-weight: normal;
            color: #000;
            margin: 0.5em 0;
        }
        h1 {
            font-size: 22px;
            margin-top: 0;
        }
        h2 {
            font-size: 16px;
            margin-bottom: 2em;
        }
        .verification-code {
            font-size: 24px;
            letter-spacing: 8px;
            color: #007aff;
            padding: 0.5em 0em;
            border-bottom: 2px solid #ddd;
            display: inline-block;
            margin-bottom: 2em;
        }
        .footer {
            font-size: 14px;
            color: #999;
            margin-top: 2em;
        }
    </style>
</head>
<body>
    <div class="content">
        <h1>您的验证码</h1>
        <h2>请在网页中输入以下验证码以继续操作</h2>
        <div class="verification-code">${verificationCode}</div>
        <div class="footer" style="font-size: 12px; line-height: 1.4;">
            如果您没有请求验证码，请忽略此邮件。<br>此验证码将在10分钟后失效，用于网页邮箱登录验证。<br>
            IP: ${ipAddress}<br>
        </div>
    </div>
</body>
</html>
`, // HTML正文
    });
    console.log(`验证码${verificationCode}已发送到${email}`);
    console.log(`准备发送验证码到邮箱: ${email}`);

    // 响应请求
    const verificationCodeRecord = {
      email: email,
      code: verificationCode,
      expires_at: new Date(new Date().getTime() + 10*60000), // 10分钟后过期
    };

    await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/verification-codes`, {
      data: verificationCodeRecord,
    }, {
      headers: {
        Authorization: `Bearer 8f03f4460f706f1a80aee772b6ee7b9cd91ff1d6fa9b5de04bf316959c7f94ef6f608321a022e544a6aa0693e367f98204055bd327a4c1a2159cc5d90365705c1ea4e42c3af8a05b562f181b1be59f4937f3853e72d36d080202b63ede09bf09a8db2ba01c0af5148dbf94068532f5c2c6567cc23ec4f97a32b78712d67d8086`, // 使用Strapi管理员Token
      },
    });
    console.log(`正在保存验证码记录到Strapi...`);

    res.status(200).json({ message: '验证码已发送' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
}
