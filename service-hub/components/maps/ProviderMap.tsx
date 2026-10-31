import React, { useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../../constants/theme';

export interface MapProvider {
  id: string;
  name: string;
  category: string;
  hourlyRate: number;
  rating: number;
  lat: number;
  lng: number;
}

interface ProviderMapProps {
  providers: MapProvider[];
  userLocation?: { lat: number; lng: number };
  selectedProviderId?: string;
  onSelectProvider: (provider: MapProvider) => void;
  style?: any;
}

export const ProviderMap: React.FC<ProviderMapProps> = ({
  providers,
  userLocation = { lat: 13.0418, lng: 80.2337 }, // Default Chennai Center (T. Nagar)
  selectedProviderId,
  onSelectProvider,
  style,
}) => {
  const webViewRef = useRef<WebView>(null);

  // Generate Leaflet HTML with Chennai center, category icons, and service labels (no rates)
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; background: #f7f8fa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          
          .pin-container {
            position: relative;
            display: inline-flex;
            flex-direction: column;
            align-items: center;
          }

          .custom-pin {
            background: #ffffff;
            border: 2px solid #1A6BFF;
            color: #0D0D0D;
            border-radius: 20px;
            padding: 5px 10px;
            font-size: 11px;
            font-weight: 700;
            box-shadow: 0 4px 14px rgba(13,13,13,0.2);
            display: inline-flex;
            align-items: center;
            gap: 5px;
            white-space: nowrap;
            transition: all 0.2s ease;
            cursor: pointer;
          }

          .custom-pin .pin-icon svg {
            display: block;
            stroke: #1A6BFF;
          }

          .custom-pin .pin-text {
            line-height: 1;
            letter-spacing: -0.2px;
          }

          .custom-pin.selected {
            background: #1A6BFF;
            color: #ffffff;
            border-color: #1A6BFF;
            transform: scale(1.12);
            box-shadow: 0 6px 18px rgba(26,107,255,0.45);
            z-index: 999;
          }

          .custom-pin.selected .pin-icon svg {
            stroke: #ffffff;
          }

          .pin-arrow {
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 6px solid #1A6BFF;
            margin-top: -1px;
          }

          .user-pin {
            width: 16px;
            height: 16px;
            background: #FF6B2B;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(255,107,43,0.8);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${userLocation.lat}, ${userLocation.lng}], 12);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          // User location marker in Chennai
          var userIcon = L.divIcon({ className: 'user-pin', iconSize: [16, 16], iconAnchor: [8, 8] });
          L.marker([${userLocation.lat}, ${userLocation.lng}], { icon: userIcon }).addTo(map).bindPopup("Your Location (Chennai)");

          var providersData = ${JSON.stringify(providers)};
          var selectedId = "${selectedProviderId || ''}";

          function getCategoryDetails(category) {
            var cat = (category || '').toLowerCase();
            if (cat.indexOf('plumb') !== -1) {
              return {
                label: 'Plumber',
                svg: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
              };
            }
            if (cat.indexOf('elect') !== -1) {
              return {
                label: 'Electrician',
                svg: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
              };
            }
            if (cat.indexOf('clean') !== -1) {
              return {
                label: 'Cleaner',
                svg: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>'
              };
            }
            if (cat.indexOf('carpent') !== -1) {
              return {
                label: 'Carpenter',
                svg: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 3.26-6.36 6.36"/></svg>'
              };
            }
            if (cat.indexOf('applian') !== -1) {
              return {
                label: 'Appliance',
                svg: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/></svg>'
              };
            }
            if (cat.indexOf('paint') !== -1) {
              return {
                label: 'Painter',
                svg: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m14 11 3-3"/><path d="M12 21a6 6 0 0 0 6-6V9a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v6a6 6 0 0 0 6 6Z"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>'
              };
            }
            if (cat.indexOf('garden') !== -1) {
              return {
                label: 'Gardener',
                svg: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/></svg>'
              };
            }
            return {
              label: category || 'Pro',
              svg: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>'
            };
          }

          var boundsGroup = [];
          boundsGroup.push([${userLocation.lat}, ${userLocation.lng}]);

          providersData.forEach(function(p) {
            var isSel = p.id === selectedId;
            var details = getCategoryDetails(p.category);
            
            var pinHtml = 
              '<div class="pin-container">' +
                '<div class="custom-pin ' + (isSel ? 'selected' : '') + '">' +
                  '<span class="pin-icon">' + details.svg + '</span>' +
                  '<span class="pin-text">' + details.label + '</span>' +
                '</div>' +
                '<div class="pin-arrow"></div>' +
              '</div>';

            var icon = L.divIcon({
              className: '',
              html: pinHtml,
              iconSize: [84, 34],
              iconAnchor: [42, 34]
            });

            var marker = L.marker([p.lat, p.lng], { icon: icon }).addTo(map);
            boundsGroup.push([p.lat, p.lng]);

            marker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify(p));
            });
          });

          if (boundsGroup.length > 1) {
            map.fitBounds(boundsGroup, { padding: [40, 40], maxZoom: 14 });
          }
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      onSelectProvider(data);
    } catch (e) {
      console.warn('Map message parse error', e);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {Platform.OS === 'web' ? (
        <iframe
          srcDoc={leafletHTML}
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      ) : (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: leafletHTML }}
          onMessage={handleMessage}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
