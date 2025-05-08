import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import GradientBorder from '@components/common/GradientBorder';
import { StyleSheet } from 'react-native';
import styles from '../styles/DashboardScreenStyles';

type DayType = {
  day: string;
  date: number;
};

type DashboardHeaderProps = {
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  setCalendarVisible: (visible: boolean) => void;
  days: DayType[];
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedDay,
  setSelectedDay,
  setCalendarVisible,
  days,
}) => {
  return (
    <View style={styles.dayDateContainer}>
      <GradientBorder
        colors={['rgba(157, 157, 255, 0.05)', 'rgba(39, 39, 54, 0.05)']}
        style={StyleSheet.absoluteFill}
        padding={0}>
        <View></View>
      </GradientBorder>

      {/* Calendar Header */}
      <View style={styles.calendarHeader}>
        <View>
          <Text style={styles.dateText}>January 30 2025</Text>
          <Text style={styles.title}>Today Reminder</Text>
        </View>
        <TouchableOpacity style={styles.calendarIcon} onPress={() => setCalendarVisible(true)}>
          <MaterialIcons name="calendar-today" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Day Selector with horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayScrollContent}>
        {days.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dayItem, selectedDay === item.date && styles.selectedDayItem]}
            onPress={() => setSelectedDay(item.date)}>
            <Text style={styles.dayText}>{item.day}</Text>
            <Text
              style={[styles.dateNumber, selectedDay === item.date && styles.selectedDateNumber]}>
              {item.date}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default DashboardHeader;
