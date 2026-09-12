import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import CategoryChip from "../components/CategoryChip";
import CameraCapture from "../components/CameraCapture";
import { CATEGORIES } from "../constants/categories";
import { useExpenses } from "../store/ExpensesContext";
import { useSettings } from "../store/SettingsContext";
import { parseAmountInput, toISODate, dayLabel } from "../utils/format";
import { deleteReceiptPhoto } from "../services/photoStorage";
import { colors, spacing, typography, radii } from "../theme";

export default function AddExpenseScreen({ navigation, route }) {
  const { addExpense, updateExpense } = useExpenses();
  const { currencySymbol } = useSettings();
  const editing = route?.params?.expense ?? null;

  const [amountText, setAmountText] = useState(
    editing ? String(editing.amount) : "",
  );
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? null);
  const [date, setDate] = useState(
    editing ? new Date(`${editing.date}T00:00:00`) : new Date(),
  );
  const [note, setNote] = useState(editing?.note ?? "");
  const [showPicker, setShowPicker] = useState(false);
  const [photoUri, setPhotoUri] = useState(editing?.photoUri ?? null);
  const [showCamera, setShowCamera] = useState(false);

  const amount = parseAmountInput(amountText);
  const isValid = amount !== null && categoryId !== null;

  function handleSave() {
    if (!isValid) return;
    const fields = {
      amount,
      categoryId,
      date: toISODate(date),
      note: note.trim(),
      photoUri,
    };
    if (editing) {
      updateExpense(editing, fields);
    } else {
      addExpense(fields);
    }
    navigation.goBack();
  }

  function isDirty() {
    if (editing) {
      return (
        amount !== editing.amount ||
        categoryId !== editing.categoryId ||
        toISODate(date) !== editing.date ||
        note.trim() !== (editing.note ?? "") ||
        photoUri !== (editing.photoUri ?? null)
      );
    }
    return (
      amountText.trim() !== "" ||
      categoryId !== null ||
      note.trim() !== "" ||
      photoUri !== null
    );
  }

  function handleClose() {
    if (!isDirty()) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      "Discard changes?",
      "You have unsaved changes that will be lost.",
      [
        { text: "Keep editing", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ],
    );
  }

  function handleAddPhoto() {
    if (!photoUri) {
      setShowCamera(true);
      return;
    }
    Alert.alert("Receipt photo", "What would you like to do?", [
      { text: "Cancel", style: "cancel" },
      { text: "Retake", onPress: () => setShowCamera(true) },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          deleteReceiptPhoto(photoUri).catch(() => {});
          setPhotoUri(null);
        },
      },
    ]);
  }

  function handlePhotoCaptured(uri) {
    setShowCamera(false);

    if (photoUri && photoUri !== uri) {
      deleteReceiptPhoto(photoUri).catch(() => {});
    }
    setPhotoUri(uri);
  }

  function handleDateChange(event, selected) {
    if (Platform.OS === "android") setShowPicker(false);
    if (selected) setDate(selected);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {editing ? "Edit Expense" : "Add Expense"}
          </Text>
          <Pressable
            onPress={handleClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={26} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>{currencySymbol}</Text>
            <TextInput
              style={styles.amountInput}
              value={amountText}
              onChangeText={setAmountText}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              accessibilityLabel="Amount"
              autoFocus
            />
          </View>

          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map((c) => (
              <CategoryChip
                key={c.id}
                category={c}
                selected={categoryId === c.id}
                onPress={setCategoryId}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>Date</Text>
          <Pressable
            style={styles.fieldRow}
            onPress={() => setShowPicker(true)}
            accessibilityRole="button"
          >
            <Text style={styles.fieldValue}>{dayLabel(toISODate(date))}</Text>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
          {showPicker && (
            <View style={styles.pickerWrap}>
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                maximumDate={new Date()}
                onChange={handleDateChange}
              />
              {Platform.OS === "ios" && (
                <Pressable
                  style={styles.doneBtn}
                  onPress={() => setShowPicker(false)}
                >
                  <Text style={styles.doneBtnText}>Done</Text>
                </Pressable>
              )}
            </View>
          )}

          <Text style={styles.sectionLabel}>Note (optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note"
            placeholderTextColor={colors.textSecondary}
            accessibilityLabel="Note"
          />

          {photoUri ? (
            <Pressable
              style={styles.photoPreviewWrap}
              onPress={handleAddPhoto}
              accessibilityRole="button"
              accessibilityLabel="Receipt photo, tap to retake or remove"
            >
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <View style={styles.photoPreviewBadge}>
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={colors.textInverse}
                />
              </View>
            </Pressable>
          ) : (
            <Pressable
              style={styles.photoBtn}
              onPress={handleAddPhoto}
              accessibilityRole="button"
              accessibilityLabel="Add receipt photo"
            >
              <Ionicons
                name="camera-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.photoBtnText}>Add receipt photo</Text>
            </Pressable>
          )}
        </ScrollView>

        <CameraCapture
          visible={showCamera}
          onClose={() => setShowCamera(false)}
          onCapture={handlePhotoCaptured}
        />

        <View style={styles.footer}>
          <Pressable
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!isValid}
            accessibilityRole="button"
            accessibilityState={{ disabled: !isValid }}
          >
            <Text style={styles.saveBtnText}>
              {editing ? "Save Changes" : "Save Expense"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.title,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  currencySymbol: {
    fontSize: typography.display,
    fontWeight: typography.bold,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: typography.display,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    padding: 0,
  },
  sectionLabel: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.lg,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  fieldValue: {
    fontSize: typography.body,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  pickerWrap: { marginBottom: spacing.lg, alignItems: "center" },
  doneBtn: { paddingVertical: spacing.sm },
  doneBtnText: {
    color: colors.primary,
    fontWeight: typography.semibold,
    fontSize: typography.body,
  },
  noteInput: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: radii.md,
    paddingVertical: spacing.md,
  },
  photoBtnText: {
    marginLeft: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  photoPreviewWrap: {
    borderRadius: radii.md,
    overflow: "hidden",
    height: 160,
    backgroundColor: colors.background,
  },
  photoPreview: { width: "100%", height: "100%" },
  photoPreviewBadge: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: radii.pill,
    padding: spacing.xs,
  },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  saveBtnDisabled: { backgroundColor: colors.border },
  saveBtnText: {
    color: colors.textInverse,
    fontSize: typography.subtitle,
    fontWeight: typography.semibold,
  },
});
