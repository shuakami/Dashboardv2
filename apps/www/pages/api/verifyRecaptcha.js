/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

// pages/api/verifyRecaptcha.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const token = req.body.token;
    const secretKey = '6LcpUW4pAAAAAAUlg3Xn8tvbMjsu0AHtHIzmuvcR';

    // 进行 reCAPTCHA 验证
    const verificationUrl = `https://recaptcha.net/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    const verificationResponse = await fetch(verificationUrl, {
      method: 'POST',
    });
    const verificationData = await verificationResponse.json();

    // 检查验证是否成功
    if (verificationData.success) {
      res.status(200).json({ success: true, message: '验证成功' });
    } else {
      res.status(200).json({ success: false, message: '验证失败' });
    }
  } else {
    // 不是 POST 请求
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
