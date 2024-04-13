/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import * as React from "react";
import { Button } from "@/registry/new-york/ui/button";
// @ts-ignore
import CryptoJS from 'crypto-js';
import Loading from "@/app/content/mail/loading";
import { Check } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/new-york/ui/alert"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/registry/new-york/ui/drawer";
import { Shield } from 'lucide-react';
import {toast, useToast} from "@/registry/new-york/ui/use-toast";
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/new-york/ui/tabs";
import Link from "next/link";
import {useEffect, useState} from "react";
import {ReloadIcon} from "@radix-ui/react-icons";

import { setupAxiosInterceptors } from '@/app/setupAxiosInterceptors';

setupAxiosInterceptors();

interface Mail {
  title: string;
  content: string;
}

interface ReportResult {
  reportId?: string;
  resultMessage: string;
  penaltyDuration: string;
  penaltyReason: string;
  mailTitle: string;
  mailContent: string;
  // 新增字段
  manualReviewComments: string;
  manualReviewpenaltyDuration: string;
  manualpenaltyReason: string;
}



// @ts-ignore
export function ReportDrawer({ mail, open, onClose }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [reportResult, setReportResult] = React.useState<ReportResult | null>(null);
  const [showResult, setShowResult] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showPenaltyReason, setShowPenaltyReason] = useState(false);


  // 生成基于邮件标题和内容的唯一键
  const generateUniqueKeyForMail = (mail: Mail) => {
    const uniqueString = mail.title + mail.content;
    return `reportResult-${CryptoJS.MD5(uniqueString).toString()}`;
  };

  const saveReportResult = async (mail: Mail, reportResult: ReportResult) => {
    const uniqueKey = generateUniqueKeyForMail(mail);
    const data = {
      data: {
        reportId: uniqueKey,
        mailId: uniqueKey, // Assuming mailId is the same as reportId in this context
        title: mail.title,
        content: mail.content,
        date: new Date().toISOString(),
        reportedAt: null,
        resultMessage: reportResult.resultMessage,
        penaltyDuration: reportResult.penaltyDuration,
        penaltyReason: reportResult.penaltyReason,
      }
    };

    try {
      const response = await axios.post(`https://xn--7ovw36h.love/api/reports`, data);
      console.log("API Response:", response.data);
    } catch (error) {
      console.error("Error sending report result to API:", error);
    }
  };



  const loadReportResult = async (mail: Mail) => {
    const uniqueKey = generateUniqueKeyForMail(mail);
    try {
      const response = await axios.get(`https://xn--7ovw36h.love/api/reports`, {
        params: {
          "filter[reportId]": uniqueKey
        }
      });
      const results = response.data.data;

      const matchedResult = results.find((result: { attributes: { reportId: string; }; }) => result.attributes.reportId === uniqueKey);
      if (!matchedResult) {
        return null;
      }

      // 解析额外的人工复审字段
      const manualReviewComments = matchedResult.attributes.manualReviewComments || '';
      const manualReviewpenaltyDuration = matchedResult.attributes.manualReviewpenaltyDuration || '';
      const manualpenaltyReason = matchedResult.attributes.manualpenaltyReason || '';

      // 根据人工复审的评论判断人工是否认可AI的处理结果
      let manualReviewApproved = false;
      if (manualReviewComments.toLowerCase() === '认可') {
        manualReviewApproved = true;
      } else if (manualReviewComments.toLowerCase() === '无违规') {
        manualReviewApproved = true; // 如果人工写的是无违规，也视为认可，但不会有封号时长和原因
      } else if (!manualReviewComments || manualReviewComments.toLowerCase() === '未处理') {
        // 如果manualReviewComments为空或者其他值，表示人工没有看到，保持AI的处理结果
        manualReviewApproved = true;
      }

      return {
        reportId: matchedResult.attributes.reportId,
        resultMessage: matchedResult.attributes.resultMessage,
        penaltyDuration: matchedResult.attributes.penaltyDuration,
        penaltyReason: matchedResult.attributes.penaltyReason,
        mailTitle: matchedResult.attributes.title,
        mailContent: matchedResult.attributes.content,
        manualReviewComments,
        manualReviewpenaltyDuration: (manualReviewComments.toLowerCase() === '违规' || manualReviewApproved) ? manualReviewpenaltyDuration : '',
        manualpenaltyReason: (manualReviewComments.toLowerCase() === '违规' || manualReviewApproved) ? manualpenaltyReason : ''
      };

    } catch (error) {
      console.error("Error loading report result from API:", error);
      return null;
    }
  };

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const fetchData = async () => {
      setIsLoading(true);
      const loadedResult = await loadReportResult(mail);
      if (loadedResult) {
        setReportResult(loadedResult);
        setShowResult(true);
      }

      // 添加延时
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };

    fetchData();

    // 清除定时器（在组件卸载时避免内存泄漏）
    return () => clearTimeout(timer);
  }, [mail.title, mail.content]);



  async function submitReport() {
    setIsSubmitting(true); // 开始提交前，标记为正在提交

    try {
      const loadedResult = await loadReportResult(mail); // 确保等待加载结果
      if (loadedResult) {
        setReportResult(loadedResult);
        setShowResult(true);
      } else {
        // 如果没有加载到结果，继续处理提交逻辑
        const labels = await generateLabels(mail.title + " " + mail.content);
        let resultMessage = '';
        let penaltyDuration = '';
        let penaltyReason = '';

        if (labels.startsWith("违规")) {
          resultMessage = "违规";
          const details = labels.split("|");
          if (details.length > 3) {
            penaltyDuration = details[3];
            penaltyReason = "字段" + details[1] + " - " + details[2];
          } else {
            resultMessage = "违规，但未提供详细信息。";
          }
          toast({
            title: "已确认违规",
            description: "宝贝！已确认违规！将提交至社区违规数据库，我们会在30天内给你发送回执邮件😿",
          });
        } else if (labels.startsWith("不违规")) {
          resultMessage = "不违规";
          toast({
            title: "不违规",
            description: "宝贝！经过系统检测后不违规哦！不过你的请求提交至社区违规数据库，我们会在30天内给你发送回执邮件😿 保证不会放过一个漏网之鱼",
          });
        } else {
          resultMessage = "无法确定内容是否违规，请稍后再试。";
        }

        const newReportResult = { resultMessage, penaltyDuration, penaltyReason, mailTitle: mail.title, mailContent: mail.content };
        // @ts-ignore
        setReportResult(newReportResult);
        setShowResult(true);
        await saveReportResult(mail, newReportResult as ReportResult);
      }
    } catch (error) {
      console.error("提交举报时发生错误:", error);
    }

    setIsSubmitting(false); // 结束提交处理，重置提交状态
  }

  // @ts-ignore
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md p-4">
          {isLoading || isFadingOut ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '240px',
              position: 'relative' // 相对定位
            }} className={isFadingOut ? 'fadeOut' : ''}>
              <Loading/>
            </div>
          ) : (
            <>
              <DrawerHeader>
                <DrawerTitle className="text-center">举报</DrawerTitle>
                {!showResult && (
                  <DrawerDescription className="mt-2 text-center">
                    您正在举报一封邮件 请确认以下信息无误后提交
                    <br></br>
                    我们可能会使用您和他人的对话内容来判断是否涉嫌违规
                  </DrawerDescription>
                )}
              </DrawerHeader>
              {!showResult ? (
                <>
                  <div className="mt-6">
                    <div className="mb-4 text-center text-lg font-semibold">{mail.title}</div>
                    <p className="custom-scroll dark:bg-dark mx-auto max-h-[330px] flex-1 overflow-auto overflow-x-hidden whitespace-pre-wrap rounded  p-4 text-sm dark:text-white"
                       style={{maxWidth: '100%'}}>{mail.content}</p>
                  </div>
                  <DrawerFooter className="mt-6 flex justify-center">
                    <div className="flex justify-center space-x-2">
                      <DrawerClose asChild>
                        <Button variant="outline" className="flex-1">取消</Button>
                      </DrawerClose>
                      {isSubmitting ? (
                        <>
                          <Button disabled className="flex-1">
                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin"/>
                            提交中
                          </Button>
                        </>
                      ) : (
                        <Button onClick={submitReport} disabled={isSubmitting} className="flex-1">提交举报</Button>
                      )}
                    </div>
                  </DrawerFooter>
                  <div
                    className="absolute bottom-4 right-4 flex items-center space-x-2 text-sm text-neutral-400 dark:text-neutral-700">
                    <Shield size={16}/>
                    <span>ByteFreeze安全 V1.0.3</span>
                  </div>
                </>
              ) : (
                <Tabs defaultValue="violation" className="mx-auto w-full max-w-4xl">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="violation">违规信息</TabsTrigger>
                    <TabsTrigger value="penalty">封号详情</TabsTrigger>
                    <TabsTrigger value="manualReview">人工复审</TabsTrigger>
                  </TabsList>
                  <TabsContent value="manualReview">
                    <Card className="border-none shadow-none">
                      <CardHeader>
                        <CardTitle>人工复审结果</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {reportResult?.manualReviewComments === "认可" && (
                          <div className="flex h-full flex-col items-center justify-center space-y-4">
                            <h2
                              className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">人工已复审</h2>
                            <p className="leading-7 [&:not(:first-child)]:mt-6">
                              此举报请求已经维持原判，具体可切换 封号详情 查看🐳
                            </p>
                          </div>
                        )}
                        {reportResult?.manualReviewComments === "不违规" && (
                          <div className="flex h-full flex-col items-center justify-center space-y-4">
                            <h2
                              className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">无违规</h2>
                            <p className="leading-7 [&:not(:first-child)]:mt-6">
                              如您有更多意见，如申请再次复查可发送邮箱至🌟
                              <a href="mailto:admin@sdjz.wiki"
                                 className="text-blue-500 underline">admin@sdjz.wiki</a>🌟
                            </p>
                          </div>
                        )}
                        {reportResult?.manualReviewComments === "违规" && (
                          <div className="flex h-full flex-col items-center justify-center space-y-4">
                            <h2
                              className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">违规</h2>
                            <p className="leading-7 [&:not(:first-child)]:mt-6">

                              <table>
                                <tbody className="dark:bg-dark divide-y divide-gray-200 dark:text-white">
                                <tr>
                                  <td
                                    className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                    封号时长
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-white">
                                    {reportResult?.manualpenaltyReason}
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    className="whitespace-nowrap px-6 py-4 text-sm  font-medium text-gray-900 dark:text-white">
                                    封号原因
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm  text-gray-500 dark:text-white">
                                    {reportResult.manualReviewpenaltyDuration}
                                  </td>
                                </tr>
                                </tbody>
                              </table>
                            </p>
                          </div>
                        )}
                        {(!reportResult?.manualReviewComments || reportResult?.manualReviewComments !== "认可" && reportResult?.manualReviewComments !== "违规" && reportResult?.manualReviewComments !== "不违规") && (
                          <div className="flex h-full flex-col items-center justify-center space-y-4">
                            <h2
                              className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">已提交复审</h2>
                            <p className="leading-7 [&:not(:first-child)]:mt-6">
                              人工复审尚未完成或未查看此举报请求。
                            </p>
                          </div>
                        )}
                        <div
                          className="absolute bottom-4 right-4 flex items-center text-sm text-neutral-400 dark:text-neutral-700"
                          style={{alignItems: 'center', justifyContent: 'flex-end'}}
                        >
                          <div style={{textAlign: 'right', fontSize: '12px'}}>
                            ByteFreeze审核<br/>
                            {reportResult?.reportId}
                            <Check size={12}  className="float-left mb-2.5"/>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="violation">
                    <Card className="border-none shadow-none">
                      <CardHeader>
                        <CardTitle>违规信息</CardTitle>
                        <CardDescription>
                          这是关于您举报的邮件的处理结果。
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {reportResult && (
                          reportResult.manualReviewComments && reportResult.manualReviewComments.toLowerCase() !== "认可" ? (
                            <h2 className="text-2xl font-bold">
                              人工复审-{reportResult.manualReviewComments}
                            </h2>
                          ) : (
                            <h2 className="text-2xl font-bold">{reportResult.resultMessage}</h2>
                          )
                        )}
                      </CardContent>

                      <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-sm text-neutral-400 dark:text-neutral-700">
                        <Shield size={16}/>
                        <span>ByteFreeze安全 V1.0.3</span>
                      </div>
                    </Card>
                  </TabsContent>
                  <TabsContent value="penalty">
                    <Card className="border-none shadow-none">
                      <CardHeader>
                        <CardTitle>封号详情</CardTitle>
                      </CardHeader>
                      {(reportResult?.penaltyDuration === '0天' || reportResult?.penaltyDuration === '零天') && (
                        <Alert className="ml-8 max-w-80">
                          <Shield className="h-4 w-4" />
                          <AlertTitle>小贴士</AlertTitle>
                          <AlertDescription>
                            封号时长为0天是因为违规等级构不成封号标准。具体可看
                            <Link href="/report" style={{ textDecoration: 'underline' }}>
                              举报政策
                            </Link>
                          </AlertDescription>
                        </Alert>
                      )}
                      <CardContent>
                        {reportResult?.resultMessage.includes("不违规") ? (
                          <div className="flex h-full flex-col items-center justify-center space-y-4"
                               style={reportResult?.manualReviewComments && reportResult.manualReviewComments.toLowerCase() === "违规" ? { textDecoration: "line-through" } : {}}>
                            <h2
                              className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">无违规</h2>
                            <p className="leading-7 [&:not(:first-child)]:mt-6">
                              您举报的内容经过系统评定后，不违反社区规定，不被标记为违规🐳<br className="hidden md:block"/>
                              不过你的请求已经被提交至社区违规数据库，我们会在30天内给你发送回执邮件😿保证不会放过一个漏网之鱼
                            </p>
                          </div>
                        ) : (
                          <tbody className="dark:bg-dark divide-y divide-gray-200 dark:text-white">
                          <tr>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              封号时长
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-white">
                              {/* 如果有人工复审的违规或不违规意见，则提示查看人工复审结果，否则显示封号时长 */}
                              {reportResult?.manualReviewComments && reportResult.manualReviewComments.toLowerCase() !== "认可" ? (
                                "请查看人工复审结果Tab"
                              ) : (
                                reportResult?.penaltyDuration
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              封号原因
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-white">
                              {/* 同上，根据人工复审意见调整显示内容 */}
                              {reportResult?.manualReviewComments && reportResult.manualReviewComments.toLowerCase() !== "认可" ? (
                                "请查看人工复审结果Tab"
                              ) : (
                                <>
                                  {/* 判断 penaltyReason 长度决定是否显示按钮 */}
                                  {(typeof reportResult?.penaltyReason === 'string' && reportResult.penaltyReason.trim().length > 6) ? (
                                    !showPenaltyReason && (
                                      <button onClick={() => setShowPenaltyReason(true)}>
                                        点我查看
                                      </button>
                                    )
                                  ) : (
                                    <div>
                                      {reportResult?.penaltyReason}
                                    </div>
                                  )}
                                  {/* 根据 showPenaltyReason 控制详情的显示与隐藏 */}
                                  {showPenaltyReason && (
                                    <div style={{ display: showPenaltyReason ? 'block' : 'none' }}>
                                      {reportResult?.penaltyReason}
                                    </div>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                          </tbody>
                        )}
                        <div
                          className="absolute bottom-4 right-4 flex items-center space-x-2 text-sm text-neutral-400 dark:text-neutral-700">
                          <Shield size={16}/>
                          <span>ByteFreeze安全 V1.0.3</span>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

async function generateLabels(text: string): Promise<string> {
  const url = 'https://api.openai-hk.com/v1/chat/completions';
  const headers = {
    'Authorization': 'Bearer hk-8d4a581000010138775b1a58955c02d8bf41e2fa3bab3291',
    'Content-Type': 'application/json'
  };

  const data = {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 60,
    top_p: 1,
    presence_penalty: 1,
    messages: [
      {
        role: 'system',
        content: '请判断以下内容是否违规，并注意区分违规的严重性。对于不文明用语、脏话，不会导致封号（封号时长为0天）。只有严重违规行为，才会导致封号。请严格按照以下格式回复，不要少掉一个：违规/不违规|[具体违规内容]|[违规原因]|[封号时长]'
      },
      {
        role: 'user',
        content: text
      }
    ]
  };

  try {
    const response = await axios.post(url, JSON.stringify(data), {headers});
    // console.log("Response:", response.data);
    const labels = response.data.choices[0].message.content;
    return labels;
  } catch (error) {
    //  console.error("在判断违规的时候报错了:", error);
    return '';
  }
}
