import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { adminService } from '../../services/other.services';
import { AlertTriangle, CheckCircle, MessageSquare, ShieldCheck, X } from 'lucide-react-native';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await adminService.getComplaints();
      setComplaints(data || []);
    } catch (e) {
      console.warn('Error fetching complaints', e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleResolve = async () => {
    if (!adminResponse.trim()) {
      setAlertConfig({
        visible: true,
        title: 'Response Required',
        message: 'Please enter a resolution response or settlement for the user.',
        type: 'warning',
      });
      return;
    }
    setLoading(true);
    try {
      await adminService.resolveComplaint(selectedComplaint._id, adminResponse.trim());
      setSelectedComplaint(null);
      setAdminResponse('');
      fetchComplaints();
      setAlertConfig({
        visible: true,
        title: 'Dispute Resolved',
        message: 'The dispute was successfully marked as resolved and the decision recorded.',
        type: 'success',
      });
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Resolution Error',
        message: 'Failed to record complaint resolution. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Disputes & Complaints</Text>
        <Text style={styles.subtitle}>Mediate customer grievances and support tickets</Text>
      </View>

      <FlatList
        data={complaints}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchComplaints();
            }}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subject}>{item.subject}</Text>
                <Text style={styles.userText}>
                  Filed by: {item.userId?.name || 'Customer'} ({item.userId?.email})
                </Text>
              </View>
              <Badge
                status={item.status === 'resolved' ? 'completed' : 'cancelled'}
                label={item.status.toUpperCase()}
              />
            </View>

            <Text style={styles.desc}>{item.description}</Text>

            {item.adminResponse ? (
              <View style={styles.responseBox}>
                <Text style={styles.responseLabel}>Admin Resolution:</Text>
                <Text style={styles.responseText}>{item.adminResponse}</Text>
              </View>
            ) : (
              <Button
                title="Resolve Ticket"
                variant="primary"
                size="sm"
                onPress={() => {
                  setSelectedComplaint(item);
                  setAdminResponse('');
                }}
                style={{ marginTop: 8 }}
                icon={<MessageSquare size={14} color="#FFFFFF" />}
              />
            )}
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Complaints Filed</Text>
            <Text style={styles.emptySubtitle}>All customer service tickets are clear.</Text>
          </View>
        }
      />

      {/* Resolution Modal */}
      <Modal visible={!!selectedComplaint} animationType="fade" transparent onRequestClose={() => setSelectedComplaint(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.alertIconCircle}>
                  <ShieldCheck size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Resolve Dispute</Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    {selectedComplaint?.subject || 'Customer Complaint'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedComplaint(null)} style={styles.closeBtn}>
                <X size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.complaintQuoteBox}>
              <Text style={styles.quoteLabel}>Customer Grievance:</Text>
              <Text style={styles.quoteText}>"{selectedComplaint?.description}"</Text>
            </View>

            <Input
              label="Official Admin Settlement Response"
              placeholder="e.g. Full refund issued, technician reassigned, apology dispatched..."
              value={adminResponse}
              onChangeText={setAdminResponse}
              multiline
              numberOfLines={4}
              style={{ height: 80, textAlignVertical: 'top' }}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setSelectedComplaint(null)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Mark Resolved"
                variant="accent"
                loading={loading}
                onPress={handleResolve}
                style={{ flex: 1.5 }}
                icon={<CheckCircle size={14} color="#FFFFFF" />}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Themed Feedback Pop-up Modal */}
      <ThemedAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  list: {
    padding: SPACING.screenPadding,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  subject: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  userText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  desc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginVertical: 8,
  },
  responseBox: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 6,
  },
  responseLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  responseText: {
    fontSize: 12,
    color: COLORS.textMain,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 13, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  alertIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  complaintQuoteBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 16,
  },
  quoteLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  quoteText: {
    fontSize: 12,
    color: COLORS.textMain,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
