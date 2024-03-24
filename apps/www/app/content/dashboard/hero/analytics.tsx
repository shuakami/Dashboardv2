/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// @ts-ignore
import * as d3 from 'd3';
import { format } from 'date-fns';
import { useResizeObserver } from 'usehooks-ts';
// @ts-ignore
import debounce from "lodash/debounce";
import ScanLightLogo from "@/app/content/mail/loading"
// @ts-ignore
import Cookies from 'js-cookie';
import { CSSTransition } from 'react-transition-group';
// @ts-ignore
import md5 from 'md5';

function getMD5(data: { hour: string; visits: number; }[]) {
  return md5(JSON.stringify(data));
}


function WebsiteHourlyTraffic() {
  const [data, setData] = useState([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // @ts-ignore
  const { width } = useResizeObserver({ ref: wrapperRef });


  useEffect(() => {
    const fetchData = async () => {
      const cachedData = Cookies.get('hourlyTrafficData');
      if (cachedData) {
        const { data, timestamp, hash } = JSON.parse(cachedData);
        setData(data);
        const currentHash = getMD5(data);
        if (Date.now() - timestamp < 30000 && hash === currentHash) {
          setData(data);
          return; // 如果缓存数据未过期且哈希值匹配,则直接返回,不再发送请求
        }
      }

      const response = await axios.post('https://analytics.sdjz.wiki/index.php', new URLSearchParams({
        'module': 'API',
        'method': 'Live.getLastVisitsDetails',
        'idSite': '1',
        'period': 'day',
        'date': 'today',
        'format': 'JSON',
        'token_auth': '55a0bf3079809e9e2719dfbc580751e6',
        'filter_limit': '-1'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });


   // 获取8小时前的时间戳
      const startOfPeriod = new Date();
      startOfPeriod.setHours(startOfPeriod.getHours() - 8, 0, 0, 0);
      const startOfPeriodTimestamp = startOfPeriod.getTime();

   // 过滤数据,只保留最近8小时的访问记录
      const filteredVisits = response.data.filter((visit: { actionDetails: any[]; }) =>
        visit.actionDetails.some(action => {
          // 将时间戳转换为Date对象并手动减去8小时
          const actionTime = new Date(action.timestamp * 1000 - (8 * 60 * 60 * 1000));
          return actionTime.getTime() >= startOfPeriodTimestamp;
        })
      );

    // 找到第一个有数据的时间点
      let firstDataPoint: number | Date | null = null;
      for (const visit of filteredVisits) {
        for (const action of visit.actionDetails) {
          const actionTime = new Date(action.timestamp * 1000 - (8 * 60 * 60 * 1000));
          if (!firstDataPoint || actionTime < firstDataPoint) {
            firstDataPoint = actionTime;
          }
        }
      }

    // 如果没有数据点,则直接返回空数组
      if (!firstDataPoint) {
        setData([]);
        return;
      }

    // 计算有数据的时间段长度(以分钟为单位)
      const dataPointsCount = Math.ceil((new Date().getTime() - firstDataPoint.getTime()) / (60 * 1000));

    // 初始化每分钟的活动计数器
      const minuteActivityCounts = Array.from({ length: dataPointsCount }).map(() => 0);

    // 使用过滤后的访问记录来计数
      filteredVisits.forEach((visit: { actionDetails: any[]; }) => {
        visit.actionDetails.forEach(action => {
          // 这里请勿修改-必须要对时间戳减去8小时以进行校准
          const actionTime = new Date(action.timestamp * 1000 - (8 * 60 * 60 * 1000));
          // @ts-ignore
          const minutesFromStart = Math.floor((actionTime.getTime() - firstDataPoint.getTime()) / (60 * 1000));
          if (minutesFromStart >= 0 && minutesFromStart < dataPointsCount) {
            minuteActivityCounts[minutesFromStart] += 1;
          }
        });
      });

     // 准备绘图数据,转换每分钟的数据为所需格式
      const visitsData = minuteActivityCounts.map((count, index) => {
        const minutesFromStart = index;
        // @ts-ignore
        const actionTime = new Date(firstDataPoint.getTime() + minutesFromStart * 60 * 1000);
        const hour = actionTime.getHours();
        const minute = actionTime.getMinutes();
        return {
          hour: `${hour}:${minute < 10 ? '0' : ''}${minute}`, // 保持hh:mm格式
          visits: count
        };
      });

     // 合并数据点,每5分钟合并一次
      const mergedData = [];
      for (let i = 0; i < visitsData.length; i += 5) {
        const slice = visitsData.slice(i, i + 5);
        const mergedPoint = {
          hour: slice[0].hour,
          visits: d3.mean(slice, (d: { visits: any; }) => d.visits)
        };
        mergedData.push(mergedPoint);
      }

      // 对合并后的数据进行平滑处理
      const smoothedData = [];
      for (let i = 0; i < mergedData.length; i++) {
        const prevPoint = mergedData[i - 1];
        const currPoint = mergedData[i];
        const nextPoint = mergedData[i + 1];

        if (!prevPoint || !nextPoint) {
          smoothedData.push(currPoint);
        } else {
          const smoothedVisits = (prevPoint.visits + currPoint.visits + nextPoint.visits) / 3;
          smoothedData.push({
            hour: currPoint.hour,
            visits: smoothedVisits
          });
        }
      }

      const dataHash = getMD5(smoothedData);
      Cookies.set('hourlyTrafficData', JSON.stringify({
        data: smoothedData,
        timestamp: Date.now(),
        hash: dataHash
      }));

      // @ts-ignore
      setData(smoothedData);

    };

    fetchData(); // 初次加载时获取数据

    const intervalId = setInterval(fetchData, 30000); // 每30秒获取一次数据

    return () => {
      clearInterval(intervalId); // 组件卸载时清除定时器
    };
  }, []);



  useEffect(() => {
    if (!width || data.length === 0) return;

    const height = 150;
    const margin = { top: 20, bottom: 30 };

    d3.select(wrapperRef.current).selectAll(".tooltip").remove();
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");

    const showTooltip = debounce((event: { pageX: any; pageY: number; }, d: { hour: any; visits: any; }) => {
      tooltip.style("opacity", 1)
        .html(`<span style="color: gray; font-size: 12px;">时间: ${d.hour}</span> <span style="color: #34a853; font-size: 12px;">浏览: ${Math.round(d.visits)}</span>`)
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY - 28}px`);
    }, 50);

    const hideTooltip = debounce(() => tooltip.style("opacity", 0), 50);

    const tooltip = d3.select(wrapperRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "2px 8px")
      .style("background", 'var(--tooltip-bg-color)')
      .style("color", "white")
      .style("border-radius", "8px")
      .style("opacity", 0)
      .style("pointer-events", "none");


    const xScale = d3.scalePoint()
      // @ts-ignore
      .domain(data.map(d => d.hour))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, (d: { visits: string | number; }) => +d.visits)]).nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x((d: { hour: any; }) => xScale(d.hour))
      .y((d: { visits: string | number; }) => yScale(+d.visits))
      .curve(d3.curveLinear);

    const path = svg.selectAll(".line")
      .data([data]);

    path.enter()
      .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "url(#lineGradient)")
      .attr("stroke-width", 2)
      .merge(path)
      .transition()
      .duration(500)
      .attr("d", line);

    path.exit().remove();

    svg.selectAll(".dot")
      .data(data)
      .enter().append("circle") // 仅用于计算最近点,不显示
      .attr("class", "dot")
      .attr("cx", (d: { hour: any; }) => xScale(d.hour))
      .attr("cy", (d: { visits: any; }) => yScale(d.visits))
      .attr("r", 5)
      .style("fill", "none") // 透明,不显示
      .style("pointer-events", "all") // 响应鼠标事件
      .on("mouseover", (event: { pageX: any; pageY: number; }, d: any) => {
        showTooltip(event, d);
        tooltip.style("opacity", 1)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0));

    svg.selectAll(".dot-hover-target")
      .data(data)
      .enter().append("circle") // 添加用于鼠标悬停的透明圆点
      .attr("class", "dot-hover-target")
      .attr("cx", (d: { hour: any; }) => xScale(d.hour))
      .attr("cy", (d: { visits: any; }) => yScale(d.visits))
      .attr("r", 30) // 设置较大的半径以扩大鼠标悬停的响应区域
      .style("fill", "none") // 保持透明
      .style("pointer-events", "all") // 响应鼠标事件
      .on("mouseover", showTooltip) // 使用之前定义的showTooltip函数
      .on("mouseout", hideTooltip); // 使用之前定义的hideTooltip函数



    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "lineGradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#34a853")
      .attr("stop-opacity", 1);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#b8e994")
      .attr("stop-opacity", 0.3);

  }, [data, width]);


  return (
    <div ref={wrapperRef} className="rounded-xl border bg-zinc-100/5 p-4 text-green-400 dark:bg-zinc-950 ">
      <div className="float-right inline-block rounded-full bg-zinc-500/10 px-2 py-1 text-xs dark:bg-white/10">
        ApiCall
      </div>
      <div className="text-lg text-zinc-950 dark:text-zinc-300">网站每小时访问量</div>

      <div className="mt-1 text-xs text-zinc-500">
        数据更新时间: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
      </div>
      <CSSTransition
        in={data.length > 0}
        timeout={300}
        classNames="chart"
        unmountOnExit
      >
        <svg ref={svgRef}></svg>
      </CSSTransition>
    </div>
  );
}

export default WebsiteHourlyTraffic;
