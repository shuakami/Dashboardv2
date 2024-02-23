import axios from 'axios';

const BASE_URL = 'https://xn--7ovw36h.love/api';

export async function deleteMail(id: string, callback: (success: boolean, data?: any) => void): Promise<void> {
  const url = `${BASE_URL}/mails/${id}`;

  try {
    const response = await axios.delete(url);
    console.log("邮件删除成功", response.data);
    callback(true, response.data); // 将成功标志和返回的数据传给回调函数
  } catch (error) {
    console.error("邮件删除失败:", error);
    callback(false); // 只传递失败标志
  }
}
