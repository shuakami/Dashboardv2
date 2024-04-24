/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

export function TailwindIndicator() {
  if (process.env.NODE_ENV === "production") return null

  return (
    <div className="">
      <div className="block sm:hidden"></div>
      <div className="hidden sm:block md:hidden"></div>
      <div className="hidden md:block lg:hidden"></div>
      <div className="hidden lg:block xl:hidden"></div>
      <div className="hidden xl:block 2xl:hidden"></div>
      <div className="hidden 2xl:block"></div>
    </div>
  )
}
