"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import EditorToolbar, { type FormatCommand } from "./EditorToolbar";
import {
  createCheckboxLine,
  placeCursorAtEnd,
  serializeCheckboxes,
  handleCheckboxEnter,
} from "@/lib/checkboxUtils";

interface NoteEditorProps {
  initialContent: string;
  onDirty: () => void;
  /** Called to read the current HTML; parent wires this into save. */
  getContentRef: React.MutableRefObject<(() => string) | null>;
}

export default function NoteEditor({
  initialContent,
  onDirty,
  getContentRef,
}: NoteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const initializedRef = useRef(false);

  // Hydrate the editor once
  useEffect(() => {
    if (editorRef.current && !initializedRef.current) {
      editorRef.current.innerHTML = initialContent;
      initializedRef.current = true;
    }
  }, [initialContent]);

  // Expose a getter so the parent can read serialized content for saving
  useEffect(() => {
    getContentRef.current = () => {
      if (!editorRef.current) return "";
      serializeCheckboxes(editorRef.current);
      return editorRef.current.innerHTML;
    };
  }, [getContentRef]);

  // Track active formatting at cursor
  const updateFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateFormats);
    return () => document.removeEventListener("selectionchange", updateFormats);
  }, [updateFormats]);

  const format = useCallback(
    (command: FormatCommand) => {
      document.execCommand(command, false);
      editorRef.current?.focus();
      updateFormats();
      onDirty();
    },
    [updateFormats, onDirty],
  );

  const insertCheckbox = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const wrapper = createCheckboxLine(onDirty);

    range.deleteContents();
    range.insertNode(wrapper);
    placeCursorAtEnd(wrapper.lastChild!);

    editorRef.current?.focus();
    onDirty();
  }, [onDirty]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Enter") return;
      if (!editorRef.current) return;
      if (handleCheckboxEnter(editorRef.current, onDirty)) {
        e.preventDefault();
      }
    },
    [onDirty],
  );

  return (
    <>
      <EditorToolbar
        activeFormats={activeFormats}
        onFormat={format}
        onInsertCheckbox={insertCheckbox}
      />
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={onDirty}
        onKeyDown={handleKeyDown}
        data-placeholder="Start writing..."
        className="flex-1 w-full text-base text-gray-800 dark:text-gray-200 bg-transparent outline-none leading-relaxed min-h-[60vh] prose prose-sm dark:prose-invert max-w-none
          empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 dark:empty:before:text-gray-600 empty:before:pointer-events-none"
      />
    </>
  );
}
