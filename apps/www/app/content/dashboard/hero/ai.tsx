/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

"use client"

import * as React from "react"
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronUp } from 'lucide-react';
import { Button } from "@/registry/default/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/ui/card"
import { Checkbox } from "@/registry/default/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/default/ui/dropdown-menu"
import { Input } from "@/registry/default/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/default/ui/table"
import {Badge} from "@/registry/new-york/ui/badge";



export function AITable() {
  const [isChevronRight, setIsChevronRight] = React.useState(false);
  const [isCardVisible, setIsCardVisible] = React.useState(true);
  const [cardHeight, setCardHeight] = React.useState('auto');

  const cardRef = React.useRef(null);

  React.useEffect(() => {
    if (cardRef.current) {
      const updateCardHeight = () => {
        // @ts-ignore
        setCardHeight(`${cardRef.current.scrollHeight}px`);
      };

      updateCardHeight();
      window.addEventListener('resize', updateCardHeight);

      return () => window.removeEventListener('resize', updateCardHeight);
    }
  }, []);

  const handleButtonClick = () => {
    setIsChevronRight(!isChevronRight);
    setIsCardVisible(!isCardVisible);
  };


  return (
    <>
      <Button variant="ghost" onClick={handleButtonClick} className="flex items-center space-x-2 px-2 py-1 text-sm" style={{height: '30px'}}>
        <ChevronUp className={`transition-transform ${isChevronRight ? 'rotate-90' : 'rotate-0'}`} size={14}/>
        <span>AI Log Explorer Pro</span>
      </Button>
      <div
        ref={cardRef}
        className="overflow-hidden transition-all duration-700 ease-in-out"
        style={{maxHeight: isCardVisible ? cardHeight : 0}}
        aria-hidden={!isCardVisible}
      >
        <Card className={`origin-top transition-transform duration-700 ease-in-out ${
          isCardVisible ? 'scale-y-100' : 'scale-y-0'
        }`}>
          <CardContent
            className="py-2">
            <div className="flex items-start justify-between">
              {/* Content here remains unchanged */}
              <div className="flex items-center">
                <div className="flex space-x-2">
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500"></div>
                  <div className="mt-0.5 flex h-3 w-3 rotate-45 items-center justify-center bg-red-500"></div>
                </div>
                <div className="ml-5 mt-0.5">
                  <h3 className="text-sm font-semibold">LOG Title</h3>
                </div>
              </div>
              <DotsHorizontalIcon className="h-5 w-5 text-gray-400"/>
            </div>
            <div className="mt-2 flex space-x-2">
              <Badge className="rounded-2xl" variant="outline">Badge 1</Badge>
              <Badge className="rounded-2xl" variant="outline">Badge 2</Badge>
              <Badge className="rounded-2xl" variant="outline">Badge 3</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
