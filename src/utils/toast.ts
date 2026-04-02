import Toast from 'react-native-toast-message';
import type { LucideIcon } from 'lucide-react-native';

export function showToast({
  text1,
  text2,
  type = 'success',
  icon,
}: {
  text1: string;
  text2?: string;
  type?: 'success' | 'error';
  icon?: LucideIcon;
}) {
  Toast.show({
    type,
    text1,
    text2,
    visibilityTime: 2500,
    props: { icon },
  });
}