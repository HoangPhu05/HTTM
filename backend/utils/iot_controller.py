"""
IoT Device Controller using MQTT Protocol
Manages connection to smart devices and sends control commands
"""

import paho.mqtt.client as mqtt
import json
import logging
from datetime import datetime
from typing import Dict, Optional
import threading

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class IoTController:
    """MQTT-based IoT device controller"""
    
    def __init__(self, broker_address: str = "localhost", port: int = 1883):
        """
        Initialize MQTT controller
        
        Args:
            broker_address: MQTT broker IP/hostname
            port: MQTT broker port (default: 1883)
        """
        self.broker_address = broker_address
        self.port = port
        self.client = None
        self.connected = False
        self.device_states = {
            "fan": False,
            "fan_speed": 0,
            "door": False,
            "light": False
        }
        self.init_client()
    
    def init_client(self):
        """Initialize MQTT client"""
        try:
            self.client = mqtt.Client()
            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect
            self.client.on_message = self._on_message
            
            # Connect in background thread
            thread = threading.Thread(target=self._connect_background)
            thread.daemon = True
            thread.start()
            
            logger.info(f"MQTT Client initialized for {self.broker_address}:{self.port}")
        except Exception as e:
            logger.error(f"Failed to init MQTT client: {str(e)}")
    
    def _connect_background(self):
        """Connect to broker in background"""
        try:
            self.client.connect(self.broker_address, self.port, keepalive=60)
            self.client.loop_start()
        except Exception as e:
            logger.error(f"MQTT connection error: {str(e)}")
            self.connected = False
    
    def _on_connect(self, client, userdata, flags, rc):
        """MQTT connection callback"""
        if rc == 0:
            logger.info("MQTT Connected successfully")
            self.connected = True
            # Subscribe to device status topics
            self.client.subscribe("devices/status/#")
        else:
            logger.error(f"MQTT Connection failed with code {rc}")
            self.connected = False
    
    def _on_disconnect(self, client, userdata, rc):
        """MQTT disconnection callback"""
        if rc != 0:
            logger.warning(f"MQTT Disconnected unexpectedly: {rc}")
        self.connected = False
    
    def _on_message(self, client, userdata, msg):
        """MQTT message callback"""
        try:
            payload = json.loads(msg.payload.decode())
            topic = msg.topic
            logger.info(f"Received from {topic}: {payload}")
            
            # Update device states from ESP32 status payloads
            # Fan:   {"device":"fan","speed":int,"running":bool,"level":"..."}
            # Door:  {"device":"door","open":bool}
            # Light: {"device":"light","on":bool}
            if "fan" in topic:
                self.device_states["fan"] = payload.get("running", False)
                self.device_states["fan_speed"] = payload.get("speed", 0)
            elif "door" in topic:
                self.device_states["door"] = payload.get("open", False)
            elif "light" in topic:
                self.device_states["light"] = payload.get("on", False)
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
    
    def send_command(self, device: str, command: str, value: Optional[float] = None) -> bool:
        """
        Send command to IoT device
        
        Args:
            device: Device name (fan, door, light)
            command: Command type (on, off, set_speed, etc)
            value: Optional numeric value
            
        Returns:
            bool: True if sent successfully
        """
        if not self.connected:
            logger.warning(f"MQTT not connected, skipping command for {device}")
            return False
        
        try:
            topic = f"devices/control/{device}/command"
            payload = {
                "device": device,
                "command": command,
                "value": value,
                "timestamp": datetime.now().isoformat()
            }
            
            self.client.publish(topic, json.dumps(payload), qos=1)
            logger.info(f"Command sent to {device}: {command}")
            return True
        except Exception as e:
            logger.error(f"Failed to send command: {str(e)}")
            return False
    
    def control_fan(self, speed: int) -> bool:
        """
        Control fan speed

        Args:
            speed: Fan speed 0-100 (0=off, 100=max)

        Returns:
            bool: Success status
        """
        if speed > 0:
            success = self.send_command("fan", "set_speed", speed)
        else:
            success = self.send_command("fan", "off")
        if success:
            self.device_states["fan"] = speed > 0
            self.device_states["fan_speed"] = speed
        return success

    def control_door(self, open_status: bool) -> bool:
        """
        Control door lock

        Args:
            open_status: True to open, False to close

        Returns:
            bool: Success status
        """
        command = "open" if open_status else "close"
        success = self.send_command("door", command)
        if success:
            self.device_states["door"] = open_status
        return success

    def control_light(self, on: bool) -> bool:
        """
        Control light

        Args:
            on: True to turn on, False to turn off

        Returns:
            bool: Success status
        """
        command = "on" if on else "off"
        success = self.send_command("light", command)
        if success:
            self.device_states["light"] = on
        return success
    
    def get_device_states(self) -> Dict[str, bool]:
        """Get current device states"""
        return self.device_states.copy()
    
    def is_connected(self) -> bool:
        """Check if connected to MQTT broker"""
        return self.connected
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            self.connected = False
            logger.info("MQTT Disconnected")


# Global singleton instance
_iot_controller_instance: Optional[IoTController] = None


def get_iot_controller(broker_address: str = "localhost", port: int = 1883) -> IoTController:
    """Get or create IoT controller instance"""
    global _iot_controller_instance
    if _iot_controller_instance is None:
        _iot_controller_instance = IoTController(broker_address, port)
    return _iot_controller_instance
