import axios from 'axios';

let isGeneratingReport = false; // 全局变量作为锁

export const generateAndSubmitReport = async () => {
  if (isGeneratingReport) {
    console.log("Report generation is already in progress.");
    return; // 如果当前已经在生成报告，则直接返回
  }

  isGeneratingReport = true; // 设置锁

  const overviewParams = {
    maskId: "3HelNpBlGrfK32c6",
    accessKey: "xpXGVoKAOj2ZVUMjMqKIME0I1mHeSwZw",
    nonce: "1234",
    timestamp: String(Date.now()), // 当前时间戳
    sign: "xpXGVoKAOj2ZVUMjMqKIME0I1mHeSwZw", // 低安全性校验，直接使用accessKey
  };

  try {
    // 调用基础概况信息获取API
    const overviewResponse = await axios.post('https://v6-open.51.la/open/overview/get', overviewParams, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 从API响应中提取需要的数据
    const {
      curUv, curNewUserCount, curPv, curBounceRate, curAvgDuration,
      beforeUv, beforeNewUserCount, beforePv, beforeBounceRate, beforeAvgDuration,
      monthUv, monthNewUserCount, monthPv, monthBounceRate, monthAvgDuration,
      totalUv, totalNewUserCount, totalPv, totalBounceRate, totalAvgDuration
    } = overviewResponse.data.bean;

    // 构建提示词
    const promptSystem = `生成周报，包含四部分数据分析：今日、昨日对比、本月累计、总计。每部分应包含UV、新访客、PV、跳出率和平均时长。附加线性分析、对比分析和改进方案。格式如下：### 网站数据分析周报 #### 1. 今日数据分析：- UV: [今日UV]...以此类推，把1234都说完。然后来到线性分析、对比分析和改进方案部分按照：线性分析：xxx格式`;
    const promptUser = `今日UV: ${curUv}, 新访客: ${curNewUserCount}, PV: ${curPv}, 跳出率: ${curBounceRate}%, 平均时长: ${curAvgDuration}ms; 昨日对比: UV: ${beforeUv}, 新访客: ${beforeNewUserCount}, PV: ${beforePv}, 跳出率: ${beforeBounceRate}%, 时长: ${beforeAvgDuration}ms; 本月累计: UV: ${monthUv}, 新访客: ${monthNewUserCount}, PV: ${monthPv}, 跳出率: ${monthBounceRate}%, 时长: ${monthAvgDuration}ms; 总计: UV: ${totalUv}, 新访客: ${totalNewUserCount}, PV: ${totalPv}, 跳出率: ${totalBounceRate}%, 时长: ${totalAvgDuration}ms.`;

    const data = {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      messages: [
        {
          role: 'system',
          content: promptSystem
        },
        {
          role: 'user',
          content: promptUser
        }
      ]
    };

    console.log("Sending request data:", data);

    try {
      // 调用OpenAI API
      const response = await axios.post('https://api.openai-hk.com/v1/chat/completions', data, {
        headers: {
          'Authorization': 'Bearer hk-8d4a581000010138775b1a58955c02d8bf41e2fa3bab3291',
          'Content-Type': 'application/json'
        }
      });

      console.log("response:", response.data);

      const textResponse = response.data.choices[0].message.content;
      console.log("Extracted text response:", textResponse);

      const lines = textResponse.split('\n').filter((line: string) => line.trim() !== '');
      const title = lines[0]; // 取第一行作为标题
      const content = lines.slice(1).join('\n'); // 剩下的作为内容
      const date = new Date().toISOString().split('T')[0]; // 使用当前日期作为报告日期

      console.log("Extracted report details:", { title, content, date });

// ST1- 提交周报到后端
      await axios.post('https://xn--7ovw36h.love/api/weekreports', {
        data: {
          title: title,
          content: content,
          date: date,
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Backend submission response:", response.data);

// ST2- 提交邮件通知
      await axios.post('https://xn--7ovw36h.love/api/mails', {
        data: {
          name: "System",//固定
          subject: title,
          text: content,
          date: date,
          email: "system@sdjz.wiki",
          labels:"系统消息,周报"
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Email submission response:", response.data);

    } catch (error) {
      console.error("Error during data fetching or report generation:", error);
    } finally {
      isGeneratingReport = false; // 释放锁
    }
  } catch (error) {
    console.error("Error during overview data fetching:", error);
    isGeneratingReport = false; // 确保在出错时释放锁
  }
};
