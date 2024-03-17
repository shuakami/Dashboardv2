/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
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
