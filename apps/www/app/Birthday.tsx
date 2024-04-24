/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
// @ts-ignore
import Cookies from 'js-cookie';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction
} from "@/registry/new-york/ui/alert-dialog";
import Confetti from 'react-confetti';

function BirthdayChecker() {
  const [isBirthday, setIsBirthday] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkBirthday = async () => {
      const jwt = Cookies.get('jwt');
      if (!jwt) {
        console.error('JWT not found in cookies');
        return;
      }

      try {
        const userInfoResponse = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const { id: userId } = userInfoResponse.data;
        setUserId(userId);

        // 检查本地缓存
        // @ts-ignore
        const cachedBirthdayInfo = JSON.parse(localStorage.getItem('birthdayInfo'));
        if (cachedBirthdayInfo && cachedBirthdayInfo.expires > Date.now() && cachedBirthdayInfo.userId === userId) {
          // 如果缓存未过期且用户 ID 匹配，则使用缓存数据
          setIsBirthday(cachedBirthdayInfo.isBirthday);
          setShowModal(cachedBirthdayInfo.isBirthday && !cachedBirthdayInfo.shown);
        } else {
          // 否则发起请求获取生日状态
          const birthdayStatusResponse = await axios.get(`/api/birthdayNotify?userId=${userId}`);
          const { isBirthday: apiIsBirthday } = birthdayStatusResponse.data;
          setIsBirthday(apiIsBirthday);
          setShowModal(apiIsBirthday);

          // 更新本地缓存
          const cacheTime = 5 * 60 * 60; // 缓存时间为 5 小时
          localStorage.setItem('birthdayInfo', JSON.stringify({
            isBirthday: apiIsBirthday,
            shown: false,
            expires: Date.now() + cacheTime * 1000,
            userId,
          }));
        }
      } catch (error) {
        console.error('Error fetching user info or birthday status', error);
      }
    };

    // 在组件加载完成后延迟执行请求
    const timeoutId = setTimeout(checkBirthday, 0);

    // 在组件卸载时清除定时器
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {showModal && (
        <Confetti
          className="爆炒"
          numberOfPieces={200}
        />
      )}
      <AlertDialog open={showModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🎉生日快乐！</AlertDialogTitle>
            <AlertDialogDescription>
              今天是你的生日！我们祝愿你一切顺利，永远不死。🥳
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              if (!userId) {
                console.error('UserId is not defined.');
                return;
              }
              setShowModal(false);
              // 更新本地存储以防止再次弹出
              const cacheTime = 86400; // 存储为24小时
              // @ts-ignore
              const cachedBirthdayInfo = JSON.parse(localStorage.getItem('birthdayInfo')) || {};
              localStorage.setItem('birthdayInfo', JSON.stringify({ ...cachedBirthdayInfo, shown: true, expires: Date.now() + cacheTime * 1000, userId }));
            }}>🎉 关闭</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
export default BirthdayChecker;
