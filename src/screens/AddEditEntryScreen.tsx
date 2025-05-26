
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, useTheme, Text, SegmentedButtons, HelperText, ActivityIndicator, TextInputProps } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Fix: useAppContext will be exported from AppDataContext.tsx
import { useAppContext } from '../contexts/AppDataContext';
import { EntryType, PasswordFormData, Web3KeyFormData, EntryFormData, UserPlan } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { FREE_PLAN_LIMIT } from '../config/constants';
import { AppThemeType } from '../config/theme';

type AddEditEntryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddEditEntry'>;
type AddEditEntryScreenRouteProp = RouteProp<RootStackParamList, 'AddEditEntry'>;

const AddEditEntryScreen: React.FC = () => {
  const theme = useTheme<AppThemeType>();
  const navigation = useNavigation<AddEditEntryScreenNavigationProp>();
  const route = useRoute<AddEditEntryScreenRouteProp>();
  const { addEntry, updateEntry, getEntryById, plan, entries, isLoading: contextIsLoading } = useAppContext();

  const entryId = route.params?.entryId;
  const initialEntryTypeFromNav = route.params?.entryType;

  const [currentEntryType, setCurrentEntryType] = useState<EntryType>(initialEntryTypeFromNav || EntryType.Password);
  const [formData, setFormData] = useState<Partial<EntryFormData>>({});
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!entryId;
  const isFreePlanLimitReachedForNew = !isEditing && plan === UserPlan.Free && entries.length >= FREE_PLAN_LIMIT;

  useEffect(() => {
    if (isEditing && entryId) {
      setIsScreenLoading(true);
      const entryToEdit = getEntryById(entryId);
      if (entryToEdit) {
        setCurrentEntryType(entryToEdit.type);
        const { id, type, createdAt, updatedAt, ...editableData } = entryToEdit;
        setFormData(editableData);
      } else {
        Alert.alert("Error", "Entry not found.");
        navigation.goBack();
      }
      setIsScreenLoading(false);
    } else if (initialEntryTypeFromNav) {
        setCurrentEntryType(initialEntryTypeFromNav);
    }
    navigation.setOptions({ title: isEditing ? 'Edit Entry' : 'Add New Entry' });
  }, [entryId, getEntryById, isEditing, navigation, initialEntryTypeFromNav]);

  const handleInputChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentEntryType === EntryType.Password) {
      const data = formData as Partial<PasswordFormData>;
      if (!data.appName?.trim()) newErrors.appName = "App Name is required.";
      if (!data.username?.trim()) newErrors.username = "Username is required.";
      if (!data.passwordValue?.trim()) newErrors.passwordValue = "Password is required.";
    } else { 
      const data = formData as Partial<Web3KeyFormData>;
      if (!data.label?.trim()) newErrors.label = "Label is required.";
      if (!data.walletName?.trim()) newErrors.walletName = "Wallet Name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (isFreePlanLimitReachedForNew) {
      Alert.alert(
        "Limit Reached",
        `You have reached the free plan limit of ${FREE_PLAN_LIMIT} entries. Please upgrade to add more.`,
        [{ text: "OK" }, { text: "Upgrade", onPress: () => navigation.navigate('Upgrade') }]
      );
      return;
    }

    setIsSubmitting(true);
    let success = false;
    try {
      if (isEditing && entryId) {
        success = await updateEntry(entryId, formData as EntryFormData);
      } else {
        success = await addEntry(formData as EntryFormData, currentEntryType);
      }

      if (success) {
        navigation.goBack();
      } else {
        if (!isEditing && plan === UserPlan.Free && entries.length >= FREE_PLAN_LIMIT) {
             Alert.alert(
                "Limit Reached",
                `You have reached the free plan limit of ${FREE_PLAN_LIMIT} entries. Please upgrade to add more.`,
                [{ text: "OK" }, { text: "Upgrade", onPress: () => navigation.navigate('Upgrade') }]
            );
        } else {
            Alert.alert("Error", `Failed to ${isEditing ? 'update' : 'add'} entry. Please try again.`);
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || `An unexpected error occurred while ${isEditing ? 'updating' : 'adding'} the entry.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isScreenLoading) {
    // Fix: Color properties will be valid after theme.ts fixes.
    return <View style={[styles.centered, {backgroundColor: theme.colors.background}]}><ActivityIndicator size="large" color={theme.colors.primary}/></View>;
  }

  const commonTextInputProps = (fieldName: string): Partial<TextInputProps> => ({
    mode: "outlined",
    style: styles.input,
    // Fix: Color properties will be valid after theme.ts fixes.
    selectionColor: theme.colors.primary,
    outlineColor: errors[fieldName] ? theme.colors.error : theme.colors.outline,
    activeOutlineColor: errors[fieldName] ? theme.colors.error : theme.colors.primary,
    error: !!errors[fieldName],
    disabled: isSubmitting,
  });

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // Fix: Color property will be valid after theme.ts fixes.
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
    <ScrollView
        // Fix: Color property will be valid after theme.ts fixes.
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
    >
      {!isEditing && (
        <View style={styles.typeSelectorContainer}>
            {/* Fix: Color property will be valid after theme.ts fixes. */}
            <Text variant="labelLarge" style={{marginBottom: 8, color: theme.colors.onSurfaceVariant}}>Entry Type</Text>
            <SegmentedButtons
                value={currentEntryType}
                onValueChange={(value) => {
                    setCurrentEntryType(value as EntryType);
                    setFormData({});
                    setErrors({});
                }}
                buttons={[
                    { value: EntryType.Password, label: 'Password', icon: 'lock', style: styles.segmentButton, disabled: isEditing || isSubmitting || contextIsLoading },
                    { value: EntryType.Web3Key, label: 'Web3 Key', icon: 'key-variant', style: styles.segmentButton, disabled: isEditing || isSubmitting || contextIsLoading },
                ]}
            />
        </View>
      )}

      {currentEntryType === EntryType.Password ? (
        <>
          <TextInput
            label="App/Website Name *"
            value={(formData as Partial<PasswordFormData>).appName || ''}
            onChangeText={value => handleInputChange('appName', value)}
            {...commonTextInputProps('appName')}
          />
          {errors.appName && <HelperText type="error" visible={!!errors.appName}>{errors.appName}</HelperText>}

          <TextInput
            label="Username/Email *"
            value={(formData as Partial<PasswordFormData>).username || ''}
            onChangeText={value => handleInputChange('username', value)}
            autoCapitalize="none"
            keyboardType="email-address"
            {...commonTextInputProps('username')}
          />
          {errors.username && <HelperText type="error" visible={!!errors.username}>{errors.username}</HelperText>}

          <TextInput
            label="Password *"
            value={(formData as Partial<PasswordFormData>).passwordValue || ''}
            onChangeText={value => handleInputChange('passwordValue', value)}
            secureTextEntry
            {...commonTextInputProps('passwordValue')}
          />
          {errors.passwordValue && <HelperText type="error" visible={!!errors.passwordValue}>{errors.passwordValue}</HelperText>}

          <TextInput
            label="Website URL (Optional)"
            value={(formData as Partial<PasswordFormData>).websiteUrl || ''}
            onChangeText={value => handleInputChange('websiteUrl', value)}
            keyboardType="url"
            {...commonTextInputProps('websiteUrl')}
          />
          <TextInput
            label="Category (Optional)"
            value={(formData as Partial<PasswordFormData>).category || ''}
            onChangeText={value => handleInputChange('category', value)}
            {...commonTextInputProps('category')}
          />
        </>
      ) : ( 
        <>
          <TextInput
            label="Label / Identifier *"
            value={(formData as Partial<Web3KeyFormData>).label || ''}
            onChangeText={value => handleInputChange('label', value)}
            {...commonTextInputProps('label')}
          />
          {errors.label && <HelperText type="error" visible={!!errors.label}>{errors.label}</HelperText>}

          <TextInput
            label="Wallet Name *"
            value={(formData as Partial<Web3KeyFormData>).walletName || ''}
            onChangeText={value => handleInputChange('walletName', value)}
            {...commonTextInputProps('walletName')}
          />
          {errors.walletName && <HelperText type="error" visible={!!errors.walletName}>{errors.walletName}</HelperText>}

          <TextInput
            label="Project Name (Optional)"
            value={(formData as Partial<Web3KeyFormData>).projectName || ''}
            onChangeText={value => handleInputChange('projectName', value)}
            {...commonTextInputProps('projectName')}
          />
          <TextInput
            label="Secret Phrase (Optional)"
            value={(formData as Partial<Web3KeyFormData>).secretPhrase || ''}
            onChangeText={value => handleInputChange('secretPhrase', value)}
            multiline
            numberOfLines={Platform.OS === 'ios' ? undefined : 3}
            secureTextEntry
            {...commonTextInputProps('secretPhrase')}
            style={[commonTextInputProps('secretPhrase').style, styles.textArea]}
          />
          <TextInput
            label="Secret Key (Optional)"
            value={(formData as Partial<Web3KeyFormData>).secretKey || ''}
            onChangeText={value => handleInputChange('secretKey', value)}
            secureTextEntry
            {...commonTextInputProps('secretKey')}
          />
          <TextInput
            label="PIN Code (Optional)"
            value={(formData as Partial<Web3KeyFormData>).pinCode || ''}
            onChangeText={value => handleInputChange('pinCode', value)}
            secureTextEntry
            keyboardType="numeric"
            {...commonTextInputProps('pinCode')}
          />
          <TextInput
            label="Website URL (Optional)"
            value={(formData as Partial<Web3KeyFormData>).websiteUrl || ''}
            onChangeText={value => handleInputChange('websiteUrl', value)}
            keyboardType="url"
            {...commonTextInputProps('websiteUrl')}
          />
          <TextInput
            label="Category (Optional)"
            value={(formData as Partial<Web3KeyFormData>).category || ''}
            onChangeText={value => handleInputChange('category', value)}
            {...commonTextInputProps('category')}
          />
        </>
      )}

      <View style={styles.buttonContainer}>
        <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={isSubmitting || contextIsLoading}
            style={styles.flexButton}
            labelStyle={styles.buttonLabel}
        >
            Cancel
        </Button>
        <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || isFreePlanLimitReachedForNew || contextIsLoading}
            style={styles.flexButton}
            labelStyle={styles.buttonLabel}
        >
            {isSubmitting ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Entry')}
        </Button>
      </View>
       {isFreePlanLimitReachedForNew && (
        <HelperText type="error" visible={isFreePlanLimitReachedForNew} style={styles.limitText}>
            Free plan limit reached. Upgrade to Pro to add more.
        </HelperText>
      )}
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeSelectorContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  segmentButton: {
  },
  input: {
    marginBottom: 0,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 10,
  },
  flexButton: {
    flex: 1,
  },
  buttonLabel: {
    paddingVertical: 4,
    fontWeight: 'bold',
  },
  limitText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
});

export default AddEditEntryScreen;