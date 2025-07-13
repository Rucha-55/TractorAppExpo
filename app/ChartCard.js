import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const ChartCard = ({ title, data = [] }) => {
  // Ensure data is an array and has items
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text>No data available</Text>
      </View>
    );
  }

  // Process data with null checks
  const chartData = data.map(item => {
    if (!item) return null;
    const name = item.name || 'Unknown';
    const value = typeof item.value === 'number' ? item.value : 0;
    
    return {
      ...item,
      name,
      value,
      label: name.length > 10 ? `${name.substring(0, 8)}..` : name,
      topLabelComponent: () => (
        <Text style={{color: '#000', fontSize: 12, marginBottom: 4}}>
          {value}
        </Text>
      ),
    };
  }).filter(Boolean); // Remove any null entries

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <BarChart
        barWidth={24}
        noOfSections={4}
        barBorderRadius={4}
        frontColor="#E31937"
        data={chartData}
        yAxisThickness={0}
        xAxisThickness={0}
        height={220}
        xAxisLabelTextStyle={{color: '#000', textAlign: 'center'}}
        rotateLabel
        labelWidth={60}
        yAxisTextStyle={{color: '#000'}}
        showReferenceLine1
        referenceLine1Position={10}
        referenceLine1LabelTextStyle={{color: 'gray'}}
        referenceLine1Config={{color: 'gray', dashWidth: 2, dashGap: 3}}
        spacing={30}
      />
    </View>
  );
};

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
