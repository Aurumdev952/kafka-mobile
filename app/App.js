// App.js
import { StatusBar } from "expo-status-bar";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import {
  Button,
  Card,
  Provider as PaperProvider,
  Title,
} from "react-native-paper";
import { WebSocketService } from "./services/Websocket";

export default function App() {
  const [stockData, setStockData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsService = useRef(null);
  const maxDataPoints = 20; // Limit the number of data points to display

  useEffect(() => {
    // Initialize WebSocket service
    wsService.current = new WebSocketService();

    // Connect to WebSocket
    connectToWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsService.current) {
        wsService.current.disconnect();
      }
    };
  }, []);

  const connectToWebSocket = () => {
    try {
      wsService.current.connect(
        // Handle incoming messages
        (data) => {
          try {
            // Parse the data if it's a string, otherwise use as is
            const stockInfo =
              typeof data === "string" ? JSON.parse(data) : data;

            setStockData((prevData) => {
              // Add new data and keep only the last maxDataPoints items
              const newData = [...prevData, stockInfo];
              return newData.slice(-maxDataPoints);
            });
          } catch (err) {
            console.error("Error parsing message:", err);
          }
        },
        // Handle connection open
        () => {
          setIsConnected(true);
          setError(null);
        },
        // Handle connection close
        () => {
          setIsConnected(false);
          setError("Connection closed");
        },
        // Handle errors
        (err) => {
          setError(`WebSocket error: ${err.message}`);
        }
      );
    } catch (err) {
      setError(`Failed to connect to WebSocket: ${err.message}`);
    }
  };

  const disconnectFromWebSocket = () => {
    wsService.current.disconnect();
    setIsConnected(false);
  };

  const clearData = () => {
    setStockData([]);
  };

  // Prepare data for the chart
  const chartData = {
    labels: stockData.map((item) => moment(item.timestamp).format("HH:mm:ss")),
    datasets: [
      {
        data: stockData.map((item) => item.price),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726",
    },
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <Title style={styles.title}>Real-time Stock Data</Title>

        <Card style={styles.statusCard}>
          <Card.Content>
            <Text style={styles.statusText}>
              Status: {isConnected ? "Connected to WebSocket" : "Disconnected"}
            </Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </Card.Content>
          <Card.Actions>
            <Button
              mode={isConnected ? "outlined" : "contained"}
              onPress={
                isConnected ? disconnectFromWebSocket : connectToWebSocket
              }
            >
              {isConnected ? "Disconnect" : "Connect"}
            </Button>
            <Button onPress={clearData}>Clear Data</Button>
          </Card.Actions>
        </Card>

        <ScrollView>
          {stockData.length > 0 ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={Dimensions.get("window").width - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />

              <Card style={styles.dataCard}>
                <Card.Title title="Latest Stock Data" />
                <Card.Content>
                  {stockData.slice(-5).map((item, index) => (
                    <Text key={index} style={styles.dataText}>
                      {moment(item.timestamp).format("YYYY-MM-DD HH:mm:ss")} - $
                      {item.price.toFixed(2)}
                    </Text>
                  ))}
                </Card.Content>
              </Card>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Waiting for stock data...</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  statusCard: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
  chartContainer: {
    alignItems: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  dataCard: {
    width: "100%",
    marginVertical: 10,
  },
  dataText: {
    fontSize: 14,
    marginBottom: 5,
  },
  noDataContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 18,
    color: "#888",
  },
});
