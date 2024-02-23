import {ComponentProps, useEffect} from "react"
import formatDistanceToNow from "date-fns/formatDistanceToNow"
import { updateMailReadStatus } from './selectedid';
import { cn } from "@/lib/utils"
import { Badge } from "@/registry/new-york/ui/badge"
import { ScrollArea } from "@/registry/new-york/ui/scroll-area"
import { Separator } from "@/registry/new-york/ui/separator"
import { Mail } from "@/app/content/mail/data"
import { useMail } from "@/app/content/mail/use-mail"

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

  const filteredItems = items.filter((item) => !item.archive);

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
        console.log('邮件已读状态更新成功');
      } else {
        console.log('邮件已读状态更新失败');
      }
    });
  };



  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              config.selected === item.id && "bg-muted"
            )}
            onClick={() => handleSelectMail(item.id)}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.name}</div>
                  {/* 修改这里：如果邮件未读且未被选中，则显示未读标志 */}
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
  )
}

function getBadgeVariantFromLabel(
  label: string
): ComponentProps<typeof Badge>["variant"] {
  if (["发神经"].includes(label.toLowerCase())) {
    return "default"
  }

  if (["shuakami的碎碎念"].includes(label.toLowerCase())) {
    return "outline"
  }

  return "secondary"
}
