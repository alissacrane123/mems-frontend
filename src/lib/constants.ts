export function shuffleColors(seed: number) {
  const arr = [...ACCENT_COLORS];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = ((s * 1103515245 + 12345) & 0x7fffffff);
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export const ACCENT_COLORS = [
  {
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    dot: "#4d7cfe",
  },
  {
    gradient: "from-cyan-500 to-sky-500",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    text: "text-cyan-600 dark:text-cyan-400",
    dot: "#06b6d4",
  },
  // {
  //   gradient: "from-rose-500 to-pink-500",
  //   bg: "bg-rose-50 dark:bg-rose-900/20",
  //   text: "text-rose-600 dark:text-rose-400",
  //   dot: "#f43f5e",
  // },
  {
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "#2ec4b6",
  },
  {
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
    dot: "#f59e0b",
  },
  {
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    text: "text-violet-600 dark:text-violet-400",
    dot: "#8b5cf6",
  },
];
