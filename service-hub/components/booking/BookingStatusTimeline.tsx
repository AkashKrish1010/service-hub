import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import { Check, Clock, Play, Award, X } from 'lucide-react-native';

interface BookingStatusTimelineProps {
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled' | string;
}

export const BookingStatusTimeline: React.FC<BookingStatusTimelineProps> = ({ status }) => {
  if (status === 'cancelled') {
    return (
      <View style={styles.cancelledBox}>
        <X size={18} color={COLORS.error} />
        <Text style={styles.cancelledText}>This booking has been cancelled.</Text>
      </View>
    );
  }

  const steps = [
    { key: 'pending', label: 'Requested', icon: Clock },
    { key: 'accepted', label: 'Accepted', icon: Check },
    { key: 'ongoing', label: 'Ongoing', icon: Play },
    { key: 'completed', label: 'Completed', icon: Award },
  ];

  const getStepIndex = (s: string) => {
    switch (s) {
      case 'pending':
        return 0;
      case 'accepted':
        return 1;
      case 'ongoing':
        return 2;
      case 'completed':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <View style={styles.container}>
      <View style={styles.stepRow}>
        {steps.map((step, idx) => {
          const isPassed = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const IconComp = step.icon;

          return (
            <React.Fragment key={step.key}>
              <View style={styles.nodeContainer}>
                <View
                  style={[
                    styles.node,
                    isPassed ? styles.nodeActive : styles.nodeInactive,
                    isCurrent && styles.nodeCurrent,
                  ]}
                >
                  <IconComp
                    size={12}
                    color={isPassed ? '#FFFFFF' : COLORS.textMuted}
                  />
                </View>
                <Text
                  style={[
                    styles.nodeLabel,
                    isPassed ? styles.labelActive : styles.labelInactive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>

              {idx < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    idx < currentIndex ? styles.lineActive : styles.lineInactive,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nodeContainer: {
    alignItems: 'center',
    width: 64,
  },
  node: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  nodeActive: {
    backgroundColor: COLORS.primary,
  },
  nodeCurrent: {
    backgroundColor: COLORS.accent,
  },
  nodeInactive: {
    backgroundColor: '#E5E7EB',
  },
  nodeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelActive: {
    color: COLORS.textMain,
  },
  labelInactive: {
    color: COLORS.textMuted,
  },
  line: {
    flex: 1,
    height: 2,
    marginTop: -18,
  },
  lineActive: {
    backgroundColor: COLORS.primary,
  },
  lineInactive: {
    backgroundColor: '#E5E7EB',
  },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  cancelledText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
  },
});
