/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import { FontBoldIcon } from "@radix-ui/react-icons"

import { Toggle } from "@/registry/new-york/ui/toggle"

export default function ToggleDemo() {
  return (
    <Toggle aria-label="Toggle italic">
      <FontBoldIcon className="h-4 w-4" />
    </Toggle>
  )
}