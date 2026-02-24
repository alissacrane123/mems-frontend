"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import * as api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Note } from "@/types";
import Spinner from "@/components/Spinner";

const DEBOUNCE_MS = 1500;

function styleCheckbox(cb: HTMLInputElement) {
  cb.style.marginRight = "6px";
  cb.style.cursor = "pointer";
  cb.style.verticalAlign = "middle";
}

type FormatCommand =
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
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => {
        // prevent editor from losing focus when clicking toolbar
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

export default function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>(
    {},
  );

  const titleRef = useRef(title);
  const editorRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  titleRef.current = title;

  const { data: note, isPending: loading } = useQuery<Note>({
    queryKey: queryKeys.note(id),
    queryFn: () => api.getNote(id),
    enabled: !!id && !!user,
  });

  // Load note content into the editor once on mount
  useEffect(() => {
    if (note && !initialized && editorRef.current) {
      setTitle(note.title);
      editorRef.current.innerHTML = note.content ?? "";
      setInitialized(true);
    }
  }, [note, initialized]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Serialize checkboxes before reading innerHTML so checked state is preserved
  const getSerializedContent = useCallback(() => {
    if (!editorRef.current) return "";
    const checkboxes = editorRef.current.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    checkboxes.forEach((cb) => {
      if (cb.checked) {
        cb.setAttribute("checked", "checked");
      } else {
        cb.removeAttribute("checked");
      }
    });
    return editorRef.current.innerHTML;
  }, []);

  const save = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    try {
      await api.updateNote(id, {
        title: titleRef.current || "Untitled Note",
        content: getSerializedContent(),
      });
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    } catch {
      // Silently fail — user will see stale "last saved" timestamp
    } finally {
      setSaving(false);
    }
  }, [id, queryClient, getSerializedContent]);

  const debouncedSave = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(save, DEBOUNCE_MS);
  }, [save]);

  // Save on unmount if there's a pending debounce
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        save();
      }
    };
  }, [save]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    debouncedSave();
  };

  const handleInput = useCallback(() => {
    debouncedSave();
  }, [debouncedSave]);

  // Update which toolbar buttons appear active based on cursor position
  const handleSelectionChange = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [handleSelectionChange]);

  const format = useCallback(
    (command: FormatCommand) => {
      document.execCommand(command, false);
      editorRef.current?.focus();
      handleSelectionChange();
      debouncedSave();
    },
    [handleSelectionChange, debouncedSave],
  );

  const insertCheckbox = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    // Build: <div><input type="checkbox" contenteditable="false"> &nbsp;</div>
    const wrapper = document.createElement("div");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.contentEditable = "false";
    styleCheckbox(cb);
    cb.addEventListener("change", () => {
      if (cb.checked) {
        cb.setAttribute("checked", "checked");
      } else {
        cb.removeAttribute("checked");
      }
      debouncedSave();
    });

    wrapper.appendChild(cb);
    wrapper.appendChild(document.createTextNode("\u00A0"));

    range.deleteContents();
    range.insertNode(wrapper);

    // Place cursor on the text node inside the wrapper (next to the checkbox)
    const textNode = wrapper.lastChild!;
    range.setStart(textNode, textNode.textContent!.length);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    editorRef.current?.focus();
    debouncedSave();
  }, [debouncedSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Enter") return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const node = selection.anchorNode;
      // Walk up to find the nearest block-level wrapper (div/li/p)
      let block: HTMLElement | null = null;
      let current = node instanceof HTMLElement ? node : node?.parentElement;
      while (current && current !== editorRef.current) {
        const tag = current.tagName;
        if (tag === "DIV" || tag === "P" || tag === "LI") {
          block = current;
          break;
        }
        current = current.parentElement;
      }

      if (!block) return;

      const hasCheckbox = block.querySelector('input[type="checkbox"]');
      if (!hasCheckbox) return;

      // If the line is empty (only checkbox + whitespace), remove the checkbox line instead
      const textContent = block.textContent?.replace(/\u00A0/g, "").trim();
      if (!textContent) {
        e.preventDefault();
        block.remove();
        // Insert a plain empty line
        const empty = document.createElement("div");
        empty.appendChild(document.createElement("br"));
        const range = selection.getRangeAt(0);
        range.insertNode(empty);
        range.setStart(empty, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        debouncedSave();
        return;
      }

      e.preventDefault();

      // Create a new checkbox line
      const wrapper = document.createElement("div");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.contentEditable = "false";
      styleCheckbox(cb);
      cb.addEventListener("change", () => {
        if (cb.checked) {
          cb.setAttribute("checked", "checked");
        } else {
          cb.removeAttribute("checked");
        }
        debouncedSave();
      });

      wrapper.appendChild(cb);
      wrapper.appendChild(document.createTextNode("\u00A0"));

      block.insertAdjacentElement("afterend", wrapper);

      // Place cursor after the checkbox (on the text node)
      const textNode = wrapper.lastChild!;
      const range = document.createRange();
      range.setStart(textNode, textNode.textContent!.length);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);

      debouncedSave();
    },
    [debouncedSave],
  );

  if (!user || loading) return <Spinner />;

  if (!note) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Note not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between py-3 mb-2">
        <button
          onClick={() => router.push("/notes")}
          className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Notes
        </button>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {saving
            ? "Saving..."
            : lastSaved
              ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
              : ""}
        </span>
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Untitled Note"
        className="text-3xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none w-full placeholder-gray-300 dark:placeholder-gray-600 mb-4"
      />

      {/* Formatting toolbar */}
      <div className="flex items-center gap-0.5 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700 flex-wrap">
        <ToolbarButton
          onClick={() => format("bold")}
          active={activeFormats.bold}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => format("italic")}
          active={activeFormats.italic}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => format("underline")}
          active={activeFormats.underline}
          title="Underline (Ctrl+U)"
        >
          <span className="underline">U</span>
        </ToolbarButton>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

        <ToolbarButton
          onClick={() => format("insertUnorderedList")}
          active={activeFormats.insertUnorderedList}
          title="Bullet list"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => format("insertUnorderedList")}
          active={activeFormats.insertUnorderedList}
          title="Bullet list"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 20h14M7 12h14M7 4h14M3 20h.01M3 12h.01M3 4h.01"
            />
          </svg>
        </ToolbarButton>
        <ToolbarButton onClick={insertCheckbox} title="Checkbox">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </ToolbarButton>
      </div>

      {/* Rich text editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder="Start writing..."
        className="flex-1 w-full text-base text-gray-800 dark:text-gray-200 bg-transparent outline-none leading-relaxed min-h-[60vh] prose prose-sm dark:prose-invert max-w-none
          [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
          empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 dark:empty:before:text-gray-600 empty:before:pointer-events-none"
      />
    </div>
  );
}
