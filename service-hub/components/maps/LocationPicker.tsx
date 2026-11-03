import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Button } from '../ui/Button';
import { COLORS, RADIUS } from '../../constants/theme';
import { MapPin, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number };
  onConfirmLocation: (location: { lat: number; lng: number; address: string }) => void;
  onCancel?: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation = { lat: 13.0418, lng: 80.2337 }, // Chennai
  onConfirmLocation,
  onCancel,
}) => {
  const [currentCoords, setCurrentCoords] = useState(initialLocation);
  const [address, setAddress] = useState('Resolving location...');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    reverseGeocode(initialLocation.lat, initialLocation.lng);
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const rev = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (rev && rev.length > 0) {
        const item = rev[0];
        const parts = [
          item.name || item.street,
          item.district || item.subregion,
          item.city || item.region,
        ].filter(Boolean);
        setAddress(parts.length > 0 ? parts.join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } else {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setCurrentCoords(coords);
        await reverseGeocode(coords.lat, coords.lng);
      }
    } catch (e) {
      console.warn('GPS location fetch error', e);
    } finally {
      setLocating(false);
    }
  };

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${currentCoords.lat}, ${currentCoords.lng}], 14);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

          var marker = L.marker([${currentCoords.lat}, ${currentCoords.lng}], { draggable: true }).addTo(map);

          function updateCoord(lat, lng) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ lat: lat, lng: lng }));
          }

          marker.on('dragend', function(e) {
            var position = marker.getLatLng();
            updateCoord(position.lat, position.lng);
          });

          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            updateCoord(e.latlng.lat, e.latlng.lng);
          });
        </script>
      </body>
    </html>
  `;

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setCurrentCoords(data);
      await reverseGeocode(data.lat, data.lng);
    } catch (e) {
      console.warn('Map location parse error', e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
          <MapPin size={18} color={COLORS.primary} />
          <Text style={styles.headerText}>Tap or drag pin to set service area</Text>
        </View>
        <TouchableOpacity
          style={styles.gpsBtn}
          onPress={handleUseCurrentLocation}
          disabled={locating}
        >
          {locating ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <Navigation size={13} color={COLORS.primary} />
              <Text style={styles.gpsBtnText}>Use GPS</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={leafletHTML}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html: leafletHTML }}
            onMessage={handleMessage}
            style={styles.webview}
          />
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.addressBox}>
          <Text style={styles.addressLabel}>Selected Location Area:</Text>
          <Text style={styles.addressText}>{address}</Text>
        </View>
        <View style={styles.buttonRow}>
          {onCancel && (
            <Button
              title="Cancel"
              variant="outline"
              onPress={onCancel}
              style={{ flex: 1, marginRight: 8 }}
            />
          )}
          <Button
            title="Confirm Location Pin"
            variant="primary"
            onPress={() => onConfirmLocation({ ...currentCoords, address })}
            style={{ flex: 2 }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: COLORS.tintBlue,
    gap: 8,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  gpsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mapContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addressBox: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
