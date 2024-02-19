import addDays from "date-fns/addDays"
import addHours from "date-fns/addHours"
import format from "date-fns/format"
import React, { useState, useEffect } from 'react';
import nextSaturday from "date-fns/nextSaturday"
import { enUS, zhCN } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown';
import { franc } from 'franc';

import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from "lucide-react"

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/registry/default/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/new-york/ui/avatar"
import { Button } from "@/registry/new-york/ui/button"
import { Calendar } from "@/registry/new-york/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu"
import { Label } from "@/registry/new-york/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/ui/popover"
import { Separator } from "@/registry/new-york/ui/separator"
import { Switch } from "@/registry/new-york/ui/switch"
import { Textarea } from "@/registry/new-york/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/new-york/ui/tooltip"
import { Mail } from "@/app/content/mail/data"

interface MailDisplayProps {
  mail: Mail | null
}

export function MailDisplay({ mail }: MailDisplayProps) {
  const today = new Date()
  const [buttonText, setButtonText] = useState('发送');
  const [pressTimer, setPressTimer] = useState(null);
  const userPrefLanguage = localStorage.getItem('userLanguage');
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  let locale;
  switch(userPrefLanguage) {
    case 'zh':
      locale = zhCN;
      break;
    default:
      locale = enUS;
  }

  useEffect(() => {
    // 当mail prop发生变化时，清空已翻译的内容
    if (mail) {
      setTranslatedText('');
    }
  }, [mail]);

  const isChinese = () => {
    if (!mail || !mail.text) return false;
    const langCode = franc(mail.text);
    return langCode === 'cmn'; // 'cmn' 是汉语的代码
  };

  const translateMail = async (mailContent: string) => {
    const url = 'https://api.openai-hk.com/v1/chat/completions';
    const headers = {
      'Authorization': 'Bearer hk-8d4a581000010138775b1a58955c02d8bf41e2fa3bab3291',
      'Content-Type': 'application/json'
    };

    const data = {
      model: 'gpt-3.5-turbo',
      temperature: 0.8,
      max_tokens: 1200,
      top_p: 1,
      presence_penalty: 1,
      messages: [{
        role: 'system',
        content: '翻译此内容为符合中国人母语习惯的中文：'
      }, {
        role: 'user',
        content: mailContent
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
              return;
            }

            if (part.startsWith('data: ')) {
              try {
                const jsonStr = part.replace('data: ', '');
                const json = JSON.parse(jsonStr);

                if (json.choices && json.choices.length > 0 && json.choices[0].delta && json.choices[0].delta.content) {
                  const text = json.choices[0].delta.content;
                  setTranslatedText(prevText => prevText + text);
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
    }
  }


  const handleTranslateClick = async () => {
    if (!mail || !mail.text) return;
    await translateMail(mail.text);
  };

  const handleButtonPress = () => {
    const timer = setTimeout(() => {
      setButtonText('静默发送');
    }, 2000); // 设置定时器，2秒后更新按钮文本
    // @ts-ignore
    setPressTimer(timer);
  };

  const handleButtonRelease = () => {
    // @ts-ignore
    clearTimeout(pressTimer); // 如果用户在2秒内释放按钮，则清除定时器
  };

  useEffect(() => {
    // 组件卸载时清理定时器
    return () => {
      if (pressTimer) clearTimeout(pressTimer);
    };
  }, [pressTimer]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Archive className="h-4 w-4" />
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>归档</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <ArchiveX className="h-4 w-4" />
                <span className="sr-only">Move to junk</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>扔了</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>删了</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <Clock className="h-4 w-4" />
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
                    >
                      明天晚点{" "}
                      <span className="ml-auto text-muted-foreground">
                        {format(addHours(today, 4), "E, h:m b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      明天
                      <span className="ml-auto text-muted-foreground">
                        {format(addDays(today, 1), "E, h:m b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      这个周末
                      <span className="ml-auto text-muted-foreground">
                        {format(nextSaturday(today), "E, h:m b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      下周
                      <span className="ml-auto text-muted-foreground">
                        {format(addDays(today, 7), "E, h:m b")}
                      </span>
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <Calendar />
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
                <Reply className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>回复</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <ReplyAll className="h-4 w-4" />
                <span className="sr-only">Reply all</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>全部回复</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Forward className="h-4 w-4" />
                <span className="sr-only">Forward</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>转发</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mail}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">其他</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>🤺 标为未读</DropdownMenuItem>
            <DropdownMenuItem>⭐ 星标一下</DropdownMenuItem>
            <DropdownMenuItem>🚫 把它屏蔽</DropdownMenuItem>
            <DropdownMenuItem>🐋 指定回复</DropdownMenuItem>
            <DropdownMenuItem>⛔ 举报它</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
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
                  <span className="font-medium">回复到：</span>{mail.email}
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
                    翻译此邮件
                  </a>
                )}
              </div>
            </div>
          </div>
          <Separator/>
          <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
            {mail.text}
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
          </div>
          <Separator className="mt-auto"/>
          <div className="p-4">
            <form>
              <div className="grid gap-4">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="p-4"
                  placeholder={`回复 ${mail.name}...
*支持Markdown格式`}
                />
                <ReactMarkdown>{text}</ReactMarkdown>
                <div className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="mute" className="flex cursor-pointer items-center gap-2 text-xs font-normal">
                        <Switch id="mute" aria-label="Mute thread"/>
                        采用更安全的发送方式
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      用于敏感信息发送 会使用更高的加密水平
                    </TooltipContent>
                  </Tooltip>

                  <Button
                    onMouseDown={handleButtonPress} // 鼠标按下事件
                    onMouseUp={handleButtonRelease} // 鼠标释放事件
                    onTouchStart={handleButtonPress} // 触摸开始事件，支持移动设备
                    onTouchEnd={handleButtonRelease} // 触摸结束事件，支持移动设备
                    size="sm"
                    className="ml-auto"
                  >
                    {buttonText} {/* 使用状态变量来显示按钮文本 */}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  )
}
