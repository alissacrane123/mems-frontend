export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const MONTHS: Record<number, string> = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

export function parseDateParts(iso: string): {
  month: number;
  day: number;
  year: number;
  monthName: string;
} {
  const d = new Date(iso);
  return {
    month: d.getMonth() + 1,
    day: d.getDate(),
    year: d.getFullYear(),
    monthName: MONTHS[d.getMonth() + 1] as string,
  };
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
