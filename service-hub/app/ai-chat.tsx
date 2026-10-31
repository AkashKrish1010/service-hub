import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { AIChatBubble, ChatMessage } from '../components/ai/AIChatBubble';
import { aiService } from '../services/ai.service';
import {
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Send,
  Search,
  Zap,
  Wind,
  Brush,
} from 'lucide-react-native';

export default function AIChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Hello! I am your Service Hub Assistant. Ask me about finding verified providers, checking service rates, or booking your repair requests.',
      timestamp: 'Just now',
    },
  ]);

  const quickPrompts = [
    { label: 'Plumber near me', icon: Search },
    { label: 'AC making noise', icon: Wind },
    { label: 'Electrician urgently', icon: Zap },
    { label: 'Deep house cleaning', icon: Brush },
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await aiService.chat(text, history);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply || 'I found available service professionals ready for this request:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestion: res.suggestions && res.suggestions.length > 0 ? res.suggestions[0] : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'I could not process your request at this moment. You can browse all available service professionals on the map or search tab.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleBookFromChat = (provider: any) => {
    router.push({
      pathname: '/booking/new',
      params: {
        providerId: provider.providerId || provider._id,
        providerName: provider.name,
        category: provider.category,
        rate: provider.hourlyRate,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()}>
          <ArrowLeft size={18} color={COLORS.textMain} />
        </TouchableOpacity>

        <View style={styles.botAvatarBadge}>
          <Sparkles size={14} color="#FFFFFF" />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Service Hub AI Assistant</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>AI Assistant • Active</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.iconCircle}
          onPress={() =>
            setMessages([
              {
                id: '1',
                sender: 'ai',
                text: 'Chat cleared. How can I help you with your home services today?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
        >
          <RotateCcw size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Suggested Quick Prompts */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickPromptsScroll}
        contentContainerStyle={styles.quickPromptsContent}
      >
        {quickPrompts.map((qp, idx) => {
          const IconComp = qp.icon;
          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              style={styles.quickPromptPill}
              onPress={() => handleSend(qp.label)}
            >
              <IconComp size={12} color={COLORS.primary} />
              <Text style={styles.quickPromptText}>{qp.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Message Stream */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={{ paddingVertical: 12 }}
      >
        {messages.map((m) => (
          <AIChatBubble
            key={m.id}
            message={m}
            onBookProvider={handleBookFromChat}
          />
        ))}

        {loading && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>AI Assistant is analyzing providers...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Describe your home service need..."
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
          />

          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <Send size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botAvatarBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
  },
  quickPromptsScroll: {
    maxHeight: 46,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  quickPromptsContent: {
    paddingHorizontal: SPACING.screenPadding,
    alignItems: 'center',
    gap: 8,
  },
  quickPromptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  quickPromptText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  messagesContainer: {
    flex: 1,
  },
  typingIndicator: {
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
  typingText: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.textMain,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIconBtn: {
    padding: 6,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
