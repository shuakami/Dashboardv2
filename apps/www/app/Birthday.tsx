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
    async function checkBirthday() {
      const jwt = Cookies.get('jwt');  // 从Cookie中获取JWT
      if (!jwt) {
        console.error('JWT not found in cookies');
        return;
      }

      try {
        const userInfoResponse = await axios.get('https://xn--7ovw36h.love/api/users/me', {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const { id: userId } = userInfoResponse.data;
        setUserId(userId); // 更新userId状态

        // 查询生日状态
        const birthdayStatusResponse = await axios.get(`/api/birthdayNotify?userId=${userId}`);
        const { isBirthday: apiIsBirthday } = birthdayStatusResponse.data;

        // 检查本地缓存
        // @ts-ignore
        const cachedBirthdayInfo = JSON.parse(localStorage.getItem('birthdayInfo'));
        if (cachedBirthdayInfo && cachedBirthdayInfo.expires > Date.now() && cachedBirthdayInfo.userId === userId && cachedBirthdayInfo.shown) {
          setShowModal(false);  // 如果已经显示过则不再显示
        } else {
          setIsBirthday(apiIsBirthday);
          setShowModal(apiIsBirthday);  // 根据实时数据控制显示
        }
      } catch (error) {
        console.error('Error fetching user info or birthday status', error);
      }
    }

    checkBirthday();
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
