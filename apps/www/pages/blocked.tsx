/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import React, { useEffect, useState } from 'react';
// @ts-ignore
import Cookies from 'js-cookie';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/registry/new-york/ui/alert-dialog";
import { Button } from "@/registry/new-york/ui/button";
import styles from './Blocked.module.css';
import Link from 'next/link';
import "@/styles/globals.css";
import { useRouter } from 'next/router';
import axios from 'axios';

interface BlockedUserResponse {
  data: BlockedUserData[];
  meta: {
    pagination: Pagination;
  };
}

interface BlockedUserData {
  id: number;
  attributes: BlockedUserInfo;
}

interface BlockedUserInfo {
  user: string;
  BlockedReason: string;
  BlockedTime: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

const BlockedPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [blockedDetails, setBlockedDetails] = useState<BlockedUserInfo | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    const storedUsername = Cookies.get('blockedIdentifier');
    console.log('Stored Username:', storedUsername);

    if (!storedUsername) {
      console.log('No username found in cookies, redirecting to home...');
      router.replace('/');
    } else {
      setUsername(storedUsername);
      const animationDuration = 1960;
      const timer = setTimeout(() => {
        setShowDialog(true);
        Cookies.remove('blockedIdentifier');
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [router]);

  const handleDetailsClick = async () => {
    try {
      const { data: responseData } = await axios.get<BlockedUserResponse>(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/blockeds`);
      const userBlockedInfo = responseData.data.find((item) => item.attributes.user === username)?.attributes;
      if (userBlockedInfo) {
        setBlockedDetails(userBlockedInfo);
      } else {
        setBlockedDetails(null);
      }
    } catch (error) {
      console.error("Failed to fetch blocked details", error);
      setBlockedDetails(null);
    }
    setShowDetailsDialog(true);
  };

  return (
    <div className={styles.blockedPage}>
      <div className={styles.blockedText}>blocked</div>
      <div className={styles.breathingLine}></div>
      {showDialog && (
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>你被封号了。</AlertDialogTitle>
              <AlertDialogDescription>
                你的账户 {username} 已被管理员封锁。<br></br>
                <strong>本页面只会显示1次，请谨慎关闭。</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline" onClick={() => setShowDialog(false)}>关闭</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button onClick={handleDetailsClick}>了解详情</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {showDetailsDialog && (
        <AlertDialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>封号详情</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              {blockedDetails ? (
                <>
                  用户名: {blockedDetails.user}<br/>
                  封号原因: {blockedDetails.BlockedReason}<br/>
                  封号时间: {blockedDetails.BlockedTime}<br/>
                  更新时间: {new Date(blockedDetails.updatedAt).toLocaleString()}
                  <p className="leading-7 [&:not(:first-child)]:mt-6">
                    不服？如需申请再次复查可发送邮箱至🌟
                    <a href="mailto:admin@sdjz.wiki"
                       className="text-blue-500 underline">admin@sdjz.wiki</a>🌟
                  </p>
                </>
              ) : (
                "查询Blocked数据库里面没有信息，可以等一下再来看。"
              )}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>关闭</Button>
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <p className="no-select copyright-text absolute bottom-4 left-4 z-0 text-xs text-white opacity-50">
        © {new Date().getFullYear()} ByteFreezeLab. All rights reserved.
        {' '}
        <Link href="/privacy" className="text-white hover:text-gray-200 dark:hover:text-gray-400">隐私</Link>
        {' '}
        <Link href="/policy" className="text-white hover:text-gray-200 dark:hover:text-gray-400">条款协议</Link>
        {' '}
        <a  onClick={() => setShowDialog(true)} className="text-white hover:text-gray-200 dark:hover:text-gray-400">你不小心关掉了</a>
      </p>
    </div>
  );
};

export default BlockedPage;
