import axios from 'axios';

const BASE_URL = 'https://xn--7ovw36h.love/api';

export async function updateMailReadStatus(id: string, read: boolean, callback: (success: boolean) => void): Promise<void> {
  const url = `${BASE_URL}/mails/${id}`;
  const data = {
    data: {
      // 根据read参数决定设置为"true"还是null
      read: read ? "true" : null,
    },
  };

  console.log(read ? "尝试标记邮件为已读" : "尝试标记邮件为未读", "请求URL:", url);
  console.log("请求体:", JSON.stringify(data, null, 2));

  try {
    const response = await axios.put(url, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    callback(true); // 调用回调函数并传递成功标志
    console.log(read ? "标记为已读成功" : "标记为未读成功", response.data);
  } catch (error) {
    callback(false); // 调用回调函数并传递失败标志
    console.error(read ? "标记为已读失败" : "标记为未读失败:", error);
  }
}
