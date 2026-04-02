export type RootStackParamList = {
  HomeScreen: undefined;
  RequestsScreen: undefined;
  InboxScreen: { cameraSelectMode?: boolean } | undefined;
  ProfileScreen: undefined;
  DiscoveryScreen: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
