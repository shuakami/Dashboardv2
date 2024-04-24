/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import { Button } from "@/registry/new-york/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/new-york/ui/dialog"

// @ts-ignore
export function CopyrightModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription>
            <div className="flex h-full w-full rounded-lg p-1">
              <div className="flex-1 p-1">
                <div className="text-2xl font-medium">ByteFreeze</div>
                <p>Version 11.0.1</p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="mx-2 mt-4">
          <div className="mb-4 text-lg font-semibold">Dashboard (CA.DEV.2024324)</div>
          <div className="rounded-lg bg-zinc-500/5 p-4 dark:bg-zinc-500/30">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">Developer</div>
              <div>ByteFreezeLab×Sdjz.Wiki</div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">Release</div>
              <div>test_2024324</div>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">License</div>
              <div>private</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-medium">Framework</div>
              <div>NextJS</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
