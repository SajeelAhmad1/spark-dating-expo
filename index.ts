import 'react-native-gesture-handler'; // Must be first
import './global.css';                 // NativeWind v4
import * as SplashScreen from 'expo-splash-screen';
import { registerRootComponent } from 'expo';
import App from './App';

// Called at module-load time — before any component mounts.
// This is the earliest possible point, preventing any native splash flicker.
SplashScreen.preventAutoHideAsync();

registerRootComponent(App);