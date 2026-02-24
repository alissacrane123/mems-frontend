"use client";

import { ReactNode } from "react";
import { BulletListIcon, NumberedListIcon, CheckCircleIcon } from "@/components/icons";

export type FormatCommand =
  | "bold"
  | "italic"
  | "underline"
  | "insertUnorderedList"
  | "insertOrderedList";

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`p-1.5 rounded text-sm transition-colors cursor-pointer ${
        active
          ? "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

interface EditorToolbarProps {
  activeFormats: Record<string, boolean>;
  onFormat: (cmd: FormatCommand) => void;
  onInsertCheckbox: () => void;
}

export default function EditorToolbar({
  activeFormats,
  onFormat,
  onInsertCheckbox,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-0.5 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700 flex-wrap">
      <ToolbarButton
        onClick={() => onFormat("bold")}
        active={activeFormats.bold}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => onFormat("italic")}
        active={activeFormats.italic}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => onFormat("underline")}
        active={activeFormats.underline}
        title="Underline (Ctrl+U)"
      >
        <span className="underline">U</span>
      </ToolbarButton>

      <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

      <ToolbarButton
        onClick={() => onFormat("insertUnorderedList")}
        active={activeFormats.insertUnorderedList}
        title="Bullet list"
      >
        <NumberedListIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => onFormat("insertOrderedList")}
        active={activeFormats.insertOrderedList}
        title="Numbered list"
      >
        <BulletListIcon />
      </ToolbarButton>
      <ToolbarButton onClick={onInsertCheckbox} title="Checkbox">
        <CheckCircleIcon />
      </ToolbarButton>
    </div>
  );
}
