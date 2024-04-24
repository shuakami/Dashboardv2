/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/registry/new-york/ui/alert-dialog';

// @ts-ignore
const useVerifyUserAgreement = (jwt) => {
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [privacyContent, setPrivacyContent] = useState('');
  const [termsContent, setTermsContent] = useState('');

  useEffect(() => {
    if (!jwt) return;

    const verifyAgreements = async () => {
      try {
        const userInfoResponse = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });

        const { AgreedPrivacy, AgreedTerms } = userInfoResponse.data;
        const resContentsResponse = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/rescontents`, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });

        const { privacyversion, termsversion, termscontent, privacycontent } = resContentsResponse.data;

        if (AgreedPrivacy !== privacyversion) {
          setPrivacyContent(privacycontent);
          setIsPrivacyDialogOpen(true);
        }

        if (AgreedTerms !== termsversion) {
          setTermsContent(termscontent);
          setIsTermsDialogOpen(true);
        }
      } catch (error) {
        console.error('Error verifying user agreements:', error);
      }
    };

    verifyAgreements();
  }, [jwt]);

  const PrivacyAlertDialog = () => (
    <AlertDialog open={isPrivacyDialogOpen} onOpenChange={setIsPrivacyDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>隐私政策更新</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription dangerouslySetInnerHTML={{ __html: privacyContent }} />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsPrivacyDialogOpen(false)}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={() => setIsPrivacyDialogOpen(false)}>我同意</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const TermsAlertDialog = () => (
    <AlertDialog open={isTermsDialogOpen} onOpenChange={setIsTermsDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>服务协议更新</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription dangerouslySetInnerHTML={{ __html: termsContent }} />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsTermsDialogOpen(false)}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={() => setIsTermsDialogOpen(false)}>我同意</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { PrivacyAlertDialog, TermsAlertDialog };
};

export default useVerifyUserAgreement;
