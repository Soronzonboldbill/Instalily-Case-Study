import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Share, Trash, X } from 'lucide-react-native';

interface OptionModalProps {
  visible: boolean;
  onClose: () => void;
  handleExport: () => void;
  handleDelete: () => Promise<void>;
}

export function OptionsModal({ visible, onClose, handleDelete, handleExport }: OptionModalProps) {

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>More Options</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <TouchableOpacity activeOpacity={0.8} style={{
              width: "100%",
              backgroundColor: "#353839",
              paddingVertical: 10,
              paddingHorizontal: 10,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              gap: 10,
              borderRadius: 10,
            }}
              onPress={() => { handleExport(); onClose(); }}
            >
              <Share color="#fff" size={18} />
              <Text style={{ color: "#fff" }}>Export Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={{
              width: "100%",
              backgroundColor: "#e7000b",
              paddingVertical: 10,
              paddingHorizontal: 10,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              gap: 10,
              borderRadius: 10,
            }}
              onPress={() => { handleDelete(); onClose(); }}
            >
              <Trash color="#fff" size={18} />
              <Text style={{ color: "#fff" }}>Delete Chat</Text>
            </TouchableOpacity>
          </View>

        </Pressable>
      </Pressable>
    </Modal >
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    flex: 1,
    backgroundColor: '#0e1111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '25%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: "column",
    gap: 10,
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: "#10B981",
    padding: 15,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#F3F4F6",
    marginBottom: 5,
  },
  cardBody: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#E5E7EB",
  }
});

