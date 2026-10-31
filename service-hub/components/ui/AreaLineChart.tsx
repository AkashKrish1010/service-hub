import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, TouchableOpacity } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export interface AreaLineChartProps {
  data: number[];
  labels: string[];
  height?: number;
  lineColor?: string;
  gradientStartColor?: string;
  gradientEndColor?: string;
  unit?: string;
  title?: string;
  subtitle?: string;
  showTimeframeSelector?: boolean;
  selectedTimeframe?: string;
  onSelectTimeframe?: (tf: string) => void;
  timeframes?: string[];
}

export function AreaLineChart({
  data = [40, 65, 80, 70, 110, 140],
  labels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  height = 170,
  lineColor = COLORS.primary,
  gradientStartColor,
  gradientEndColor = 'rgba(255, 255, 255, 0)',
  unit = '$',
  title,
  subtitle,
  showTimeframeSelector = false,
  selectedTimeframe = '6M',
  onSelectTimeframe,
  timeframes = ['7D', '30D', '6M'],
}: AreaLineChartProps) {
  const [chartWidth, setChartWidth] = useState(300);
  const [selectedIndex, setSelectedIndex] = useState<number>(data.length - 1);

  // Keep selected index synchronized to latest point on timeframe/data changes
  React.useEffect(() => {
    setSelectedIndex(data.length - 1);
  }, [selectedTimeframe, data]);

  const safeIndex =
    selectedIndex >= 0 && selectedIndex < data.length
      ? selectedIndex
      : Math.max(data.length - 1, 0);

  const onChartLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - chartWidth) > 1) {
      setChartWidth(w);
    }
  };

  const chartPaddingTop = 16;
  const chartPaddingBottom = 26;
  const chartPaddingLeft = 20;
  const chartPaddingRight = 20;

  const innerWidth = Math.max(chartWidth - chartPaddingLeft - chartPaddingRight, 50);
  const innerHeight = Math.max(height - chartPaddingTop - chartPaddingBottom, 40);

  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;

  // Calculate points cleanly within the inner canvas
  const points = data.map((val, idx) => {
    const x = chartPaddingLeft + (idx / Math.max(data.length - 1, 1)) * innerWidth;
    const y = chartPaddingTop + innerHeight - ((val - minVal) / range) * innerHeight;
    return { x, y, val };
  });

  // Build smooth curve SVG path using cubic Bezier smoothing
  const buildSmoothPath = () => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }

    return path;
  };

  const strokePath = buildSmoothPath();
  const fillBottomY = chartPaddingTop + innerHeight;
  const areaPath =
    points.length > 1
      ? `${strokePath} L ${points[points.length - 1].x.toFixed(1)} ${fillBottomY} L ${points[0].x.toFixed(1)} ${fillBottomY} Z`
      : '';

  const activePoint = points[safeIndex] || points[points.length - 1];

  const actualStartColor =
    gradientStartColor ||
    (lineColor === COLORS.primary ? 'rgba(37, 99, 235, 0.30)' : 'rgba(16, 185, 129, 0.30)');

  const isLatestPoint = safeIndex === points.length - 1;
  const periodLabel =
    selectedTimeframe === '30D'
      ? 'This Month'
      : selectedTimeframe === '7D'
      ? 'This Week'
      : selectedTimeframe === '6M'
      ? 'Total'
      : 'Current';

  const spotlightTag = isLatestPoint
    ? labels[safeIndex]
      ? `${labels[safeIndex]} • ${periodLabel}`
      : periodLabel
    : labels[safeIndex]
    ? `${labels[safeIndex]} Milestone`
    : 'Milestone';

  return (
    <View style={styles.card}>
      {/* Header Info */}
      {(title || subtitle || showTimeframeSelector) && (
        <View style={styles.headerRow}>
          <View style={styles.titleWrapper}>
            {title && (
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
                {subtitle}
              </Text>
            )}
          </View>
          {showTimeframeSelector && (
            <View style={styles.tfContainer}>
              {timeframes.map((tf) => {
                const isActive = selectedTimeframe === tf;
                return (
                  <TouchableOpacity
                    key={tf}
                    activeOpacity={0.7}
                    onPress={() => onSelectTimeframe && onSelectTimeframe(tf)}
                    style={[styles.tfPill, isActive && styles.tfPillActive]}
                  >
                    <Text style={[styles.tfText, isActive && styles.tfTextActive]}>{tf}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Active Value Spotlight Row */}
      {activePoint && (
        <View style={styles.spotlightRow}>
          <Text style={[styles.spotlightVal, { color: lineColor }]} numberOfLines={1}>
            {unit}
            {activePoint.val.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text style={styles.spotlightLabel} numberOfLines={1}>
            {spotlightTag}
          </Text>
        </View>
      )}

      {/* Chart Canvas Area */}
      <View style={styles.chartWrapper} onLayout={onChartLayout}>
        <Svg width={chartWidth} height={height}>
          <Defs>
            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={actualStartColor} />
              <Stop offset="100%" stopColor={gradientEndColor} />
            </LinearGradient>
          </Defs>

          {/* Horizontal Grid Guidelines (3 lines) */}
          {[0.2, 0.55, 0.95].map((pct, i) => {
            const yLine = chartPaddingTop + innerHeight * pct;
            return (
              <Line
                key={i}
                x1={chartPaddingLeft}
                y1={yLine}
                x2={chartWidth - chartPaddingRight}
                y2={yLine}
                stroke={COLORS.border}
                strokeWidth={1}
                strokeDasharray="4, 4"
              />
            );
          })}

          {/* Filled Area Under Curve */}
          {areaPath ? <Path d={areaPath} fill="url(#areaGradient)" /> : null}

          {/* Top Line Stroke */}
          {strokePath ? (
            <Path
              d={strokePath}
              fill="none"
              stroke={lineColor}
              strokeWidth={2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {/* Interactive / Visual Point Markers */}
          {points.map((p, idx) => {
            const isSelected = idx === safeIndex;
            return (
              <React.Fragment key={idx}>
                {/* Touch target for easy tap */}
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={16}
                  fill="transparent"
                  onPress={() => setSelectedIndex(idx)}
                />
                {/* Visual marker */}
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 5.5 : 3.5}
                  fill={isSelected ? lineColor : COLORS.surface}
                  stroke={lineColor}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  onPress={() => setSelectedIndex(idx)}
                />
              </React.Fragment>
            );
          })}

          {/* X-Axis Labels positioned safely within bounds */}
          {points.map((p, idx) => {
            if (!labels[idx]) return null;
            let anchor: 'start' | 'middle' | 'end' = 'middle';
            let labelX = p.x;

            if (idx === 0) {
              anchor = 'start';
              labelX = p.x - 2;
            } else if (idx === points.length - 1) {
              anchor = 'end';
              labelX = p.x + 2;
            }

            return (
              <SvgText
                key={`lbl-${idx}`}
                x={labelX}
                y={height - 6}
                fontSize="10"
                fontWeight={idx === safeIndex ? '800' : '600'}
                fill={idx === safeIndex ? COLORS.textMain : COLORS.textMuted}
                textAnchor={anchor}
              >
                {labels[idx]}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingTop: 16,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 14,
    gap: 8,
  },
  titleWrapper: {
    flex: 1,
    marginRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tfContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexShrink: 0,
  },
  tfPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  tfPillActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tfText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tfTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  spotlightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  spotlightVal: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  spotlightLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  chartWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
});
