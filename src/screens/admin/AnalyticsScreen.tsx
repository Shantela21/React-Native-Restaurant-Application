import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";


const screenWidth = Dimensions.get("window").width;

export default function AnalyticsScreen({ orders }: any) {
  const totalRevenue = orders.reduce(
    (sum: number, o: any) => sum + o.totalAmount,
    0,
  );

  const statusCounts = {
    delivered: orders.filter((o: any) => o.status === "delivered").length,
    pending: orders.filter((o: any) => o.status === "pending").length,
    preparing: orders.filter((o: any) => o.status === "preparing").length,
  };

  const pieData = [
    {
      name: "Delivered",
      population: statusCounts.delivered,
      color: "#10B981",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
    {
      name: "Pending",
      population: statusCounts.pending,
      color: "#EF4444",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
    {
      name: "Preparing",
      population: statusCounts.preparing,
      color: "#F59E0B",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
  ];

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Analytics</Text>

      {/* Revenue Chart */}
      <Text style={{ marginTop: 20 }}>Revenue Overview</Text>
      <LineChart
        data={{
          labels: orders.map((_: any, i: number) => `${i + 1}`),
          datasets: [{ data: orders.map((o: any) => o.totalAmount) }],
        }}
        width={screenWidth - 32}
        height={220}
        yAxisSuffix="R"
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: () => "#6366F1",
        }}
      />

      {/* Orders Pie Chart */}
      <Text style={{ marginTop: 20 }}>Order Status</Text>
      <PieChart
        data={pieData}
        width={screenWidth - 32}
        height={220}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        chartConfig={{
          color: () => "#000",
        }}
      />
    </ScrollView>
  );
}
