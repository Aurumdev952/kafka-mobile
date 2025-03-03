// services/WebSocketService.js
export class WebSocketService {
    constructor() {
      this.socket = null;
      this.url = 'ws://10.12.74.151:8082'; // Replace with your WebSocket server URL
      this.isConnected = false;
    }

    connect(onMessage, onOpen, onClose, onError) {
      if (this.isConnected) {
        console.log('WebSocket is already connected');
        return;
      }

      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          console.log('WebSocket connection established');
          this.isConnected = true;
          if (onOpen) onOpen();
        };

        this.socket.onmessage = (event) => {
          console.log('Message received from WebSocket');
          if (onMessage) {
            try {
              // Parse JSON data from the WebSocket
              const data = JSON.parse(event.data);
              onMessage(data);
            } catch (err) {
              console.error('Error parsing WebSocket message:', err);
              // Pass the raw data if parsing fails
              onMessage(event.data);
            }
          }
        };

        this.socket.onclose = (event) => {
          console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
          this.isConnected = false;
          if (onClose) onClose(event);
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          if (onError) onError(error);
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        throw error;
      }
    }

    disconnect() {
      if (this.socket && this.isConnected) {
        this.socket.close();
        this.isConnected = false;
        console.log('WebSocket disconnected');
      }
    }

    send(data) {
      if (this.socket && this.isConnected) {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        this.socket.send(message);
        console.log('Message sent via WebSocket');
      } else {
        console.error('Cannot send message: WebSocket is not connected');
      }
    }
  }
