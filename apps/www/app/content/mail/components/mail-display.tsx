/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import addDays from "date-fns/addDays"
import format from "date-fns/format"
import React, {useEffect, useState} from 'react';
import nextSaturday from "date-fns/nextSaturday"
import {enUS, zhCN} from 'date-fns/locale'
// @ts-ignore
import ReactMarkdown from 'react-markdown';
import CustomMailText from './CustomMailText'
import sendMail from './send';
import {franc} from 'franc';
import { deleteMail } from './delete';
import { Skeleton } from "@/registry/new-york/ui/skeleton"
import {archiveMail} from './archive'
import { ReportDrawer } from './report';
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
} from "@/registry/new-york/ui/alert-dialog";
import {
  FontBoldIcon,
  FontItalicIcon,
  UnderlineIcon,
} from "@radix-ui/react-icons";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/new-york/ui/toggle-group";
import {Archive, Clock, Forward, MoreVertical, Reply, ReplyAll, Trash2, ArchiveRestore, FilePlus} from "lucide-react"
import {DropdownMenuContent, DropdownMenuItem,} from "@/registry/default/ui/dropdown-menu"
import {Avatar, AvatarFallback, AvatarImage,} from "@/registry/new-york/ui/avatar"
import {Button} from "@/registry/new-york/ui/button"
import {Calendar} from "@/registry/new-york/ui/calendar"
import {DropdownMenu, DropdownMenuTrigger,} from "@/registry/new-york/ui/dropdown-menu"
import {Label} from "@/registry/new-york/ui/label"
import {Popover, PopoverContent, PopoverTrigger,} from "@/registry/new-york/ui/popover"
import {Separator} from "@/registry/new-york/ui/separator"
import {Switch} from "@/registry/new-york/ui/switch"
import {Textarea} from "@/registry/new-york/ui/textarea"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/registry/new-york/ui/tooltip"
import {Mail} from "@/app/content/mail/data"
import {useToast} from "@/registry/new-york/ui/use-toast"
import {ToastAction} from "@/registry/new-york/ui/toast"
import {ReloadIcon} from "@radix-ui/react-icons";
import {useMail} from "@/app/content/mail/use-mail";
import axios from "axios";
import {addMinutes, addWeeks, startOfDay} from "date-fns";
import { DeleteSelectMailRead } from "@/app/content/mail/components/mail-list";
import { setupAxiosInterceptors } from '@/app/setupAxiosInterceptors';
import {AddSend} from "@/app/content/mail/components/addsend";
import {PaperClipIcon} from "@heroicons/react/outline";
import { CardContent } from "@/registry/default/ui/card";
import {Card, CardFooter, CardHeader, CardTitle} from "@/registry/new-york/ui/card";

setupAxiosInterceptors();

interface MailDisplayProps {
  mail: Mail | null
}


export function MailDisplay({ mail }: MailDisplayProps) {
  // 日期
  const today = new Date();
  // 按钮文本
  const [buttonText, setButtonText] = useState('发送');
  // 静默发送计时器
  const [pressTimer, setPressTimer] = useState(null);
  // 输入文本
  const [text, setText] = useState('');
  // 偏好语言
  const [userPrefLanguage, setUserPrefLanguage] = useState('');
  // 翻译文本
  const [translatedText, setTranslatedText] = useState('');
  // 翻译标志
  const [isTranslated, setIsTranslated] = useState(false);
  // 对话框显示
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // 通知使用
  const { toast } = useToast();
  // 加载状态指示
  const [isLoading, setIsLoading] = useState(false);
  // 邮件刷新钩子
  const { mails, refreshMails } = useMail();
  // 已归档UI的标志
  const [forceShowArchivedUI, setForceShowArchivedUI] = useState(false);
  // 举报UI状态
  const [showReportDrawer, setShowReportDrawer] = useState(false);
  // 文本域引用
  const textareaRef = React.useRef(null);
  // 新增邮件模态框
  const [isAddSendDialogOpen, setIsAddSendDialogOpen] = useState(false);
  // 文件上传模态框
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  // 文件上传列表
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // 文件预览
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  // 预览模态框
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // 上传成功的URL
  const [uploadedFileURLs, setUploadedFileURLs] = useState([]);


  const handleDragOver = (e: { preventDefault: () => void; }) => {
    e.preventDefault(); // 阻止默认行为
  };

  const handleDrop = (e: { preventDefault: () => void; dataTransfer: { files: Iterable<unknown> | ArrayLike<unknown>; }; }) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (files.length > 15) {
      // 同样选择截断文件列表或通知用户
      toast({
        title: '文件数量超过限制',
        description: '最多只能选择15个'
      }
      );
      // @ts-ignore
      setSelectedFiles(files.slice(0, 15)); // 截断到前15个文件
      files.forEach(file => {
        uploadFile(file);
      });
    } else {
      // @ts-ignore
      setSelectedFiles(files);
      files.forEach(file => {
        uploadFile(file);
      });
    }
  };




  const handleRemoveFile = (fileToRemove: File) => {
    // 从选中文件列表中移除文件
    setSelectedFiles(selectedFiles.filter(file => file !== fileToRemove));

    // 尝试从URLs中移除对应的文件URL
    const fileNameToRemove = fileToRemove.name;
    // @ts-ignore
    setUploadedFileURLs(prevUrls => prevUrls.filter(url => !url.endsWith(fileNameToRemove)));

    // 如果正在预览被移除的文件，则关闭预览
    setPreviewFile(null);
  };


  function formatFileSize(bytes: any) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }


  const insertLinksIntoText = () => {
    if (!uploadedFileURLs.length) {
      toast({
        title: '错误',
        description: '没有文件被上传。',
      });
      return;
    }

    // 生成Markdown链接字符串
    const markdownLinks = uploadedFileURLs
      .map(url => {
        // 从URL中提取文件名
        // @ts-ignore
        const fileName = url.split('/').pop();
        // 生成Markdown格式的链接
        return `![${fileName}](${url})\n`;
      })
      .join('');


    // 重置文件列表和URLs
    setSelectedFiles([]);
    setUploadedFileURLs([]);

    // 关闭上传模态框
    setIsUploadModalOpen(false);

    // 插入到Textarea的现有内容中
    const newText = `${text}\n${markdownLinks}`;
    setText(newText);
    setIsUploadModalOpen(false)
    // 自动滚动到Textarea的底部
    if (textareaRef && textareaRef.current) {
      // @ts-ignore
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  };



  // @ts-ignore
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('files', file); // 添加文件

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // 解析响应体以获取文件的URL
      const data = await response.json();
      const uploadedUrl = data[0].url; // 响应体结构为 [{ url: "..." }]

      // 更新状态以保存URL
      // @ts-ignore
      setUploadedFileURLs(prevUrls => [...prevUrls, `${process.env.NEXT_PUBLIC_STRAPI_URL}${uploadedUrl}`]);

      // 上传成功
      toast({
        title: '上传成功',
        description: `${file.name} 已经上传。`,
      });
    } catch (error) {
      // 上传失败
      toast({
        title: '上传失败',
        description: `上传 ${file.name} 时出现错误。`,
      });
    }
  };



  const handleFileUpload = () => {
    setIsUploadModalOpen(true); // 显示模态框
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.target.files === null) return;

    const files = Array.from(event.target.files);
    if (files.length > 15) {
      // 选择截断文件列表或通知用户
      toast({
        title: '文件数量超过限制',
        description: '最多只能选择15个'
      }
    );
      setSelectedFiles(files.slice(0, 15)); // 截断到前15个文件
      files.forEach(file => {
        uploadFile(file);
      });
    } else {
      setSelectedFiles(files);
      files.forEach(file => {
        uploadFile(file);
      });
    }
  };


  const handleFileClick = (file: File) => {
    // @ts-ignore
    setPreviewFile(file);
    setIsPreviewOpen(true); // 显示预览对话框
  };




  useEffect(() => {
    // 确保代码运行在客户端
    if (typeof window !== 'undefined') {
      const language = localStorage.getItem('userLanguage');
      // @ts-ignore
      setUserPrefLanguage(language);
    }
  }, []);


  let locale;
  switch(userPrefLanguage) {
    case 'zh':
      locale = zhCN;
      break;
    default:
      locale = enUS;
  }

  const handleCloseDrawer = () => {
    setShowReportDrawer(false); // 用于关闭Drawer
  };

  const handleOpenReportDrawer = () => {
    setShowReportDrawer(true); // 打开报告抽屉
  };

  const handleFormatClick = (format: string) => {
    // 确保传入的格式化参数是有效的
    const markdownSymbols = {
      bold: '**',
      italic: '*',
      underline: '~~', // 使用删除线代替下划线
    };

    // @ts-ignore
    const symbols = markdownSymbols[format];
    // 检查symbols是否有效
    if (!symbols) {
      console.error('Invalid format type:', format);
      return;
    }

    if (!textareaRef.current) {
      console.error('Textarea ref is not available');
      return;
    }

    const { selectionStart: start, selectionEnd: end } = textareaRef.current;

    // 确保start和end是有效的数字
    if (typeof start !== 'number' || typeof end !== 'number') {
      console.error('Invalid selection range');
      return;
    }

    const textBefore = text.substring(0, start);
    const textSelected = text.substring(start, end);
    const textAfter = text.substring(end);

    const newText = `${textBefore}${symbols}${textSelected}${symbols}${textAfter}`;
    setText(newText);

    // 更新光标位置
    setTimeout(() => {
      // @ts-ignore
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + symbols.length;
      // @ts-ignore
      textareaRef.current.focus();
    }, 0);
  };

  useEffect(() => {
    // 当mail prop发生变化时，清空已翻译的内容
    if (mail) {
      setTranslatedText('');
    }
  }, [mail]);

  useEffect(() => {
    const checkAndDisplayTranslation = async () => {
      if (mail && mail.text) {
        // 生成当前邮件内容的哈希值
        const contentHash = await generateHash(mail.text);
        // 检查localStorage中是否已有该邮件的翻译
        const cachedTranslation = localStorage.getItem(contentHash);
        // 如果找到缓存的翻译，则更新translatedText状态，并设置isTranslated为true
        if (cachedTranslation) {
          setTranslatedText(cachedTranslation);
          setIsTranslated(true);
        } else {
          // 如果没有找到缓存的翻译，重置translatedText状态，并设置isTranslated为false
          setTranslatedText('');
          setIsTranslated(false);
        }
      } else {
        // 如果没有邮件内容，重置translatedText和isTranslated状态
        setTranslatedText('');
        setIsTranslated(false);
      }
    };

    // 每次mail对象更新时执行检查并显示翻译
    checkAndDisplayTranslation();
  }, [mail]); // 依赖项数组中包含mail，以便于mail变化时重新执行效果
  const isChinese = () => {
    if (!mail || !mail.text) return false;
    const langCode = franc(mail.text);
    return langCode === 'cmn'; // 'cmn' 是汉语的代码
  };


// 引入用于生成哈希的函数
  async function generateHash(content: string | undefined) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const handleUpdateTranslation = async () => {
    if (!mail || !mail.text) return;
    // 生成当前邮件内容的哈希值
    const contentHash = await generateHash(mail.text);
    // 从localStorage中删除对应的翻译缓存
    localStorage.removeItem(contentHash);
    // 清除当前显示的翻译内容
    setTranslatedText('');
    // 关闭对话框
    setIsDialogOpen(false);
    // 设置isTranslated为false
    setIsTranslated(false);
    // 调用翻译函数重新翻译邮件
    await translateMail(mail.text);
  };
  // 删除翻译的，这个不讲了，差不多
  const handleDeleteTranslation = async () => {
    if (!mail || !mail.text) {
      toast({
        description: "我的傻瓜欸~这都没有内容🐱",
      });
      return;
    }
    if (!translatedText || !isTranslated) {
      toast({
        description: "我的傻瓜欸~这都没有翻译我怎么删🐋！！",
      });
      return;
    }
    const contentHash = await generateHash(mail.text);
    localStorage.removeItem(contentHash);
    setTranslatedText('');
    setIsTranslated(false);
    toast({
      description: "宝贝！删啦🐳",
    });
  };
  const translateMail = async (mailContent: string) => {
    // 生成邮件内容的哈希值
    const contentHash = await generateHash(mailContent);
    // 检查localStorage中是否已有翻译
    const cachedTranslation = localStorage.getItem(contentHash);
    if (cachedTranslation) {
      setTranslatedText(cachedTranslation);
      setIsTranslated(true); // 已有翻译，更新状态
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_OPENAI_URL}/v1/chat/completions`;
    const headers = {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
      'Content-Type': 'application/json'
    };

    const data = {
      model: 'gpt-3.5-turbo',
      temperature: 0.6,
      max_tokens: 2200,
      top_p: 1,
      presence_penalty: 1,
      messages: [{
        role: 'system',
        content: '将以下英文内容翻译成中文，并注意调整任何文化、语言、语序上的差异使之适应中国读者的习惯：'
      }, {
        role: 'user',
        content: mailContent //发内容
      }],
      stream: true,
    };



    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });

      if (response.body) {
        const reader = response.body.getReader();
        let {done, value} = await reader.read();
        let chunks = '';
        while (!done) {
          chunks += new TextDecoder("utf-8").decode(value);
          const parts = chunks.split('\n\n');
          // @ts-ignore
          chunks = parts.pop(); // 保存最后一个不完整的数据块以供下次循环使用

          parts.forEach(part => {
            if (part.trim() === 'data: [DONE]') {
              reader.cancel(); // 取消读取操作
              toast({
                description: "翻译完成",
              });
              return;
            }

            if (part.startsWith('data: ')) {
              try {
                const jsonStr = part.replace('data: ', '');
                const json = JSON.parse(jsonStr);

                if (json.choices && json.choices.length > 0 && json.choices[0].delta && json.choices[0].delta.content) {
                  const text = json.choices[0].delta.content;
                  setTranslatedText(prevText => {
                    // 首先更新状态以反映新的翻译文本
                    const newText = prevText + text;

                    // 然后，将翻译后的文本与其哈希值一起保存到localStorage
                    localStorage.setItem(contentHash, newText);
                    setIsTranslated(true); // 更新状态为已翻译

                    // 最后返回更新后的文本，以更新组件状态
                    return newText;
                  });
                }
              } catch (e) {
                console.error('Error parsing chunk', e);
              }
            }
          });
          ({done, value} = await reader.read());
        }
      }
    } catch (error) {
      console.error('翻译邮件时出错:', error);
      toast({
        title: "OMG 是bug时刻！",
        description: "Sorry宝贝！好像API有点小问题，要不要重试一下？😿",
        duration: 5000,
        action: <ToastAction onClick={handleUpdateTranslation} altText="Try again">重试</ToastAction>,
      });
      setTimeout(() => {
        toast({
          title: "上传日志",
          description: "宝贝！上传日志可以更好的解决问题哦！😿",
          duration: 5000,
          action: <ToastAction altText="Upload logs">上传日志</ToastAction>,
        });
      }, 6000);
    }
  }

  const handleSendMailClick = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true); // 开始加载
    const currentText = text; // 从 useState 获取当前文本

    // @ts-ignore
    const mailOptions: MailOptions = {
      text: currentText,
      emailAddress: mail?.email,
      isReplyFromHomepage: true,
      currentViewingMailTitle: mail?.subject, // 使用当前邮件的主题作为回复主题
    };

    const callback = (success: boolean) => {
      if (success) {
        refreshMails();
      //  console.log("邮件发送成功");
        setText(''); // 清空文本输入
        toast({
          title: "发送成功",
          description: "宝贝！发送成功啦🎉",
        });
      } else {
        refreshMails();
        console.log("邮件发送失败");
        setText(currentText); // 发送失败时，恢复之前的文本
        toast({
          title: "OMG 是bug时刻！",
          description: "Sorry宝贝！好像API有点小问题，要不要重试一下？😿",
          duration: 5000,
          action: <ToastAction onClick={() => handleSendMailClick(e)} altText="Try again">重试</ToastAction>,
        });
      }
      setIsLoading(false); // 结束加载
    };

    await sendMail(mailOptions, callback);
  };



  const handleTranslateClick = async (e: { preventDefault: () => void; }) => {
    e.preventDefault(); // 阻止链接默认行为
    if (isTranslated) {
      // 如果已翻译，询问是否更新
      setIsDialogOpen(true); // 打开对话框
    } else {
      // 如果未翻译，直接翻译
      // @ts-ignore
      await translateMail(mail.text);
    }
  };

  const handleButtonPress = () => {
    const timer = setTimeout(() => {
      setButtonText('静默发送');
    }, 2000); // 设置定时器，2秒后更新按钮文本
    // @ts-ignore
    setPressTimer(timer);
  };

  useEffect(() => {
    // 根据当前邮件是否归档来显示或隐藏归档UI
    // @ts-ignore
    return setForceShowArchivedUI(!!mail && mail.archive);
  }, [mail]);

  useEffect(() => {
    if (mail && mail.archive) {
      setForceShowArchivedUI(true);
    }
  }, [mail]);

  // 归档
  const handleArchiveClick = async () => {
    if (mail) {
      await archiveMail(mail.id, true, async (success) => {
        if (success) {
          refreshMails();
        //  setForceShowArchivedUI(true);
          await refreshMails();
          toast({
            title: "归档成功",
            description: "宝贝！已归档🎉",
          });
          // 检查并可能清除本地存储中的selectedMailId
          const selectedMailId = localStorage.getItem('selectedMailId');
          if (selectedMailId && selectedMailId === mail.id.toString()) {
            localStorage.removeItem('selectedMailId'); // 清除选中邮件ID
          }
        } else {
          toast({
            title: "OMG 是bug时刻！",
            description: "Sorry宝贝！好像API有点小问题，要不要重试一下？😿",
            action: <ToastAction onClick={handleArchiveClick} altText="Try again">重试</ToastAction>,
          });
        }
      });
    } else {
      console.log('没有选中的邮件或缺少必要信息');
      toast({
        title: "宝贝！",
        description: "你没有选中邮件，或者缺少必要信息哦q(≧▽≦q)🥟",
        action: <ToastAction onClick={handleArchiveClick} altText="Try again">重试</ToastAction>,
      });
    }
  };
  const unarchiveMail = (id: string) => {
    // 调用archiveMail函数，将archive参数设置为false来取消归档
    setIsLoading(true); // 开始加载
    archiveMail(id, false, async (success) => {
      if (success) {
        refreshMails();
        setIsLoading(false);
        setForceShowArchivedUI(false);
        toast({
          title: "取消归档成功",
          description: "宝贝！已取消啦！🎉",
        });
        await refreshMails();
      } else {
        setIsLoading(false);
        toast({
          title: "OMG 是bug时刻！",
          description: "Sorry宝贝！好像API有点小问题，要不要重试一下？😿",
          // @ts-ignore
          action: <ToastAction onClick={unarchiveMail} altText="Try again">重试</ToastAction>,
        });
      }
    });
  };

  const handleDeleteClick = async () => {
    if (mail && mail.id) {
      // 保存被删除邮件的内容到localStorage
      localStorage.setItem(`deletedMail_${mail.id}`, JSON.stringify(mail));
      await deleteMail(mail.id, (success) => {
        if (success) {
          refreshMails()
          console.log("邮件已删除");
          localStorage.setItem('postReloadMessage', JSON.stringify({
            title: "删除成功",
            description: "宝贝！已经删除啦！🎉",
          }));
          toast({
            title: "删除成功",
            description: "宝贝！已经删除啦！🎉",
            action: <ToastAction onClick={() => restoreDeletedMail(mail.id)} altText="Undo deletion">撤销删除</ToastAction>,
          });
        } else {
          refreshMails();
          console.error("删除失败");
          toast({
            title: "OMG 是bug时刻！",
            description: "Sorry宝贝！好像API有点小问题，要不要重试一下？😿",
            action: <ToastAction onClick={handleDeleteClick} altText="Try again">重试</ToastAction>,
          });
        }
      });
    }
  };

  async function restoreDeletedMail(mailId: string) {
    const mailDataStr = localStorage.getItem(`deletedMail_${mailId}`);
    if (!mailDataStr) {
      console.error("未找到被删除的邮件数据");
      return false;
    }

    const mailData = JSON.parse(mailDataStr);

    // 构建POST请求的数据，确保数据结构与API期望的匹配
    const postData = {
      data: {
          name: mailData.name,
          subject: mailData.subject,
          text: mailData.text,
          date: mailData.date,
          labels: mailData.labels.join(", "), // 将数组转换为逗号分隔的字符串
          email: mailData.email,
          CCID: mailData.CCID,
      }
    };

   //  console.log("发送的邮件数据:", JSON.stringify(postData, null, 2));

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/mails`, postData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log("邮件恢复成功", response.data);
      refreshMails();
      toast({
        title: "删除成功",
        description: "宝贝！恢复成功啦！下次想好再删哦🎉",
      });
      localStorage.removeItem(`deletedMail_${mailId}`);

      return true;
    } catch (error) {
      console.error("邮件恢复失败:", error);
      return false;
    }
  }
  const showArchivedUI = (mail && mail.archive || mail && forceShowArchivedUI) ;

  const handleSetReminder = (time: string) => {
    localStorage.setItem('reminderTime', time);
    toast({
      title: "提醒设置成功",
      // @ts-ignore 注：此处多语言挖坑
      description: `宝贝！已经设置提醒在${format(new Date(time), "E, MMMM d, h:mm a", { timeZone: 'UTC' })}。`,
    });
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      const reminderTimeString = localStorage.getItem('reminderTime');
      if (reminderTimeString) {
        const reminderTime = new Date(reminderTimeString);
        const now = new Date();

        //  console.log(`现在时间: ${now.toISOString()}`);
        //  console.log(`提醒时间: ${reminderTime.toISOString()}`);
        //  console.log(`是否到达提醒时间: ${reminderTime <= now}`);

        if (reminderTime <= now) {
          toast({
            title: "你之前设置了提醒",
            description: "宝贝！时间到啦🎉",
          });
       //   console.log("提醒弹出"); // 进一步的调试语句
          localStorage.removeItem('reminderTime'); // 清除提醒
        }
      }
    }, 60000);

    return () => clearInterval(interval); // 清理定时器
  }, []);

  const handleButtonRelease = () => {
    // @ts-ignore
    clearTimeout(pressTimer); // 如果用户在2秒内释放按钮，则清除定时器
  };

  const toggleAddSendDialog = () => {
    setIsAddSendDialogOpen(!isAddSendDialogOpen);
  };

  useEffect(() => {
    // 组件卸载时清理定时器
    return () => {
      if (pressTimer) clearTimeout(pressTimer);
    };
  }, [pressTimer]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={toggleAddSendDialog} variant="ghost" size="icon" disabled={!mail}>
                <FilePlus className="h-4 w-4"/>
                <span className="sr-only">ADD</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>自己发一个</TooltipContent>
          </Tooltip>
          {isAddSendDialogOpen && <AddSend  />}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleArchiveClick} variant="ghost" size="icon" disabled={!mail} >
                <Archive className="h-4 w-4"/>
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>归档</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleDeleteClick} variant="ghost" size="icon" disabled={!mail}>
                <Trash2 className="h-4 w-4"/>
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>删了</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6"/>
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <Clock className="h-4 w-4"/>
                    <span className="sr-only">Snooze</span>
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>
              <PopoverContent className="flex w-[535px] p-0">
                <div className="flex flex-col gap-2 border-r px-2 py-4">
                  <div className="mt-4 px-4 text-sm font-medium">选个时间我到时候喊你啊</div>
                  <div className="mt-4 grid min-w-[250px] gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => handleSetReminder(addMinutes(new Date(), 2).toISOString())} // 现在+2分钟
                    >
                      2分钟后
                      <span className="ml-auto text-muted-foreground">
    {format(addMinutes(new Date(), 2), "E, h:mm a")}
  </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => handleSetReminder(addDays(new Date(), 1).toISOString())} // 明天的这个时候
                    >
                      明天晚点
                      <span className="ml-auto text-muted-foreground">
    {format(addDays(new Date(), 1), "E, h:m b")}
  </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => handleSetReminder(startOfDay(addDays(new Date(), 1)).toISOString())} // 明天开始的时候
                    >
                      明天
                      <span className="ml-auto text-muted-foreground">
    {format(startOfDay(addDays(new Date(), 1)), "E, h:m b")}
  </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => handleSetReminder(startOfDay(nextSaturday(new Date())).toISOString())} // 这个周末（周六开始的时候）
                    >
                      这个周末
                      <span className="ml-auto text-muted-foreground">
    {format(nextSaturday(new Date()), "E, h:m b")}
  </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => handleSetReminder(startOfDay(addWeeks(new Date(), 1)).toISOString())} // 下周的开始时候
                    >
                      下周
                      <span className="ml-auto text-muted-foreground">
    {format(addWeeks(new Date(), 1), "E, h:m b")}
  </span>
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <Calendar/>
                </div>
              </PopoverContent>
            </Popover>
            <TooltipContent>选个时间喊你</TooltipContent>
          </Tooltip>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Reply className="h-4 w-4"/>
                <span className="sr-only">Reply</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>回复</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <ReplyAll className="h-4 w-4"/>
                <span className="sr-only">Reply all</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>全部回复</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Forward className="h-4 w-4"/>
                <span className="sr-only">Forward</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>转发</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="mx-2 h-6"/>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mail}>
              <MoreVertical className="h-4 w-4"/>
              <span className="sr-only">其他</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDeleteTranslation}>🌐 删除翻译</DropdownMenuItem>
            <DropdownMenuItem onClick={DeleteSelectMailRead}>🤺 标为未读</DropdownMenuItem>
            <DropdownMenuItem>⭐ 星标一下</DropdownMenuItem>
            <DropdownMenuItem>🚫 把它屏蔽</DropdownMenuItem>
            <DropdownMenuItem>🐋 指定回复</DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenReportDrawer}>⛔ 举报它</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator/>
      {showReportDrawer && mail && (
        <ReportDrawer
          mail={{ title: mail.subject, content: mail.text }}
          open={showReportDrawer}
          onClose={handleCloseDrawer}
        />
      )}
      {mail ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mail.name}/>
                <AvatarFallback>{mail.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{mail.name}</div>
                <div className="line-clamp-1 text-xs">{mail.subject}</div>
                <div className="line-clamp-1 text-xs">
                  {
                    mail.name !== '系统消息-周报' && (
                      <span className="font-medium">回复到：</span>
                    )
                  }{mail.email}
                </div>
              </div>
            </div>
            <div>
              {mail.date && (
                <div className="text-xs text-muted-foreground" style={{textAlign: "right"}}>
                  {format(new Date(mail.date), "PPpp", {locale})}
                </div>
              )}
              {/* 在日期下方添加翻译此邮件的链接，保持右对齐 */}
              <div style={{textAlign: "right", marginTop: "4px"}}>
                {!isChinese() && (
                  <a href="#" onClick={handleTranslateClick}
                     className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                    {isTranslated ? '更新翻译' : '翻译此邮件'}
                  </a>
                )}
              </div>
            </div>
          </div>
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <button className="hidden">Open</button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>更新翻译</AlertDialogTitle>
                <AlertDialogDescription>
                  是否确实要更新这封邮件的翻译？此操作将重新翻译邮件内容。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button className="text-black dark:text-white" onClick={() => setIsDialogOpen(false)}>取消</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button onClick={handleUpdateTranslation}>更新翻译</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Separator/>
          {showArchivedUI ? (
            <div className="flex h-full flex-col items-center justify-center">
              <h2 className="mt-10 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">您已经归档啦~</h2>
              {isLoading ? (
                <Button disabled variant="outline">
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  取消归档中
                </Button>
              ) : (
                <Button variant="outline" onClick={() => unarchiveMail(mail.id)}>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  取消归档
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="custom-scroll max-h-[630px] flex-1 overflow-auto overflow-x-hidden whitespace-pre-wrap p-4 text-sm">
                {mail.name === '系统消息-周报' ? (
                  <CustomMailText text={mail.text} date={mail.date} />
                ) : (
                  <>
                  <ReactMarkdown>{mail.text}</ReactMarkdown>
                    <br></br>
                    {translatedText && (
                      <>
                        <br></br>
                        <br></br>
                        <ReactMarkdown>{translatedText}</ReactMarkdown>
                        <br></br>
                        *翻译由人工智能生成 准确性请自行确认
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          )}
          <Separator className="mt-auto"/>
          <div className="p-4">
            <form>
              <div className="grid gap-4">
                <Textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className={`p-4 ${mail && (mail.archive || mail.name === '系统消息-周报') ? 'bg-gray-200 text-gray-500 dark:border dark:bg-white/10' : ''}`}
                  placeholder={mail && mail.name === '系统消息-周报' ? '系统消息不能回复' : `回复 ${mail ? mail.name : ''}...`}
                  disabled={mail && (mail.archive || mail.name === '系统消息-周报')}
                />


                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <ToggleGroup type="multiple" aria-label="Format text">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem value="bold" aria-label="Bold"
                                           disabled={mail && (mail.archive || mail.name === '系统消息-周报')}
                                           onClick={() => handleFormatClick('bold')}>
                            <FontBoldIcon className="h-4 w-4"/>
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>粗体</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem value="italic" aria-label="Italic"
                                           disabled={mail && (mail.archive || mail.name === '系统消息-周报')}
                                           onClick={() => handleFormatClick('italic')}>
                            <FontItalicIcon className="h-4 w-4"/>
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>斜体</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem value="underline" aria-label="Underline"
                                           disabled={mail && (mail.archive || mail.name === '系统消息-周报')}
                                           onClick={() => handleFormatClick('underline')}>
                            <UnderlineIcon className="h-4 w-4"/>
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>下划线</p>
                        </TooltipContent>
                      </Tooltip>


                  {/* 文件上传按钮 */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem value="upload" aria-label="Upload file"
                                       disabled={mail && (mail.archive || mail.name === '系统消息-周报')}
                                       onClick={handleFileUpload}>
                        <PaperClipIcon className="mt-0.5 h-4 w-4"/>
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>上传文件</p>
                    </TooltipContent>
                  </Tooltip>


                </ToggleGroup>
              </TooltipProvider>

                  <AlertDialog open={isUploadModalOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>上传文件</AlertDialogTitle>
                        <AlertDialogDescription>
                          请选择文件进行上传。支持的文件类型包括：.jpg, .png, .doc, .pdf等。
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <Card className="max-w-lg border-2 border-dashed border-gray-500/40 p-4 dark:border-gray-500/40">
                        <CardContent
                          className="flex flex-col items-center justify-center p-4"
                          onDoubleClick={() => {
                            const fileInput = document.getElementById('file-upload');
                            if (fileInput) fileInput.click();
                          }}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                        >
                          {/* 如果没有选中的文件，则显示上传区域，否则显示文件列表 */}
                          {selectedFiles.length > 0 ? (
                            <ul className="max-h-48 max-w-lg overflow-y-auto">
                              {selectedFiles.map((file, index) => (
                                <li key={index} className="flex items-center justify-between p-2">
          <span className="cursor-pointer text-sm" onClick={() => handleFileClick(file)}>
            {file.name}
          </span>
                                  <span className="text-sm">{(file.size / 1024).toFixed(2)} KB</span>
                                  <button onClick={() => handleRemoveFile(file)} className="ml-4 text-red-500">删除
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg"
                                 onClick={() => {
                                   const fileInput = document.getElementById('file-upload');
                                   if (fileInput) fileInput.click();
                                 }}>
                              <PaperClipIcon className="h-8 w-8 text-gray-400"/>
                              <p className="mt-2 text-sm text-gray-600/70">双击或拖动以上传</p>
                            </div>
                          )}
                          <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} multiple/>
                        </CardContent>

                      </Card>


                      <AlertDialogFooter>
                        <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} multiple />
                        <AlertDialogCancel onClick={() => setIsUploadModalOpen(false)}>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={insertLinksIntoText}>插入正文</AlertDialogAction>
                      </AlertDialogFooter>

                    </AlertDialogContent>
                  </AlertDialog>


                  <AlertDialog open={isPreviewOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <div className="flex items-center">
                          <AlertDialogTitle>文件预览</AlertDialogTitle>
                          <div className="ml-2 text-sm text-gray-500">
                            {previewFile && `${formatFileSize(previewFile.size)}`}
                          </div>
                        </div>
                      </AlertDialogHeader>
                      {previewFile && (
                        <div className="relative flex flex-col items-center justify-center">
                          <img
                            src={URL.createObjectURL(previewFile)}
                            alt="Preview"
                            className="max-h-72 max-w-full rounded-lg"
                          />
                          <div className="absolute bottom-2 right-2 text-xs text-default/30">
                            图片内容由您全权负责，我们不承担任何法律责任。
                          </div>
                        </div>
                      )}
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsPreviewOpen(false)}>
                          关闭
                        </AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>




                  <Button
                    onMouseDown={mail && (mail.archive || mail.name === '系统消息-周报') ? undefined : handleButtonPress}
                    onMouseUp={mail && (mail.archive || mail.name === '系统消息-周报') ? undefined : handleButtonRelease}
                    onTouchStart={mail && (mail.archive || mail.name === '系统消息-周报') ? undefined : handleButtonPress}
                    onTouchEnd={mail && (mail.archive || mail.name === '系统消息-周报') ? undefined : handleButtonRelease}
                    size="sm"
                    className={`ml-auto ${mail && (mail.archive || mail.name === '系统消息-周报') ? 'cursor-not-allowed bg-gray-300 text-gray-500 dark:border dark:bg-white/10' : ''}`}
                    onClick={mail && (mail.archive || mail.name === '系统消息-周报') ? undefined : handleSendMailClick}
                    disabled={mail && (mail.archive || mail.name === '系统消息-周报') || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin"/>
                        发送中
                      </>
                    ) : (
                      buttonText
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          <div className="relative flex h-full flex-col overflow-hidden">
            <Separator/>
            <div className="flex items-center p-4">
              <Skeleton className="h-12 w-12 rounded-full"/>
              <div className="ml-4 flex-1">
                <Skeleton className="h-6 w-48 "/>
                <Skeleton className="mt-4 h-4 w-full"/>
                <Skeleton className="mt-4 h-4 w-2/3"/>
              </div>
            </div>
            <Separator/>
            <div className="flex-1 p-4">
              <Skeleton className="h-full"/>
            </div>
            <Separator className="mt-auto"/>
            <div className="p-4">
              <Skeleton className="mt-4 h-20 w-full"/>
              <Skeleton className="mt-4 h-20 w-full"/>
              <Skeleton className="mt-4 h-20 w-full"/>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
