export function formatExpenseDateLabel(
  createdAt: string,
  now = new Date()
): string {
  const expenseDate = new Date(createdAt);

  if (Number.isNaN(expenseDate.getTime())) {
    return 'Unknown date';
  }

  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);
  const expenseStart = startOfDay(expenseDate);

  if (expenseStart.getTime() === todayStart.getTime()) {
    return 'Today';
  }

  if (expenseStart.getTime() === yesterdayStart.getTime()) {
    return 'Yesterday';
  }

  return expenseDate.toLocaleDateString('en-ZM', {
    day: 'numeric',
    month: 'short',
  });
}

export function isSameMonth(dateValue: string, now = new Date()): boolean {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
