import time
import random
import json
from datetime import datetime
from confluent_kafka import Producer

# Kafka Configuration
KAFKA_BROKER = 'localhost:9092'
TOPIC = 'financial_forecast'

# Initialize Kafka Producer
producer = Producer({'bootstrap.servers': KAFKA_BROKER})

def generate_stock_data(symbol: str, price: float):
    """Simulates stock price data using a random walk."""
    change = random.uniform(-1.5, 1.5)  # Simulate price fluctuations
    price = round(price + change, 2)

    data = {
        "timestamp": datetime.utcnow().isoformat(),
        "symbol": symbol,
        "price": price
    }
    return data

def delivery_report(err, msg):
    """Callback function to confirm message delivery."""
    if err is not None:
        print(f'Message delivery failed: {err}')
    else:
        print(f'Message delivered to {msg.topic()} [{msg.partition()}]')

if __name__ == "__main__":
    stock_symbol = "AAPL"  # Simulated stock symbol
    stock_price = 150.0  # Starting price

    while True:
        stock_data = generate_stock_data(stock_symbol, stock_price)
        stock_price = stock_data["price"]  # Update latest price

        producer.produce(TOPIC, key=stock_symbol, value=json.dumps(stock_data), callback=delivery_report)
        producer.flush()

        time.sleep(.2)  # Adjust the frequency of data generation
