import { Tabs, Redirect } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/theme';

export default function AppLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSec,
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.hairline },
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Dönemler', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📚</Text> }} />
      <Tabs.Screen name="coach" options={{ title: 'AI Koç', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🤖</Text> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> }} />
    </Tabs>
  );
}
