import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '../theme/colors';

type DatePickerFieldProps = {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  fieldStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconSize?: number;
};

const monthFormatter = new Intl.DateTimeFormat('en-ZM', {
  month: 'long',
  year: 'numeric',
});

const dateFormatter = new Intl.DateTimeFormat('en-ZM', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(first: Date, second: Date) {
  return startOfDay(first).getTime() === startOfDay(second).getTime();
}

function clampDate(date: Date, minimumDate?: Date, maximumDate?: Date) {
  const candidate = startOfDay(date);
  const min = minimumDate ? startOfDay(minimumDate) : null;
  const max = maximumDate ? startOfDay(maximumDate) : null;

  if (min && candidate < min) return min;
  if (max && candidate > max) return max;
  return candidate;
}

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Array<Date | null> = Array.from({ length: firstDay }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }

  return days;
}

function moveMonth(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function formatPickerDate(date: Date) {
  return dateFormatter.format(date);
}

export default function DatePickerField({
  value,
  onChange,
  minimumDate,
  maximumDate,
  fieldStyle,
  textStyle,
  iconSize = 20,
}: DatePickerFieldProps) {
  const [visible, setVisible] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(value.getFullYear(), value.getMonth(), 1)
  );

  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);

  const handleOpen = () => {
    setVisibleMonth(new Date(value.getFullYear(), value.getMonth(), 1));
    setVisible(true);
  };

  const handleSelect = (date: Date) => {
    onChange(clampDate(date, minimumDate, maximumDate));
    setVisible(false);
  };

  const canSelect = (date: Date) => {
    const candidate = startOfDay(date);
    const min = minimumDate ? startOfDay(minimumDate) : null;
    const max = maximumDate ? startOfDay(maximumDate) : null;
    return (!min || candidate >= min) && (!max || candidate <= max);
  };

  return (
    <>
      <Pressable style={[styles.field, fieldStyle]} onPress={handleOpen}>
        <Text style={[styles.fieldText, textStyle]}>{formatPickerDate(value)}</Text>
        <Calendar size={iconSize} color={colors.primary} strokeWidth={2.1} />
      </Pressable>

      <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.monthHeader}>
              <Pressable
                style={styles.iconButton}
                onPress={() => setVisibleMonth((current) => moveMonth(current, -1))}
              >
                <ChevronLeft size={22} color={colors.text} strokeWidth={2.2} />
              </Pressable>
              <Text style={styles.monthTitle}>{monthFormatter.format(visibleMonth)}</Text>
              <Pressable
                style={styles.iconButton}
                onPress={() => setVisibleMonth((current) => moveMonth(current, 1))}
              >
                <ChevronRight size={22} color={colors.text} strokeWidth={2.2} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {weekdayLabels.map((label, index) => (
                <Text key={`${label}-${index}`} style={styles.weekday}>
                  {label}
                </Text>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.daysGrid}>
              {monthDays.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const selected = isSameDay(date, value);
                const disabled = !canSelect(date);

                return (
                  <Pressable
                    key={date.toISOString()}
                    disabled={disabled}
                    style={[
                      styles.dayCell,
                      selected && styles.daySelected,
                      disabled && styles.dayDisabled,
                    ]}
                    onPress={() => handleSelect(date)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.dayTextSelected,
                        disabled && styles.dayTextDisabled,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DC',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
  },
  fieldText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#101828',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16,24,40,0.36)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  monthHeader: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: colors.text,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: colors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayDisabled: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: colors.text,
  },
  dayTextSelected: {
    color: colors.surface,
  },
  dayTextDisabled: {
    color: colors.textMuted,
  },
});
