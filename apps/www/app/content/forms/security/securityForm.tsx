/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// @ts-ignore
import Cookies from 'js-cookie';
import ChevronDown from "@radix-ui/react-icons";
import { toast } from '@/registry/new-york/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/registry/new-york/ui/form';
import {Button} from "@/registry/new-york/ui/button";
import {FormDescription} from "@/registry/default/ui/form";
import {Switch} from "@/registry/new-york/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/registry/new-york/ui/alert-dialog";




const securityFormSchema = z.object({
  securitypolicy: z.enum(['none','low', 'medium', 'high', 'neurotic', 'default'], {
    required_error: 'You need to select a security level.',
  }),
});


type SecurityFormValues = z.infer<typeof securityFormSchema>;

export function SecurityForm() {
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null); // 用于保存用户ID
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isNeuroticAlertDialogOpen, setIsNeuroticAlertDialogOpen] = useState(false);


  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      securitypolicy: 'default', // Assume 'default' as the fallback
    },
  });

  const policyDescriptions = {
    low: "低安全防护策略仅提供基本的安全保护。",
    medium: "中等安全防护策略提供加强的安全保护，适用于大多数用户。",
    high: "高安全防护策略提供最强的安全保护，适合安全要求极高的环境。",
    neurotic: "神经病级别的安全防护，为你提供最极端的安全措施。",
    none: "无安全防护策略将不提供任何安全保护。",
  };


  const handlePolicyChange = (policy: string) => {
    if (policy === "none") {
      setIsAlertDialogOpen(true);
    } else {
      form.setValue("securitypolicy", policy as SecurityFormValues['securitypolicy']);
    }
  };

  const handleConfirmPolicyChange = () => {
    form.setValue("securitypolicy", "none");
    setIsAlertDialogOpen(false);
  };



  type LoginRecord = {
    attributes: {
      date: string;
      ip: string;
      country: string;
      province: string;
      city?: string;
      response: string;
      fingerprint: string;
    };
  };

  const [loginRecords, setLoginRecords] = useState<LoginRecord[]>([]);


  useEffect(() => {
    const fetchLoginRecords = async () => {
      try {
        const response = await axios.get('/api/getrecord', {
          headers: { Authorization: `Bearer ${Cookies.get('jwt')}` },
        });
        setLoginRecords(response.data);
      } catch (error) {
        console.error('Error fetching login records:', error);
      }
    };

    fetchLoginRecords();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const jwt = Cookies.get('jwt');
      if (jwt) {
        try {
          const { data } = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });
          setUserId(data.id); // 保存用户ID
          setUserData(data);
          // 确保当securitypolicy为null或未定义时，默认为"medium"
          const securityPolicy = data.securitypolicy || "medium";
          form.reset({
            securitypolicy: securityPolicy,
          });
        } catch (error) {
          console.error('Failed to fetch user data', error);
        }
      }
    };
    fetchUserData();
  }, [form]);



  const onSubmit = async (data: SecurityFormValues) => {
    const jwt = Cookies.get('jwt');
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${userId}`, data, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      toast({ title: 'security settings updated successfully.' });
    } catch (error) {
      console.error('Failed to update security settings', error);
      toast({ title: 'Error updating security settings', description: 'An error occurred while updating your security settings. Please try again later.' });
    }
  };

  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)} className="scrollbar-width-none scrollbar-color-transparent -webkit-scrollbar mx-auto h-screen max-w-4xl space-y-8  overflow-y-auto">
        {/* 安全策略选择部分 */}
        <FormItem className="space-y-1">
        <FormLabel>SecurityPolicy</FormLabel>
        <FormDescription>
          调整你的账号安全策略
        </FormDescription>
        </FormItem>
        {["none","low", "medium", "high", "neurotic"].map((policy) => (
          <div key={policy} className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">{policy.charAt(0).toUpperCase() + policy.slice(1)} level</FormLabel>
              <FormDescription>
                {policyDescriptions[policy as keyof typeof policyDescriptions]}
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={form.watch("securitypolicy") === policy}
                onCheckedChange={() => {
                  if (policy === "neurotic") {
                    setIsNeuroticAlertDialogOpen(true);
                  } else if (policy === "none") {
                    setIsAlertDialogOpen(true);
                  } else {
                  form.setValue("securitypolicy", policy as SecurityFormValues['securitypolicy']);
                }
                  }
                }
              />
            </FormControl>
          </div>
        ))}



        {/* UI表格展示登录记录 */}
        <FormItem className="ml-1 space-y-1">
          <FormLabel>SecurityHistory</FormLabel>
          <FormDescription>
            {form.watch("securitypolicy") === "none" ?
              "如果你开启了无安全防护策略，这里将不再记录登录历史记录。" :
              "这是你的登录历史记录，仅展示最新的15条记录。"
            }
          </FormDescription>
          <FormDescription>
            表格下方是有滚动框给你移动的
          </FormDescription>
        </FormItem>
        <div className="mt-8 overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y ">
            <thead>
            <tr>
              <th scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider">
                Date
              </th>
              <th scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider">
                IP
              </th>
              <th scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider">
                Location
              </th>
              <th scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider">
                Response
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider">
                Fingerprint
              </th>
            </tr>
            </thead>
            <tbody className=" divide-y ">
            {loginRecords.map((record, index) => (
              <tr key={index}>
                <td className="whitespace-nowrap px-6 py-4 text-sm ">
                  {new Date(record.attributes.date).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm ">
                  {record.attributes.ip}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm ">
                  {`${record.attributes.country}, ${record.attributes.province}${record.attributes.city ? `, ${record.attributes.city}` : ''}`}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {
                    // 使用可选链操作符和逻辑或来避免null或undefined值
                    (record.attributes.response?.split('|')[1] || record.attributes.response || "无记录")
                  }
                </td>
                <td className="px-6 py-4 text-sm ">
                  {record.attributes.fingerprint}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>



        <AlertDialog open={isNeuroticAlertDialogOpen} >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>你正在切换到神经病级别安全策略</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
             <p className="text-red-600"><strong> 选择“神经病级别”安全策略可能会导致您永远无法登录您的账户。</strong></p>请仔细考虑这一决定的后果，不要出于好奇或娱乐目的选择这一选项。如果您选择继续，我们将不承担由此引起的任何后果或损失的责任。
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsNeuroticAlertDialogOpen(false)}>取消</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                form.setValue("securitypolicy", "neurotic");
                setIsNeuroticAlertDialogOpen(false);
              }}>确认选择</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


        <AlertDialog open={isAlertDialogOpen} >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>你正在切换到无防护策略</AlertDialogTitle>
              <AlertDialogDescription>
                选择“无”防护策略意味着你的账户将<strong>不会有任何额外的安全保护措施</strong>。这可能使你的账户面临更高的安全风险。
              </AlertDialogDescription>
              <AlertDialogDescription>
                在继续之前，请确认你已经完全理解并接受所有可能的后果。<strong>我们不对因使用无防护策略而可能导致的任何安全问题或损失承担责任</strong>。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsAlertDialogOpen(false)}>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmPolicyChange}>确认选择</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button type="submit" className="mt-4">Update Security Settings</Button>
      </form>
    </Form>
  );
}
