
import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Keyboard } from 'react-native';
import { FAB, Text, SegmentedButtons, useTheme, ActivityIndicator, Searchbar, Button } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import * as Clipboard from 'expo-clipboard';

// Fix: useAppContext will be exported from AppDataContext.tsx
import { useAppData } from '../contexts/AppDataContext';
import { Entry, EntryType, PasswordEntry, Web3KeyEntry, UserPlan } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import PasswordCard from '../components/PasswordCard';
import Web3KeyCard from '../components/Web3KeyCard';
import LimitNotice from '../components/LimitNotice';

const GENERATE_PASSWORD = 'generatePassword';
import { APP_NAME, FREE_PLAN_LIMIT } from '../config/constants';
import { AppThemeType } from '../config/theme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const theme = useTheme<AppThemeType>();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { entries, isLoading: contextIsLoading, plan } = useAppData(); // Removed isLimitReached as it's derived
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>(EntryType.Password); // Ensure filter is string to match SegmentedButtons value type
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [isClipboardAvailable, setIsClipboardAvailable] = useState(true);

  // Derive isLimitReached
  const isLimitReached = plan === UserPlan.Free && entries.length >= FREE_PLAN_LIMIT;


  // Reset search query when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setSearchQuery('');
    }, [])
  );

  const filteredAndSortedEntries = useMemo(() => {
    let tempEntries = entries;
    if (filter !== 'all') {
      tempEntries = tempEntries.filter(entry => entry.type === filter);
    }
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      tempEntries = tempEntries.filter(entry => {
        if (entry.type === EntryType.Password) {
          const typedEntry = entry as PasswordEntry;
          return (typedEntry.appName?.toLowerCase() || '').includes(lowerQuery) ||
                 (typedEntry.username?.toLowerCase() || '').includes(lowerQuery) ||
                 (typedEntry.category?.toLowerCase() || '').includes(lowerQuery) ||
                 (typedEntry.websiteUrl?.toLowerCase() || '').includes(lowerQuery);
        } else {
          const typedEntry = entry as Web3KeyEntry;
          return (typedEntry.label?.toLowerCase() || '').includes(lowerQuery) ||
                 (typedEntry.walletName?.toLowerCase() || '').includes(lowerQuery) ||
                 (typedEntry.projectName?.toLowerCase() || '').includes(lowerQuery) ||
                 (typedEntry.category?.toLowerCase() || '').includes(lowerQuery) ||
                 (typedEntry.websiteUrl?.toLowerCase() || '').includes(lowerQuery);
        }
      });
    }
    return tempEntries.sort((a,b) => b.createdAt - a.createdAt);
  }, [entries, filter, searchQuery]);

  if (contextIsLoading) {
    return (
      // Fix: Color properties will be valid after theme.ts fixes.
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Entry }) => (
    <View style={styles.cardContainer}>
      {item.type === EntryType.Password ? (
        <PasswordCard entry={item as PasswordEntry} />
      ) : (
        <Web3KeyCard entry={item as Web3KeyEntry} />
      )}
    </View>
  );

  const EmptyListComponent = () => (
    <View style={styles.centered}>
      {/* Fix: Color property will be valid after theme.ts fixes. */}
      <Text variant="headlineSmall" style={{color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 10}}>
        {entries.length === 0 ? `Welcome to ${APP_NAME}!` : "No Entries Found"}
      </Text>
      {/* Fix: Color property will be valid after theme.ts fixes. */}
      <Text variant="bodyLarge" style={{color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 20, paddingHorizontal: 20}}>
         {entries.length === 0 ? `Tap the '+' button below to add your first password or Web3 key.` : `No entries match your current search or filter criteria. Try a different search or filter.`}
      </Text>
    </View>
  );

  const canAddMoreEntries = !isLimitReached;

  const generatePassword = async () => {
    try {
      const response = await axios.get('https://www.random.org/strings/?num=1&len=16&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new');
      setGeneratedPassword(response.data.trim());
    } catch (error) {
      console.error('Error generating password:', error);
      setGeneratedPassword('Error generating password');
    }
  };

  return (
    // Fix: Color property will be valid after theme.ts fixes.
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LimitNotice />
      <Searchbar
        placeholder="Search entries..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        // Fix: Color properties will be valid after theme.ts fixes.
        style={[styles.searchbar, {backgroundColor: theme.colors.elevation.level2, color: theme.colors.onSurface}]}
        iconColor={theme.colors.primary}
        inputStyle={{color: theme.colors.onSurface}} // For text input color
        placeholderTextColor={theme.colors.onSurfaceVariant} // For placeholder color
        theme={{ colors: { primary: theme.colors.primary, text: theme.colors.onSurface, placeholder: theme.colors.onSurfaceVariant} }} // For other internal elements like ripple
        onIconPress={() => Keyboard.dismiss()} // Allows dismissing keyboard by tapping search icon
      />
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value)} // value is already string
          buttons={[
            { value: 'all', label: 'All', icon: 'select-all', style: styles.segmentButton },
            { value: EntryType.Password, label: 'Passwords', icon: 'lock-outline', style: styles.segmentButton },
            { value: EntryType.Web3Key, label: 'Web3 Keys', icon: 'key-variant', style: styles.segmentButton },
            { value: GENERATE_PASSWORD, label: 'Generate Password', icon: 'key', style: styles.segmentButton },
          ]}
          density="medium"
        />
      </View>

      {filter === GENERATE_PASSWORD ? (
        <View style={styles.centered}>
          <Button mode="contained" onPress={generatePassword}>
            Generate Password
          </Button>
          <Text style={{ marginTop: 16 }}>
            Generated Password: {generatedPassword}
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              Clipboard.setStringAsync(generatedPassword);
            }}
          >
            Copy to Clipboard
          </Button>
          <Button
            mode="contained"
            onPress={async () => {
              navigation.navigate('AddEditEntry', {formData: {passwordValue: generatedPassword}});
            }}
          >
            Add as Entry
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedEntries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            filteredAndSortedEntries.length === 0
              ? styles.centeredContent
              : styles.listContent
          }
          ListEmptyComponent={EmptyListComponent}
          keyboardShouldPersistTaps="handled"
        />
      )}
      <FAB
        icon="plus"
        style={[
          styles.fab,
          // Fix: Color properties will be valid after theme.ts fixes.
          {
            backgroundColor: canAddMoreEntries
              ? theme.colors.primary
              : theme.colors.surfaceDisabled,
          },
        ]}
        // Fix: Color properties will be valid after theme.ts fixes.
        color={
          canAddMoreEntries ? theme.colors.onPrimary : theme.colors.onSurfaceDisabled
        }
        onPress={() => {
          if (canAddMoreEntries) {
            navigation.navigate('AddEditEntry', {});
          } else {
            navigation.navigate('Upgrade');
          }
        }}
        visible={true}
        accessibilityLabel={
          canAddMoreEntries ? 'Add new entry' : 'Upgrade to add more entries'
        }
      />
      <FAB
        icon="crown"
        style={[styles.fab, { marginRight: 80, backgroundColor: theme.colors.secondary }]}
        color={theme.colors.onSecondary}
        onPress={() => {
          navigation.navigate('Upgrade');
        }}
        visible={true}
        accessibilityLabel="Upgrade to SEEFA Pro"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centeredContent: { 
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60, 
  },
  listContent: {
    paddingBottom: 80, 
    paddingHorizontal: 0, 
  },
  searchbar: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segmentButton: {
    // borderColor: theme.colors.outline, // This would need dynamic theme access or move to makeStyles
  },
  cardContainer: {
    marginVertical: 6,
    marginHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    elevation: 6,
  },
});

export default HomeScreen;
