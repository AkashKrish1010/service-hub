import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { categoryService } from '../../services/other.services';
import { Plus, Trash2, Wrench, Zap, Sparkles, Hammer, Cpu, Paintbrush, Grid, X } from 'lucide-react-native';
import { ThemedAlertModal } from '../../components/ui/ThemedAlertModal';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('wrench');
  const [loading, setLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info' | 'destructive' | 'confirm';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data || []);
    } catch (e) {
      console.warn('Error fetching categories', e);
    }
  };

  const handleCreateCategory = async () => {
    if (!name.trim()) {
      setAlertConfig({
        visible: true,
        title: 'Required Field',
        message: 'Please enter a category name before proceeding.',
        type: 'warning',
        onConfirm: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }
    setLoading(true);
    try {
      await categoryService.create({ name: name.trim(), icon, description });
      setName('');
      setDescription('');
      setModalVisible(false);
      loadCategories();
      setAlertConfig({
        visible: true,
        title: 'Category Created',
        message: `Category "${name.trim()}" has been successfully added to the catalog.`,
        type: 'success',
        onConfirm: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
    } catch (e) {
      setAlertConfig({
        visible: true,
        title: 'Creation Failed',
        message: 'Failed to create category. Please check your network connection.',
        type: 'error',
        onConfirm: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setAlertConfig({
      visible: true,
      title: 'Delete Category',
      message: 'Are you sure you want to permanently remove this service category?',
      type: 'destructive',
      confirmText: 'Delete Category',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        try {
          await categoryService.delete(id);
          loadCategories();
        } catch (e) {
          setAlertConfig({
            visible: true,
            title: 'Delete Failed',
            message: 'Could not delete category.',
            type: 'error',
            onConfirm: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
          });
        }
      },
      onCancel: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
    });
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'wrench':
        return <Wrench size={20} color={COLORS.primary} />;
      case 'zap':
        return <Zap size={20} color={COLORS.primary} />;
      case 'sparkles':
        return <Sparkles size={20} color={COLORS.primary} />;
      case 'hammer':
        return <Hammer size={20} color={COLORS.primary} />;
      case 'cpu':
        return <Cpu size={20} color={COLORS.primary} />;
      case 'brush':
        return <Paintbrush size={20} color={COLORS.primary} />;
      default:
        return <Grid size={20} color={COLORS.primary} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Service Categories</Text>
          <Text style={styles.subtitle}>Define service offerings on platform</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.catCard}>
            <View style={styles.iconCircle}>{renderIcon(item.icon)}</View>
            <View style={styles.info}>
              <Text style={styles.catName}>{item.name}</Text>
              <Text style={styles.catDesc} numberOfLines={1}>
                {item.description || 'Verified home service offering'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ padding: 6 }}>
              <Trash2 size={18} color={COLORS.error} />
            </TouchableOpacity>
          </Card>
        )}
      />

      {/* Add Category Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.catIconCircle}>
                  <Grid size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Add Category</Text>
                  <Text style={styles.modalSubtitle}>Create service catalog item</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Input
              label="Category Name"
              placeholder="e.g. Roofing, HVAC, Gardening"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Lucide Icon (No emojis)"
              placeholder="wrench, zap, sparkles, hammer, cpu"
              value={icon}
              onChangeText={setIcon}
            />

            <Input
              label="Description"
              placeholder="Brief description of work scope..."
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Create Category"
                variant="primary"
                loading={loading}
                onPress={handleCreateCategory}
                style={{ flex: 1.4 }}
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
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={
          alertConfig.onConfirm ||
          (() => setAlertConfig((prev) => ({ ...prev, visible: false })))
        }
        onCancel={
          alertConfig.onCancel ||
          (() => setAlertConfig((prev) => ({ ...prev, visible: false })))
        }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  list: {
    padding: SPACING.screenPadding,
    paddingBottom: 40,
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  catName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  catDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
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
    marginBottom: 18,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  catIconCircle: {
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
  modalButtons: {
    flexDirection: 'row',
    marginTop: 14,
  },
});
