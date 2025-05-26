
import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import { Card, Text, IconButton, useTheme, Menu, Divider } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { Web3KeyEntry, EntryType } from '../types';
// Fix: useAppContext will be exported from AppDataContext.tsx
import { useAppContext } from '../contexts/AppDataContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppThemeType } from '../config/theme'; // Import AppThemeType

interface Web3KeyCardProps {
  entry: Web3KeyEntry;
}
type NavigationProp = StackNavigationProp<RootStackParamList>;

type RevealedFields = {
  secretPhrase?: boolean;
  secretKey?: boolean;
  pinCode?: boolean;
};

const Web3KeyCard: React.FC<Web3KeyCardProps> = ({ entry }) => {
  const theme = useTheme<AppThemeType>();
  const navigation = useNavigation<NavigationProp>();
  const { deleteEntry } = useAppContext();
  const [revealedFields, setRevealedFields] = useState<RevealedFields>({});
  const [menuVisible, setMenuVisible] = useState(false);

  const handleCopy = async (value: string, fieldName: string) => {
    try {
      await Clipboard.setStringAsync(value);
      Alert.alert('Copied!', `${fieldName} copied to clipboard.`);
    } catch (e) {
      Alert.alert('Error', `Could not copy ${fieldName}.`);
    }
  };

  const toggleReveal = (field: keyof RevealedFields) => {
    setRevealedFields(prev => ({ ...prev, [field]: !prev[field] }));
  };
  
  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      "Delete Web3 Key Entry?",
      `Are you sure you want to delete the entry for "${entry.label}"? This action cannot be undone.`,
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
            // Fix: Access custom gradient colors from strongly typed theme. Color properties will be valid after theme.ts fixes.
            colors={theme.colors.gradientWeb3KeyCard || [theme.colors.primary, theme.colors.secondary]} 
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        />
       <Card.Content style={styles.cardContent}>
        <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
                 {/* Fix: Color property will be valid after theme.ts fixes. */}
                 <IconButton icon="key-chain-variant" size={24} iconColor={theme.colors.onPrimary} style={styles.cardIcon}/>
                <View style={{flexShrink: 1}}>
                    {/* Fix: Color property will be valid after theme.ts fixes. */}
                    <Text variant="titleLarge" style={[styles.labelName, {color: theme.colors.onPrimary}]} numberOfLines={1}>
                        {entry.label}
                    </Text>
                    {/* Fix: Color property will be valid after theme.ts fixes. */}
                    <Text variant="bodySmall" style={{color: theme.colors.onPrimary+'CC'}} numberOfLines={1}>{entry.walletName}</Text>
                </View>
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
                    onPress={() => { navigation.navigate('AddEditEntry', { entryId: entry.id, entryType: EntryType.Web3Key }); setMenuVisible(false); }} 
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
      {entry.projectName && <InfoRow label="Project Name" value={entry.projectName} onCopy={() => handleCopy(entry.projectName!, "Project Name")} icon="briefcase-outline" textColor={theme.colors.onPrimary} labelColor={theme.colors.onPrimary+'AA'}/>}
      
      {entry.secretPhrase && (
        <SensitiveInfoRow 
            label="Secret Phrase" 
            value={entry.secretPhrase} 
            revealed={revealedFields.secretPhrase} 
            onToggleReveal={() => toggleReveal('secretPhrase')}
            onCopy={() => handleCopy(entry.secretPhrase!, "Secret Phrase")}
            icon="text-box-outline"
            // Fix: Color properties will be valid after theme.ts fixes.
            textColor={theme.colors.onPrimary} 
            labelColor={theme.colors.onPrimary+'AA'}
        />
      )}
      {entry.secretKey && (
         <SensitiveInfoRow 
            label="Secret Key" 
            value={entry.secretKey} 
            revealed={revealedFields.secretKey} 
            onToggleReveal={() => toggleReveal('secretKey')}
            onCopy={() => handleCopy(entry.secretKey!, "Secret Key")}
            icon="key-outline" // Using a different key icon
            // Fix: Color properties will be valid after theme.ts fixes.
            textColor={theme.colors.onPrimary} 
            labelColor={theme.colors.onPrimary+'AA'}
        />
      )}
      {entry.pinCode && (
        <SensitiveInfoRow 
            label="PIN Code" 
            value={entry.pinCode} 
            revealed={revealedFields.pinCode} 
            onToggleReveal={() => toggleReveal('pinCode')}
            onCopy={() => handleCopy(entry.pinCode!, "PIN Code")}
            icon="lock-outline" // Using a different lock icon
            // Fix: Color properties will be valid after theme.ts fixes.
            textColor={theme.colors.onPrimary} 
            labelColor={theme.colors.onPrimary+'AA'}
        />
      )}
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

const InfoRow: React.FC<{label: string, value?: string, isUrl?: boolean, onCopy?: () => void, icon?: string, textColor?: string, labelColor?: string}> = 
  ({label, value, isUrl, onCopy, icon, textColor, labelColor}) => {
  const theme = useTheme<AppThemeType>();
  if (!value) return null;
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
            numberOfLines={isUrl ? 1 : 2} // Allow two lines for non-URL values if long
            ellipsizeMode={isUrl ? 'tail' : undefined}
        >
            {value}
        </Text>
        {onCopy && (
             <IconButton icon="content-copy" size={20} onPress={onCopy} iconColor={defaultTextColor} style={styles.copyIcon}/>
        )}
      </View>
    </View>
  );
};

const SensitiveInfoRow: React.FC<{label: string, value: string, revealed?: boolean, onToggleReveal: () => void, onCopy: () => void, icon?:string, textColor?: string, labelColor?: string}> = 
  ({label, value, revealed, onToggleReveal, onCopy, icon, textColor, labelColor}) => {
  const theme = useTheme<AppThemeType>();
  const displayValue = revealed ? value : '••••••••••••••••••••'; // Longer placeholder
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
        <Text variant="bodyMedium" style={[styles.infoValue, {color: defaultTextColor}]} numberOfLines={revealed ? 3 : 1} ellipsizeMode="tail">{displayValue}</Text>
        <View style={{flexDirection: 'row'}}>
            <IconButton icon={revealed ? "eye-off-outline" : "eye-outline"} size={20} onPress={onToggleReveal} iconColor={defaultTextColor} style={styles.copyIcon}/>
            {revealed && onCopy && <IconButton icon="content-copy" size={20} onPress={onCopy} iconColor={defaultTextColor} style={styles.copyIcon}/>}
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 16,
    marginVertical: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  cardIcon: {
      marginRight: 8,
      marginLeft: -4,
  },
  labelName: {
    fontWeight: 'bold',
    fontSize: 20,
    flexShrink: 1,
  },
  menuAnchor: {
    marginRight: -8,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
    marginLeft: -2,
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
    paddingLeft: 4,
  },
  infoValue: {
    fontWeight: '500',
    fontSize: 15,
    flexShrink: 1, 
    marginRight: 8, 
  },
   urlText: {
    // textDecorationLine: 'underline',
  },
  copyIcon: {
    margin: 0,
    width: 30,
    height: 30,
  },
});

export default Web3KeyCard;