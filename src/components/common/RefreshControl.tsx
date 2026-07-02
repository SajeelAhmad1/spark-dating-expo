import React from 'react';
import { RefreshControl as RNRefreshControl } from 'react-native';

interface RefreshControlProps {
  /** Whether the refresh indicator is currently active */
  refreshing: boolean;
  /** Function to call when the user pulls to refresh */
  onRefresh: () => void;
  /** Custom colors for the refresh indicator */
  colors?: string[];
  /** Tint color for iOS */
  tintColor?: string;
}

/**
 * Reusable RefreshControl component that can be easily integrated with ScrollView, FlatList, etc.
 * Automatically handles React Query refetch functionality and provides consistent styling across the app.
 */
export const RefreshControl: React.FC<RefreshControlProps> = ({
  refreshing,
  onRefresh,
  colors = ['#CEB98F'],
  tintColor = '#CEB98F',
}) => {
  return (
    <RNRefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={colors}
      tintColor={tintColor}
      progressBackgroundColor="#F7F3ED"
    />
  );
};

export default RefreshControl;