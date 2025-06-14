import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const ChartCard = ({ title, data }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <BarChart
      barWidth={24}
      noOfSections={4}
      barBorderRadius={4}
      frontColor="#E31937"
      data={data}
      yAxisThickness={0}
      xAxisThickness={0}
      height={160}
    />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginVertical: 10,
    elevation: 2,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E31937',
    marginBottom: 12,
  },
});

export default ChartCard;
