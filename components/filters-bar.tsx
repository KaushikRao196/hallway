"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useStore } from "@/lib/store";

interface FiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  classFilter: string;
  onClassFilterChange: (value: string) => void;
  teacherFilter: string;
  onTeacherFilterChange: (value: string) => void;
  sortBy: "recent" | "top";
  onSortChange: (value: "recent" | "top") => void;
  showTeacherFilter?: boolean;
}

export function FiltersBar({
  search,
  onSearchChange,
  classFilter,
  onClassFilterChange,
  teacherFilter,
  onTeacherFilterChange,
  sortBy,
  onSortChange,
  showTeacherFilter = true,
}: FiltersBarProps) {
  const { classes, teachers } = useStore();

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={classFilter} onValueChange={onClassFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showTeacherFilter && (
          <Select value={teacherFilter} onValueChange={onTeacherFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Teachers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teachers</SelectItem>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={sortBy} onValueChange={(v) => onSortChange(v as "recent" | "top")}>
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="top">Top</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
