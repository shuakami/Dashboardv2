/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */


// content/docs/CommitsList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// 定义提交对象的类型
interface CommitDetail {
  files: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    patch: string; // 具体的diff信息
  }>;
}

interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  url: string; // 指向单个提交API的URL
}


const CommitsList: React.FC = () => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [commitDetails, setCommitDetails] = useState<{[key: string]: CommitDetail}>({});

  useEffect(() => {
    const repo = 'shuakami/Dashboardv2';
    const url = `https://api.github.com/repos/${repo}/commits`;
    const fetchCommits = async () => {
      try {
        const response = await axios.get<Commit[]>(url, {
          headers: {
            'Authorization': `token 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`
          }
        });
        setCommits(response.data);

        // 对每个提交获取更详细信息
        response.data.forEach(async (commit) => {
          const detailResponse = await axios.get<CommitDetail>(commit.url, {
            headers: {
              'Authorization': `token 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`
            }
          });

          setCommitDetails(prevDetails => ({
            ...prevDetails,
            [commit.sha]: detailResponse.data
          }));
        });
      } catch (error) {
        console.error('GitHub API 请求失败: ', error);
      }
    };

    fetchCommits();
  }, []);




  return (
    <div>
      <h2>仓库提交日志</h2>
      <ul>
        {commits.map(commit => (
          <li key={commit.sha}>
            <p><strong>作者:</strong> {commit.commit.author.name}</p>
            <p><strong>日期:</strong> {new Date(commit.commit.author.date).toLocaleString()}</p>
            <p><strong>消息:</strong> {commit.commit.message}</p>
            {commitDetails[commit.sha] && (
              <div>

                <ul>
                  {commitDetails[commit.sha].files.map((file, index) => (
                    <li key={index}>

                      {/* 下面的行可能需要根据你的实际需求来展示或隐藏 */}
                      {/* <p>变化: {file.changes}</p> */}
                      {/* <p>差异: <pre>{file.patch}</pre></p> */}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommitsList;
