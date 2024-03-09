/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import {ComponentProps, useEffect, useState} from "react"
import formatDistanceToNow from "date-fns/formatDistanceToNow"
import { updateMailReadStatus } from './selectedid';
import { cn } from "@/lib/utils"
import { Badge } from "@/registry/new-york/ui/badge"
import { ScrollArea } from "@/registry/new-york/ui/scroll-area"
import { Separator } from "@/registry/new-york/ui/separator"
import { Mail } from "@/app/content/mail/data"
import { useMail } from "@/app/content/mail/use-mail"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/new-york/ui/context-menu";


interface MailListProps {
  items: Mail[]
}



export const DeleteSelectMailRead = () => {
  const selectedMailId = localStorage.getItem('selectedMailId');
  if (!selectedMailId) {
    console.log('没有选中的邮件');
    return;
  }

  updateMailReadStatus(selectedMailId, false, (success) => {
    if (success) {
      location.reload();
    } else {
      console.log('邮件已读状态更新失败');
    }
  });
};

export function MailList({ items }: MailListProps) {
  const { config, setConfig, mails } = useMail();
  // console.log('原始邮件列表:', items.map(item => ({ id: item.id, archive: item.archive })));
  const [menuKey, setMenuKey] = useState(Date.now());
  const [showArchived, setShowArchived] = useState(false);

  const sortItemsByDate = (a: Mail, b: Mail) => {
    // 将日期字符串转换为 Date 对象
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    // 比较两个日期
    return dateB.getTime() - dateA.getTime();
  };

  const removeHashtags = (text: string, symbols: string[]) => {
    // 使用正则表达式匹配 symbols 中的符号
    const regex = new RegExp(`[${symbols.join("|")}]+`, "g");
    return text.replace(regex, "");
  }

  useEffect(() => {
    const handleArchiveClick = () => {
      setShowArchived(true);
    };

    const handleShowAllMails = () => {
      setShowArchived(false);
    };

    document.addEventListener('archiveClicked', handleArchiveClick);
    document.addEventListener('showAllMails', handleShowAllMails);

    return () => {
      document.removeEventListener('archiveClicked', handleArchiveClick);
      document.removeEventListener('showAllMails', handleShowAllMails);
    };
  }, []);

  const filteredItems = items.filter((item) => showArchived ? item.archive : !item.archive);

  // 使用 removeHashtags 函数去除系统邮件标题和描述中的 ## 和 ### 符号
  filteredItems.forEach((item) => {
    if (item.name === "System") {
      item.name = "系统消息-周报";
      item.subject = removeHashtags(item.subject, ["##", "###"]);
      item.text = removeHashtags(item.text, ["##", "###"]);
    }
  });


  // 使用 sort() 方法对邮件列表进行排序
  filteredItems.sort(sortItemsByDate);
  // console.log('过滤后的邮件列表:', filteredItems.map(item => ({ id: item.id, archive: item.archive })));

  const handleSelectMail = (id: string) => {
    // 更新选中的邮件ID
    setConfig({
      ...config,
      selected: id,
    });
    // 保存选中邮件的ID到localStorage
    localStorage.setItem('selectedMailId', id);
    // 更新邮件的已读状态
    updateMailReadStatus(id, true, (success) => {
      if (success) {
        //  console.log('邮件已读状态更新成功');
      } else {
        console.log('邮件已读状态更新失败');
      }
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <ScrollArea className="h-screen">
          <div className="flex flex-col gap-2 p-4 pt-0">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                  config.selected === item.id && "bg-muted",
                  item.name === "System" || item.name === "系统消息-周报" && "bg-red-500 text-white"
                )}
                onClick={() => handleSelectMail(item.id)}
              >
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{item.name}</div>
                      {!item.read && config.selected !== item.id && (
                        <span className="flex h-2 w-2 rounded-full bg-blue-600"/>
                      )}
                    </div>
                    <div
                      className={cn(
                        "ml-auto text-xs",
                        config.selected === item.id
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatDistanceToNow(new Date(item.date), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <div className="text-xs font-medium">{item.subject}</div>
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {item.text.substring(0, 300)}
                </div>
                {item.labels.length ? (
                  <div className="flex items-center gap-2">
                    {item.labels.map((label) => (
                      <Badge key={label} variant={getBadgeVariantFromLabel(label)}>
                        {label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </ScrollArea>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64 bg-white/70 backdrop-blur-md dark:bg-black/70">
        <ContextMenuItem inset>
          返回
          <ContextMenuShortcut>⌘~</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset>
          重新加载
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>
          没做
          <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>空着</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value="pedro">
          <ContextMenuLabel inset>Admin</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuRadioItem value="pedro">
            没意见吧
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="colm">没意见就好</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
function getBadgeVariantFromLabel(
  label: string
): ComponentProps<typeof Badge>["variant"] {
  if (["发神经"].includes(label.toLowerCase())) {
    return "default"
  }
  if (["系统消息"].includes(label.toLowerCase())) {
    return "destructive"
  }
  if (["shuakami的碎碎念"].includes(label.toLowerCase())) {
    return "outline"
  }

  return "secondary"
}
