import {useTheme} from '../../common/ThemeProvider';
{{ ... }}
import analytics from '../../common/analytics';

export default function MainTabNavigator() {
    const tab = createBottomTabNavigator();
    const {activeTheme} = useTheme();
    return <tab.Navigator
        screenListeners={({ route }) => ({
            tabPress: () => {
                analytics.logEvent('nav_tab_switch', { tab_name: route.name });
            },
        })}
        screenOptions={{
            tabBarActiveTintColor: activeTheme.primary,
            tabBarInactiveTintColor: activeTheme.text.secondary,
            headerShown: false,
            tabBarStyle: { display: 'none' }
        }}
    >
        <tab.Screen
{{ ... }}
