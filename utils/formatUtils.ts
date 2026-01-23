const PROJECT_COLORS = [
  "bg-notion-light-sidebar text-notion-light-muted border-notion-light-border dark:bg-notion-dark-sidebar/30 dark:text-notion-dark-muted dark:border-notion-dark-border/30",
  "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:bg-violet-500/20 dark:text-violet-400 dark:border-violet-500/30",
  "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30",
  "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30",
];

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

const CURRENCY_FORMATTERS = new Map<string, Intl.NumberFormat>();

export const getProjectStyle = (project: string): string => {
  const hash = project
    .split("")
    .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return PROJECT_COLORS[hash % PROJECT_COLORS.length];
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return DATE_FORMATTER.format(date);
};

export const formatRelativeDate = (
  dateString: string,
): { text: string; colorClass: string } => {
  if (!dateString)
    return {
      text: "-",
      colorClass: "text-notion-light-muted dark:text-notion-dark-muted",
    };

  const target = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Normalize target to midnight for comparison
  const targetMidnight = new Date(target);
  targetMidnight.setHours(0, 0, 0, 0);

  const diffTime = targetMidnight.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0)
    return {
      text: "Today",
      colorClass: "text-notion-light-text dark:text-notion-dark-text font-bold",
    };
  if (diffDays === 1)
    return {
      text: "Tomorrow",
      colorClass: "text-indigo-600 dark:text-indigo-400",
    };
  if (diffDays === -1)
    return {
      text: "Yesterday",
      colorClass: "text-purple-600 dark:text-purple-400 font-medium",
    };
  if (diffDays < -1)
    return {
      text: formatDate(dateString),
      colorClass: "text-purple-500 dark:text-purple-400",
    }; // Overdue

  return {
    text: formatDate(dateString),
    colorClass: "text-notion-light-muted dark:text-notion-dark-muted",
  };
};

export const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return "never";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  return formatDate(dateString);
};

export const formatCurrency = (
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string => {
  try {
    const key = `${locale}-${currency}`;
    let formatter = CURRENCY_FORMATTERS.get(key);
    if (!formatter) {
      formatter = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
      });
      CURRENCY_FORMATTERS.set(key, formatter);
    }
    return formatter.format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

export const formatNumber = (num: number): string => {
  return NUMBER_FORMATTER.format(num);
};
