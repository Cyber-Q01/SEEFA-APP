
import React from 'react';
import { View, StyleSheet } from 'react-native';
// Fix: Removed unused 'Theme' import
import { Banner, Text, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Fix: useAppContext will be exported from AppDataContext.tsx
import { useAppContext } from '../contexts/AppDataContext';
import { UserPlan } from '../types';
import { FREE_PLAN_LIMIT } from '../config/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppThemeType } from '../config/theme'; // Import AppThemeType


type LimitNoticeNavigationProp = StackNavigationProp<RootStackParamList>;

// Function to create styles with theme access
const makeStyles = (theme: AppThemeType) => StyleSheet.create({
  banner: {
    // Banner component has default styling. Can customize border, margin etc. if needed.
    // For example, adding a border:
    // borderBottomWidth: 1,
    // borderBottomColor: theme.colors.outline,
    marginHorizontal: 8, // Give it some horizontal margin if desired
    marginTop: 4,
    borderRadius: theme.roundness, // Apply theme roundness
  },
});


const LimitNotice: React.FC = () => {
  const theme = useTheme<AppThemeType>();
  const styles = makeStyles(theme); // Create styles with theme
  const navigation = useNavigation<LimitNoticeNavigationProp>();
  const { plan, entries, isLoading: contextIsLoading } = useAppContext(); // Renamed isLoading
  const [visible, setVisible] = React.useState(true);

  // Determine if notice should be shown
  const showNotice = plan === UserPlan.Free && entries.length >= FREE_PLAN_LIMIT - 2; // Show when 2 or less remaining, or at/over limit

  React.useEffect(() => {
    // Reset visibility if conditions change (e.g., user upgrades or deletes items)
    setVisible(showNotice);
  }, [showNotice]);


  if (contextIsLoading || !showNotice || !visible) {
    return null;
  }
  
  const entriesRemaining = FREE_PLAN_LIMIT - entries.length;
  const atOrOverLimit = entriesRemaining <= 0;
  const message = atOrOverLimit 
    ? `You've reached the free plan limit of ${FREE_PLAN_LIMIT} entries.`
    : `You have ${entriesRemaining} ${entriesRemaining === 1 ? 'entry' : 'entries'} remaining on the free plan.`;

  return (
    <Banner
      visible={visible} // Controlled by local state and effect
      actions={[
        {
          label: 'Upgrade to Pro',
          onPress: () => {
            setVisible(false); // Dismiss banner
            navigation.navigate('Upgrade');
          },
          // Fix: Color property will be valid after theme.ts fixes.
          textColor: theme.colors.primary, 
          labelStyle: {fontWeight: 'bold'}
        },
        {
          label: 'Dismiss',
          onPress: () => setVisible(false),
          // Fix: Color property will be valid after theme.ts fixes.
          textColor: theme.colors.onSurfaceVariant, 
        },
      ]}
      icon={atOrOverLimit ? "alert-circle-outline" : "information-outline"}
      // Fix: Color property will be valid after theme.ts fixes.
      style={[styles.banner, {backgroundColor: theme.colors.elevation.level3}]} 
    >
      {/* Fix: Color property will be valid after theme.ts fixes. */}
      <Text style={{color: theme.colors.onSurface, fontWeight: atOrOverLimit ? 'bold' : 'normal'}}>{message}</Text>
    </Banner>
  );
};

export default LimitNotice;