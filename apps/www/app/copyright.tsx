/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
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
