import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Home, Search, PlusCircle, User as UserIcon } from "lucide-react-native";
import { SessionProvider } from "./lib/session";
import { AppHeaderLogo } from "./components/AppHeader";
import { HomeScreen } from "./screens/HomeScreen";
import { TasksScreen } from "./screens/TasksScreen";
import { PostTaskScreen } from "./screens/PostTaskScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { TaskDetailScreen } from "./screens/TaskDetailScreen";
import { WorkerProfileScreen } from "./screens/WorkerProfileScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { SignupScreen } from "./screens/SignupScreen";
import { colors, type } from "./theme";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: () => <AppHeaderLogo />,
        headerStyle: { backgroundColor: colors.canvas },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mute,
        tabBarLabelStyle: { ...type.caption, fontWeight: "600" },
        tabBarStyle: {
          borderTopColor: colors.hairline,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Post"
        component={PostTaskScreen}
        options={{ tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />, title: "Post" }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} />, title: "Profile" }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: colors.canvas },
              headerTitleStyle: { ...type.bodyLg, color: colors.ink },
              headerTintColor: colors.ink,
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: "Task" }} />
            <Stack.Screen name="WorkerProfile" component={WorkerProfileScreen} options={{ title: "Worker" }} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: "Top workers" }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Log in", presentation: "modal" }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Sign up", presentation: "modal" }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SessionProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
