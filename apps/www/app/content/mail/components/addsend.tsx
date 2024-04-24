/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import { Button } from "@/registry/new-york/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/new-york/ui/dialog"
import { Input } from "@/registry/new-york/ui/input"
import { Label } from "@/registry/new-york/ui/label"
import {useEffect, useState} from "react";
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import '@/styles/transitions.css';
import {Textarea} from "@/registry/new-york/ui/textarea";
import sendMail from './send';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { setupAxiosInterceptors } from '@/app/setupAxiosInterceptors';

setupAxiosInterceptors();
// @ts-ignore
import Cookies from 'js-cookie';
import {toast} from "@/registry/new-york/ui/use-toast";
import {useMail} from "@/app/content/mail/use-mail";

export function AddSend() {
  const [step, setStep] = useState(1);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [hasSent, setHasSent] = useState(false); // 新增状态标记是否发送
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const { mails, refreshMails } = useMail();

  useEffect(() => {
    const shouldAskToRestore = Cookies.get('shouldAskToRestore') !== 'false';
    const savedData = Cookies.get('formState');
    if (savedData && shouldAskToRestore) {
      const { to, subject, content } = JSON.parse(savedData);
      if (window.confirm('想恢复上次留下的数据吗？')) {
        setTo(to);
        setSubject(subject);
        setContent(content);
      } else {
        Cookies.remove('formState');
      }
      Cookies.set('shouldAskToRestore', 'false'); // 设置为false，表示不再询问
    }
  }, []);

  const handleSend = async () => {
    setIsSending(true);
    const mailOptions = {
      text: content,
      emailAddress: 'no@sdjz.wiki',
      username: to,
      ccId: uuidv4(),
      isFromAddSend: true, // 标识这是来自AddSend的请求,让他破例
      currentViewingMailTitle: subject
    };

    await sendMail(mailOptions, (success) => {
      setIsSending(false); // 发送完成后，标记为非发送状态
      if (success) {
        refreshMails();
        console.log('邮件发送成功');
        setHasSent(true);
        setIsOpen(false); // 关闭对话框
        toast({
          title: "发送成功",
          description: "宝贝！投递成功啦！🎉",
          duration: 3000,
        });
        Cookies.remove('formState');
      } else {
        console.error('邮件发送失败');
        toast({
          title: "发送失败",
          description: "可以检查一下内容是否正确哦",
          duration: 5000,
        });
      }
    });
  };

  const handleDialogClose = () => {
    if (!hasSent) {
      const formData = { to, subject, content };
      Cookies.set('formState', JSON.stringify(formData), { expires: 7 });
    }
    setStep(1);
    Cookies.set('shouldAskToRestore', 'true'); // 重置，允许下次询问
    setHasSent(false); // 重置发送标记
    setIsOpen(false);
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDialogClose()}>      <DialogTrigger asChild>
        <Button variant="outline">发送邮件</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>发送邮件</DialogTitle>
          <DialogDescription>
            {step === 1 ? "顾名思义，自己发送邮件。" : "顾名思义，填写邮件内容。"}
          </DialogDescription>
        </DialogHeader>
        <SwitchTransition>
          <CSSTransition
            key={step}
            timeout={300}
            classNames="fade"
            unmountOnExit
          >
            {step === 1 ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="to" className="text-right">
                    收件人
                  </Label>
                  <Input id="username" placeholder="请输入收件人用户名" className="col-span-3" value={to}
                         onChange={(e) => setTo(e.target.value)}/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="col-span-1 text-right">
                    主题
                  </Label>
                  <Input id="subject" placeholder="请输入邮件主题" className="col-span-3" value={subject}
                         onChange={(e) => setSubject(e.target.value)}/>
                </div>
                <DialogFooter>
                  <Button onClick={() => setStep(2)}>下一步</Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <Textarea placeholder="请输入邮件内容" value={content} onChange={(e) => setContent(e.target.value)}/>
                </div>
                <DialogFooter>
                  <Button onClick={() => setStep(1)} disabled={isSending}>返回上一步</Button>
                  <Button onClick={handleSend} type="submit" disabled={isSending}>发送</Button>
                </DialogFooter>
              </div>
            )}
          </CSSTransition>
        </SwitchTransition>
      </DialogContent>
    </Dialog>
  );
}
