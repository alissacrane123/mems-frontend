"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeftIcon } from "./icons";

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function startDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const selectDay = (day: number) => {
    const selected = new Date(viewYear, viewMonth, day);
    onChange(selected);
    setOpen(false);
  };

  const totalDays = daysInMonth(viewYear, viewMonth);
  const offset = startDay(viewYear, viewMonth);

  const isSelected = (day: number) =>
    value.getFullYear() === viewYear &&
    value.getMonth() === viewMonth &&
    value.getDate() === day;

  const isToday = (day: number) => {
    const now = new Date();
    return now.getFullYear() === viewYear && now.getMonth() === viewMonth && now.getDate() === day;
  };

  const formatted = value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
      >
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{formatted}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 w-64">
          {/* Month/year nav */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
            >
              <ChevronLeftIcon className="h-4 w-4 text-gray-500" />
            </button>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
            >
              <ChevronLeftIcon className="h-4 w-4 text-gray-500 rotate-180" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const today = isToday(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`h-8 w-8 mx-auto rounded-full text-xs flex items-center justify-center transition-colors cursor-pointer
                    ${selected
                      ? "dark:bg-blue-900/20 text-white"
                      : today
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
