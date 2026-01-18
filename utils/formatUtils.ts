export const getProjectStyle = (project: string): string => {
  const hash = project
    .split("")
    .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const colors = [
    "bg-notion-light-sidebar text-notion-light-muted border-notion-light-border dark:bg-notion-dark-sidebar/30 dark:text-notion-dark-muted dark:border-notion-dark-border/30",
    "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
    "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
  ];
  return colors[hash % colors.length];
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
      colorClass: "text-emerald-600 dark:text-emerald-400",
    };
  if (diffDays === -1)
    return {
      text: "Yesterday",
      colorClass: "text-red-600 dark:text-red-400 font-medium",
    };
  if (diffDays < -1)
    return {
      text: formatDate(dateString),
      colorClass: "text-red-500 dark:text-red-400",
    }; // Overdue

  return {
    text: formatDate(dateString),
    colorClass: "text-notion-light-muted dark:text-notion-dark-muted",
  };
};

export const formatCurrency = (
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};
