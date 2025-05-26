
import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import { Card, Text, IconButton, useTheme, Menu, Divider } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

// Fix: useAppContext will be exported from AppDataContext.tsx
import { PasswordEntry, EntryType } from '../types';
// Fix: useAppContext will be exported from AppDataContext.tsx
import { useAppContext } from '../contexts/AppDataContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppThemeType } from '../config/theme'; // Import AppThemeType

interface PasswordCardProps {
  entry: PasswordEntry;
}
type NavigationProp = StackNavigationProp<RootStackParamList>;

const PasswordCard: React.FC<PasswordCardProps> = ({ entry }) => {
  const theme = useTheme<AppThemeType>();
  const navigation = useNavigation<NavigationProp>();
  const { deleteEntry } = useAppContext();
  const [revealed, setRevealed] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleCopy = async (value: string, fieldName: string) => {
    try {
      await Clipboard.setStringAsync(value);
      // Simple feedback, consider a less intrusive toast/snackbar for production
      Alert.alert('Copied!', `${fieldName} copied to clipboard.`);
    } catch (e) {
      Alert.alert('Error', `Could not copy ${fieldName}.`);
    }
  };
  
  const handleDelete = () => {
    setMenuVisible(false); // Close menu before showing alert
    Alert.alert(
      "Delete Password Entry?",
      `Are you sure you want to delete the entry for "${entry.appName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteEntry(entry.id) }
      ]
    );
  };

  const handleOpenUrl = async (url?: string) => {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", `Don't know how to open this URL: ${url}`);
    }
  };
  
  return (
     <Card style={styles.cardBase}>
        <LinearGradient
            // Fix: Access custom gradient color from strongly typed theme. Color properties will be valid after theme.ts fixes.
            colors={theme.colors.gradientPasswordCard || [theme.colors.primaryContainer, theme.colors.primary]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        />
       <Card.Content style={styles.cardContent}>
        <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
                {/* Fix: Color property will be valid after theme.ts fixes. */}
                <IconButton icon="shield-lock-outline" size={24} iconColor={theme.colors.onPrimary} style={styles.cardIcon}/>
                <Text variant="titleLarge" style={[styles.appName, {color: theme.colors.onPrimary}]} numberOfLines={1}>
                    {entry.appName}
                </Text>
            </View>
            <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                    <IconButton 
                        icon="dots-vertical" 
                        size={24} 
                        onPress={() => setMenuVisible(true)} 
                        // Fix: Color property will be valid after theme.ts fixes.
                        iconColor={theme.colors.onPrimary} 
                        style={styles.menuAnchor}
                    />
                }
                // Fix: Color property will be valid after theme.ts fixes.
                contentStyle={{backgroundColor: theme.colors.elevation.level3}}
            >
                <Menu.Item
                    onPress={() => { setRevealed(!revealed); setMenuVisible(false); }}
                    title={revealed ? "Hide Password" : "Reveal Password"}
                    leadingIcon={revealed ? "eye-off-outline" : "eye-outline"}
                    // Fix: Color property will be valid after theme.ts fixes.
                    titleStyle={{color: theme.colors.onSurface}}
                />
                <Menu.Item 
                    onPress={() => { navigation.navigate('AddEditEntry', { entryId: entry.id, entryType: EntryType.Password }); setMenuVisible(false); }}
                    title="Edit Entry" 
                    leadingIcon="pencil-outline"
                    // Fix: Color property will be valid after theme.ts fixes.
                    titleStyle={{color: theme.colors.onSurface}}
                />
                <Divider />
                <Menu.Item 
                    onPress={handleDelete} 
                    title="Delete Entry" 
                    leadingIcon="trash-can-outline" 
                    // Fix: Color property will be valid after theme.ts fixes.
                    titleStyle={{color: theme.colors.error}}
                />
            </Menu>
        </View>

        {entry.category && (
            // Fix: Color property will be valid after theme.ts fixes.
            <View style={[styles.categoryChip, {backgroundColor: theme.colors.onPrimary+'33'}]}>
                <Text style={[styles.categoryText, {color: theme.colors.onPrimary}]}>
                {entry.category}
                </Text>
            </View>
        )}
        {/* Fix: Color properties will be valid after theme.ts fixes. */}
        <InfoRow label="Username" value={entry.username} onCopy={() => handleCopy(entry.username, "Username")} icon="account-circle-outline" textColor={theme.colors.onPrimary} labelColor={theme.colors.onPrimary+'AA'}/>
        <InfoRow 
            label="Password" 
            value={entry.passwordValue} 
            isSensitive 
            revealed={revealed} 
            onCopy={() => handleCopy(entry.passwordValue, "Password")}
            icon="key-variant"
            // Fix: Color properties will be valid after theme.ts fixes.
            textColor={theme.colors.onPrimary} 
            labelColor={theme.colors.onPrimary+'AA'}
        />
        {entry.websiteUrl && (
            <TouchableOpacity onPress={() => handleOpenUrl(entry.websiteUrl)} onLongPress={() => handleCopy(entry.websiteUrl!, "Website URL")}>
            <InfoRow 
                label="Website URL" 
                value={entry.websiteUrl} 
                isUrl 
                icon="web"
                // Fix: Color properties will be valid after theme.ts fixes.
                textColor={theme.colors.onPrimary} 
                labelColor={theme.colors.onPrimary+'AA'}
            />
            </TouchableOpacity>
        )}
       </Card.Content>
     </Card>
  );
};

const InfoRow: React.FC<{label: string, value?: string, isSensitive?: boolean, revealed?: boolean, isUrl?: boolean, onCopy?: () => void, icon?: string, textColor?: string, labelColor?: string}> = 
  ({label, value, isSensitive, revealed, isUrl, onCopy, icon, textColor, labelColor}) => {
  const theme = useTheme<AppThemeType>();
  if (!value) return null;
  const displayValue = isSensitive && !revealed ? '••••••••••••' : value;
  // Fix: Color properties will be valid after theme.ts fixes.
  const defaultTextColor = textColor || theme.colors.onSurface;
  const defaultLabelColor = labelColor || theme.colors.onSurfaceVariant;

  return (
    <View style={styles.infoRow}>
      <View style={styles.labelContainer}>
        {icon && <IconButton icon={icon} size={16} style={styles.infoIcon} iconColor={defaultLabelColor}/>}
        <Text variant="labelMedium" style={[styles.infoLabel, {color: defaultLabelColor}]}>{label}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text 
            variant="bodyMedium" 
            style={[styles.infoValue, {color: defaultTextColor}, isUrl && styles.urlText]} 
            numberOfLines={isUrl ? 1 : undefined}
            ellipsizeMode={isUrl ? 'tail' : undefined}
        >
            {displayValue}
        </Text>
        {onCopy && (
             <IconButton icon="content-copy" size={20} onPress={onCopy} iconColor={defaultTextColor} style={styles.copyIcon}/>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 16, // More rounded
    marginVertical: 8,
    elevation: 4, // Slightly more shadow
    overflow: 'hidden', // Important for LinearGradient to respect border radius
  },
  cardContent: {
    padding: 16, // Consistent padding
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Vertically center title and menu icon
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, 
  },
  cardIcon: {
      marginRight: 6, 
      marginLeft: -4, // Pull icon slightly left
  },
  appName: {
    fontWeight: 'bold',
    fontSize: 20, // Slightly larger app name
    flexShrink: 1, 
  },
  menuAnchor: {
    marginRight: -8, // Adjust position if needed
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12, // Pill shape
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  infoRow: {
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginLeft: -2, // Align with text
    marginRight: 4,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.9,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 4, // Indent value slightly if icon is not used or for alignment
  },
  infoValue: {
    fontWeight: '500',
    fontSize: 15,
    flexShrink: 1, 
    marginRight: 4, // Space before copy icon
  },
  urlText: {
    // textDecorationLine: 'underline', (optional)
  },
  copyIcon: {
    margin: 0,
    width: 30, 
    height: 30,
  },
});

export default PasswordCard;
