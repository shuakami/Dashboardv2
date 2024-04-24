/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import axios from 'axios';
import { performAction } from './action';

export const sendToAPI = async (id: any, description: any) => {
  try {
    const data = {
      max_tokens: 600,
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      top_p: 1,
      presence_penalty: 0,
      messages: [
        {
          role: 'system',
          content: '你的名字是KAMI AI,你可以做很多事情。回答格式比较严格,请严格按照格式进行输出，不要说其他的。如果用户要求归档x天前的邮件,请输出archive[天数],如archive[7]，如果用户想取消x天前的邮件,请输出rearchive[天数]。如果用户要求发送邮件,请输出sendmail[邮件地址][内容]。如果用户要求快速整理x天内的邮件,请输出quick[天数],如quick[7]。'
        },
        {
          role: 'user',
          content: description
        }
      ]
    };

    const response = await axios.post(`${process.env.NEXT_PUBLIC_OPENAI_URL}/v1/chat/completions`, data, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const assistantResponse = response.data.choices[0].message.content;
    console.log(`[API] - GPT-3.5 Response: ${assistantResponse}`);

    // 直接在组件内部传递GPT-3.5的输出给action.tsx
    const actionResponse = await performAction(id, assistantResponse);
    console.log(`[API] - Action Response: ${actionResponse}`);

    // 将 Action 的结果和日志重新发送给 GPT
    let actionData;
    if (assistantResponse.startsWith('quick[')) {
      actionData = {
        max_tokens: 600,
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        top_p: 1,
        presence_penalty: 0,
        messages: [
          {
            role: 'system',
            content: '这是由系统执行后输出的日志,请总结一周的邮件内容,并给出这一周邮件的详细总结。'
          },
          {
            role: 'user',
            content: actionResponse
          }
        ]
      };
    }
    else if (assistantResponse.startsWith('sendmail[')) {
      actionData = {
        max_tokens: 600,
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        top_p: 1,
        presence_penalty: 0,
        messages: [
          ...data.messages,
          {
            role: 'assistant',
            content: assistantResponse
          },
          {
            role: 'system',
            content: actionResponse
          },
          {
            role: 'user',
            content: '这是由系统执行后输出的日志,请给用户解释邮件发送是否成功。'
          }
        ]
      };
    }
    else {
      actionData = {
        max_tokens: 600,
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        top_p: 1,
        presence_penalty: 0,
        messages: [
          ...data.messages,
          {
            role: 'assistant',
            content: assistantResponse
          },
          {
            role: 'system',
            content: actionResponse
          },
          {
            role: 'user',
            content: '这是由系统执行后输出的日志,请给用户解释成功还是失败,还有具体归档了什么。'
          }
        ]
      };
    }



    const actionResponseFromGPT = await axios.post(`${process.env.NEXT_PUBLIC_OPENAI_URL}/v1/chat/completions`, actionData, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const gptResponse = actionResponseFromGPT.data.choices[0].message.content;
    console.log(`[API] - GPT-3.5 Response: ${gptResponse}`);

    return gptResponse;

  } catch (error) {
    console.error(`[API] - Error: ${error}`);
  }
};
