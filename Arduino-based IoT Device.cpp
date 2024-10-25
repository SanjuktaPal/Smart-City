//Arduino-based IoT Device 
#include <MKRWAN.h>
#include <TinyGPS++.h>
#include <NewPing.h>

#define TRIGGER_PIN  6
#define ECHO_PIN     7
#define MAX_DISTANCE 200

LoRaModem modem;
TinyGPSPlus gps;
NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE);

const char *appEui = "0000000000000000";
const char *appKey = "00000000000000000000000000000000";

void setup() {
  Serial.begin(9600);
  while (!Serial);
  
  // Initialize LoRaWAN
  if (!modem.begin(EU868)) {
    Serial.println("Failed to start LoRaWAN");
    while (1) {}
  }
  
  int connected = modem.joinOTAA(appEui, appKey);
  if (!connected) {
    Serial.println("LoRaWAN join failed");
    while (1) {}
  }

  Serial.println("LoRaWAN joined successfully");
}

void loop() {
  // Measure waste level
  int distance = sonar.ping_cm();
  int fillLevel = map(distance, 0, MAX_DISTANCE, 100, 0);

  // Get GPS coordinates
  float latitude, longitude;
  while (Serial1.available() > 0) {
    if (gps.encode(Serial1.read())) {
      if (gps.location.isValid()) {
        latitude = gps.location.lat();
        longitude = gps.location.lng();
      }
    }
  }

  // Prepare data packet
  String data = String(fillLevel) + "," + String(latitude, 6) + "," + String(longitude, 6);

  // Send data via LoRaWAN
  modem.beginPacket();
  modem.print(data);
  int err = modem.endPacket(true);
  if (err > 0) {
    Serial.println("Data sent successfully");
  } else {
    Serial.println("Error sending data");
  }

  delay(3600000); // Send data every hour
}
