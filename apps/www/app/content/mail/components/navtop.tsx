/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/registry/new-york/ui/menubar"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectGroup } from "@/registry/new-york/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/new-york/ui/alert-dialog"
import {Badge} from "@/registry/new-york/ui/badge";
import {useEffect, useState} from "react";
import {AccountSwitcher} from "@/app/content/mail/components/account-switcher";
import * as React from "react";
import {cn} from "@/lib/utils";
import {CopyrightModal} from "@/app/copyright"
import {useTheme} from "next-themes";
import axios from "axios";
// @ts-ignore
import Cookies from "js-cookie";
import {toast} from "@/registry/new-york/ui/use-toast";

// @ts-ignore
export function Navtop({ unreadMailsCount, setSelectedLink, setShowSettings,setShowDashboard }) {
  const { theme, setTheme } = useTheme();
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);
  // 显示上传日志模态框
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showUploadLogModal, setShowUploadLogModal] = useState(false);
  const [logCategories, setLogCategories] = useState([]);
  const [timeFilter, setTimeFilter] = useState(30); // 默认为30分钟
  const [showConfirmation, setShowConfirmation] = useState(false);


  const loadLogs = () => {
    const now = new Date().getTime();
    const filterTime = now - (timeFilter * 60 * 1000);
    const logs = Object.keys(localStorage).filter(key => key.startsWith('errorLogs')).reduce((acc, key) => {
      const storedLogs = JSON.parse(localStorage.getItem(key) || "[]");
      storedLogs.forEach((log: { timestamp: string | number | Date; type: string; message: string; }) => {
        if (new Date(log.timestamp).getTime() >= filterTime) {
          let category = log.type || 'unknown';
          switch (category) {
            case 'runtime': category = '浏览器错误'; break;
            case 'promise': category = '加载失败'; break;
            case 'axios': category = log.message.includes("timeout") ? '请求超时' : '网络请求失败'; break;
            default: category = '其他错误'; break;
          }
          // @ts-ignore
          if (!acc[category]) acc[category] = [];
          // @ts-ignore
          acc[category].push({
            time: log.timestamp,
            message: log.message.split('\n')[0],
          });
        }
      });
      return acc;
    }, {});


    const categories = Object.entries(logs).map(([type, errors]) => ({
      type,
      errors,
      // @ts-ignore
      label: `${type} (${errors.length})`
    }));

    // @ts-ignore
    setLogCategories(categories);
  };


  const handleChangeTimeFilter = (value: any) => {
    const numericValue = Number(value);
    if (timeFilter !== numericValue) {
      setTimeFilter(numericValue);
    }
  };

  const handleContinue = () => {
    setShowUploadLogModal(false);
    setShowConfirmationModal(true); // 切换到确认模态框
    collectErrorsForUpload(timeFilter); // 准备日志收集但不立即上传
  };

  const finalizeUpload = () => {
    setShowConfirmationModal(false); // 关闭确认模态框
    collectErrorsForUpload(timeFilter); // 此处正确调用，以上传错误
  };


  // 打开上传日志模态框
  const openUploadLogModal = () => {
    setShowUploadLogModal(true);
    loadLogs(); // 调用加载日志函数
  };

  // 关闭上传日志模态框
  const closeUploadLogModal = () => {
    setShowUploadLogModal(false);
    setShowConfirmation(false); // 关闭时重置确认状态
  };

  const fetchUserId = async () => {
    const jwt = Cookies.get('jwt'); // 从cookie中获取JWT
    if (!jwt) {
      console.error('JWT not found');
      return null;
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      return response.data.id; // 根据Strapi实际返回的数据结构调整
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null; // 在错误情况下返回null
    }
  };



  const collectErrorsForUpload = async (timeFilter: number) => {
    const now = new Date().getTime();
    const filterTime = now - (timeFilter * 60 * 1000);
    const errors = Object.keys(localStorage)
      .filter(key => key.startsWith('errorLogs'))
      .reduce((acc, key) => {
        const storedLogs = JSON.parse(localStorage.getItem(key) || "[]");
        storedLogs.forEach((log: { timestamp: string | number | Date; url: any; config: { method: any; }; response: { status: any; }; message: string; type: any; }) => {
          if (new Date(log.timestamp).getTime() >= filterTime) {
            const additionalInfo = {
              url: log.url || "No URL provided",
              method: log.config ? log.config.method : "No method available",
              status: log.response ? log.response.status : "No response status",
            };

            // @ts-ignore
            acc.push({
              message: log.message + " | Additional Info: " + JSON.stringify(additionalInfo),
              type: log.type,
              timestamp: log.timestamp
            });
          }
        });
        return acc;
      }, []);

    const userId = await fetchUserId(); // 获取用户ID
    if (userId && errors.length > 0) {
      await uploadErrors(errors, userId);
    }
  };


  const uploadErrors = async (errors: any[], userId: any) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/debugs`, {
        data: {
          message: JSON.stringify(errors.map(error => error.message)),
          type: JSON.stringify(errors.map(error => error.type)),
          timestamp: JSON.stringify(errors.map(error => error.timestamp)),
          userid: userId.toString()
        }
      });
      console.log('Upload successful');
      toast({
        title: "日志已上传",
      })
    } catch (error) {
      console.error('Error uploading errors:', error);
    }
  };









  return (
    <Menubar style={{backdropFilter: 'blur(7px)'}} className="rounded-none border-t-0 bg-white/5 shadow-none dark:bg-black/5">
      <div className="flex h-[52px] items-center justify-center">
        <AccountSwitcher/>
      </div>
      <div className="flex w-full justify-between">
        <div className="flex">
          <MenubarMenu>
            <MenubarTrigger>消息</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => {
                setSelectedLink('消息');
                setShowSettings(false);
                setShowDashboard(false);
                document.dispatchEvent(new CustomEvent('showAllMails'));
              }}>
                📥 所有消息 {unreadMailsCount > 0 && `(${unreadMailsCount})`}
              </MenubarItem>
              <MenubarItem>
                📣 公告通知 <MenubarShortcut>⌘A</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                📅 日程提醒 <MenubarShortcut>⌘C</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator/>
              <MenubarItem>
                🗑️ 回收站
              </MenubarItem>
              <MenubarItem onClick={() => {
                setShowSettings(false);
                setShowDashboard(false);
                setSelectedLink('归档');
                document.dispatchEvent(new CustomEvent('archiveClicked'));
              }}>
                🗄️ 归档
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>运维</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => setShowDashboard(true)}>
                📈 实时监控 <MenubarShortcut>⌘M</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                🔧 配置管理 <MenubarShortcut>⌘P</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                📊 性能优化 <MenubarShortcut>⌘O</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>工具</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                🆕 更新通知
                <Badge variant="outline" className="ml-2">342</Badge>
              </MenubarItem>
              <MenubarItem>
                📊 数据分析
                <Badge variant="outline" className="ml-2">8</Badge>
              </MenubarItem>
              <MenubarSeparator/>
              <MenubarSub>
                <MenubarSubTrigger>👨‍💻 开发者工具</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>
                    🐙 Github 消息 <Badge variant="outline" className="ml-2">128</Badge>
                  </MenubarItem>
                  <MenubarItem>🖥️ 控制台</MenubarItem>
                  <MenubarItem onClick={openUploadLogModal}>🐞 上传日志</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator/>
              <MenubarItem>
                🛡️ 安全中心
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>设置</MenubarTrigger>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger>🎨 主题</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => setTheme('light')}>
                    🌞 明亮模式
                  </MenubarItem>
                  <MenubarItem onClick={() => setTheme('dark')}>
                    🌙 暗黑模式
                  </MenubarItem>
                  <MenubarItem onClick={() => setTheme('system')}>
                    🖥️ 跟随系统
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator/>
              <MenubarItem onClick={() => {
                setShowDashboard(false);
                setShowSettings(true);
              }}>常规设置</MenubarItem>
              <MenubarItem>通知设置</MenubarItem>
              <MenubarItem>个性化</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </div>

          <MenubarMenu >
            <MenubarTrigger className="mr-3">关于</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => setShowCopyrightModal(true)}>
              授权信息<MenubarShortcut>⌘C</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => {
              }}>
                更新日志<MenubarShortcut>⌘U</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>


        {showUploadLogModal && (
          <AlertDialog open={showUploadLogModal} onOpenChange={setShowUploadLogModal}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>选择日志类别和时间</AlertDialogTitle>
                <AlertDialogDescription>选择日志类别进行上传。你可以选择上传某一类别的所有日志。</AlertDialogDescription>
              </AlertDialogHeader>
              <Select onValueChange={handleChangeTimeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择时间范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="5">5分钟内</SelectItem>
                    <SelectItem value="15">15分钟内</SelectItem>
                    <SelectItem value="30">30分钟内</SelectItem>
                    <SelectItem value="60">1小时内</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={closeUploadLogModal}>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleContinue}>继续</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {showConfirmationModal && (
          <AlertDialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认你的选择</AlertDialogTitle>
                <AlertDialogDescription>
                  在过去{timeFilter}分钟内，你有以下类型的错误:
                  {logCategories.map(({ type, label }) => (
                    <div key={type}>{label || "无错误日志"}</div>
                  ))}
                  <p className="text-blue-400"><strong>请注意，如果您需要上传日志，代表您已经接受了隐私政策</strong>
                  </p>

                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowConfirmationModal(false)}>取消</AlertDialogCancel>
                <AlertDialogAction onClick={finalizeUpload}>开始上传</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {showCopyrightModal && (
          <CopyrightModal
            open={showCopyrightModal}
            onClose={() => setShowCopyrightModal(false)}
          />
        )}
      </div>
    </Menubar>
)
}
