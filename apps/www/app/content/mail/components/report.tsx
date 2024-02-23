import * as React from "react";
import { Button } from "@/registry/new-york/ui/button";
// @ts-ignore
import CryptoJS from 'crypto-js';
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

interface Mail {
  title: string;
  content: string;
}

interface ReportResult {
  resultMessage: string;
  penaltyDuration: string;
  penaltyReason: string;
  mailTitle: string;
  mailContent: string;
}

// @ts-ignore
export function ReportDrawer({ mail, open, onClose }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [reportResult, setReportResult] = React.useState<ReportResult | null>(null);
  const [showResult, setShowResult] = React.useState(false);

  // 生成基于邮件标题和内容的唯一键
  const generateUniqueKeyForMail = (mail: Mail) => {
    const uniqueString = mail.title + mail.content;
    return `reportResult-${CryptoJS.MD5(uniqueString).toString()}`;
  };

  const saveReportResult = (mail: Mail, reportResult: ReportResult) => {
    const uniqueKey = generateUniqueKeyForMail(mail);
    const encryptedResult = CryptoJS.AES.encrypt(JSON.stringify(reportResult), uniqueKey).toString();
    localStorage.setItem(uniqueKey, encryptedResult);
  };

  const loadReportResult = (mail: Mail) => {
    const uniqueKey = generateUniqueKeyForMail(mail);
    const encryptedResult = localStorage.getItem(uniqueKey);
    if (!encryptedResult) return null;

    // 使用生成的唯一键作为密钥尝试解密
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedResult, uniqueKey);
      const decryptedResult = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedResult) {
        console.error("Decryption failed due to incorrect passphrase.");
        return null;
      }
      const result: ReportResult = JSON.parse(decryptedResult);
      return result;
    } catch (error) {
      console.error("Error decrypting or parsing the result:", error);
      return null;
    }
  };

  React.useEffect(() => {
    const loadedResult = loadReportResult(mail);
    if (loadedResult) {
      setReportResult(loadedResult);
      setShowResult(true);
    }
  }, [mail.title, mail.content]);

  const submitReport = async () => {
    const loadedResult = loadReportResult(mail);
    if (loadedResult) {
      setReportResult(loadedResult);
      setShowResult(true);
      return;
    }

    setIsSubmitting(true);
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
    setReportResult(newReportResult);
    setShowResult(true);
    setIsSubmitting(false);

    saveReportResult(mail, newReportResult);
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md p-4">
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
                <p className="dark:bg-dark mx-auto rounded  p-4 text-sm dark:text-white" style={{maxWidth: '100%'}}>{mail.content}</p>
              </div>
              <DrawerFooter className="mt-6 flex justify-center">
                <div className="flex justify-center space-x-2">
                  <DrawerClose asChild>
                    <Button variant="outline" className="flex-1">取消</Button>
                  </DrawerClose>
                  <Button onClick={submitReport} disabled={isSubmitting} className="flex-1">提交举报</Button>
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
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="violation">违规信息</TabsTrigger>
                <TabsTrigger value="penalty">封号详情</TabsTrigger>
              </TabsList>
              <TabsContent value="violation">
                <Card className="border-none shadow-none">
                  <CardHeader>
                    <CardTitle>违规信息</CardTitle>
                    <CardDescription>
                      这是关于您举报的邮件的处理结果。
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <h2 className="text-2xl font-bold">{reportResult?.resultMessage}</h2>
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
                      <div className="flex h-full flex-col items-center justify-center space-y-4">
                        <h2
                          className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">无违规</h2>
                        <p className="leading-7 [&:not(:first-child)]:mt-6">
                          您举报的内容经过系统评定后，不违反社区规定，不被标记为违规🐳<br className="hidden md:block"/>
                          不过你的请求已经被提交至社区违规数据库，我们会在30天内给你发送回执邮件😿保证不会放过一个漏网之鱼
                        </p>
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200 ">
                        <thead>
                        <tr>
                          <th
                            className="dark:bg-dark px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white">
                            详情项
                          </th>
                          <th
                            className="dark:bg-dark px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white">
                            信息
                          </th>
                        </tr>
                        </thead>
                        <tbody className="dark:bg-dark divide-y divide-gray-200 dark:text-white">
                        <tr>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            封号时长
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-white">
                            {reportResult?.penaltyDuration}
                          </td>
                        </tr>
                        <tr>
                          <td className="whitespace-nowrap px-6 py-4 text-sm  font-medium text-gray-900 dark:text-white">
                            封号原因
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm  text-gray-500 dark:text-white">
                            {reportResult?.penaltyReason}
                          </td>
                        </tr>
                        </tbody>
                      </table>
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
        content: '请判断以下内容是否违规，并注意区分违规的严重性。对于不文明用语、脏话，不会导致封号（封号时长为0天）。只有严重违规行为，才会导致封号。请严格按照以下格式回复：违规/不违规|[具体违规内容]|[违规原因]|[封号时长]'
      },
      {
        role: 'user',
        content: text
      }
    ]
  };

  try {
    const response = await axios.post(url, JSON.stringify(data), {headers});
    console.log("GPT Response:", response.data);
    const labels = response.data.choices[0].message.content;
    return labels;
  } catch (error) {
    console.error("在判断违规的时候报错了:", error);
    return '';
  }
}
