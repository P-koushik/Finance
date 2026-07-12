import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatMoneyString = (amount: string | number) => {
  const parsedAmount =
    typeof amount === 'number' ? amount : Number(amount.replace(/,/g, ''));

  return formatCurrency(Number.isFinite(parsedAmount) ? parsedAmount : 0);
};

export const formatDateTime = (value: Date | string) => {
  const date = dayjs(value);

  if (!date.isValid()) {
    return '';
  }

  return date.format('D MMM YYYY h:mm A');
};

export const formatDateKey = (value: Date | string) => {
  const date = dayjs(value);

  if (!date.isValid()) {
    return '';
  }

  return date.format('YYYY-MM-DD');
};

export const formatExpenseTime = (value: Date | string) => {
  const date = dayjs(value);

  if (!date.isValid()) {
    return '';
  }

  return date.format('hh:mm A');
};

export const formatTransactionGroupTitle = (value: Date | string) => {
  const date = dayjs(value);

  if (!date.isValid()) {
    return 'OLDER';
  }

  if (date.isToday()) {
    return 'TODAY';
  }

  if (date.isYesterday()) {
    return 'YESTERDAY';
  }

  return date.format('MMMM D').toUpperCase();
};

export const getTimestamp = (value: Date | string) => {
  const date = dayjs(value);

  if (!date.isValid()) {
    return 0;
  }

  return date.valueOf();
};
