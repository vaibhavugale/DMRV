import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';

import { Colors } from '../theme';
import { RootStackParamList, DashboardStackParamList, FarmerStackParamList, TreeStackParamList, ActivityStackParamList } from '../types';
import { startAutoSync } from '../services/sync';
import { getToken, getActiveProjectId } from '../services/storage';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { ProjectSelectorScreen } from '../screens/ProjectSelectorScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { FarmerListScreen } from '../screens/FarmerListScreen';
import { FarmerFormScreen } from '../screens/FarmerFormScreen';
import { FarmerDetailsScreen } from '../screens/FarmerDetailsScreen';
import { PlotFormScreen } from '../screens/PlotFormScreen';
import { TreeListScreen } from '../screens/TreeListScreen';
import { TreeFormScreen } from '../screens/TreeFormScreen';
import { ActivityListScreen } from '../screens/ActivityListScreen';
import { ActivityFormScreen } from '../screens/ActivityFormScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const FarmerStack = createNativeStackNavigator<FarmerStackParamList>();
const TreeStack = createNativeStackNavigator<TreeStackParamList>();
const ActivityStack = createNativeStackNavigator<ActivityStackParamList>();

const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    primary: Colors.primary,
  },
};

// ─── Stacks ──────────────────────────────────────────

const DashboardNavigator = ({ onLogout }: { onLogout: () => void }) => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="DashboardHome">
      {() => <DashboardScreen onLogout={onLogout} />}
    </DashboardStack.Screen>
  </DashboardStack.Navigator>
);

const FarmerNavigator = () => (
  <FarmerStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <FarmerStack.Screen name="FarmerList">
      {({ navigation }) => (
        <FarmerListScreen
          onCreateFarmer={() => navigation.navigate('FarmerForm')}
          onSelectFarmer={(farmer) => navigation.navigate('FarmerDetails', { farmer })}
        />
      )}
    </FarmerStack.Screen>
    <FarmerStack.Screen name="FarmerForm" options={{ presentation: 'modal' }}>
      {({ route, navigation }) => (
        <FarmerFormScreen
          farmer={route.params?.farmer}
          onSave={() => navigation.goBack()}
          onCancel={() => navigation.goBack()}
        />
      )}
    </FarmerStack.Screen>
    <FarmerStack.Screen name="FarmerDetails">
      {({ route, navigation }) => (
        <FarmerDetailsScreen
          farmer={route.params.farmer}
          onBack={() => navigation.goBack()}
          onEditFarmer={(farmer) => navigation.navigate('FarmerForm', { farmer })}
          onCreatePlot={(farmerId) => navigation.navigate('PlotForm', { farmerId })}
          onEditPlot={(plot, farmerId) => navigation.navigate('PlotForm', { plot, farmerId })}
        />
      )}
    </FarmerStack.Screen>
    <FarmerStack.Screen name="PlotForm" options={{ presentation: 'modal' }}>
      {({ route, navigation }) => (
        <PlotFormScreen
          plot={route.params?.plot}
          farmerId={route.params!.farmerId}
          onSave={() => navigation.goBack()}
          onCancel={() => navigation.goBack()}
        />
      )}
    </FarmerStack.Screen>
  </FarmerStack.Navigator>
);

const TreeNavigator = () => (
  <TreeStack.Navigator screenOptions={{ headerShown: false }}>
    <TreeStack.Screen name="TreeList">
      {({ navigation }) => (
        <TreeListScreen
          onCreateTree={() => navigation.navigate('TreeForm')}
          onEditTree={(tree) => navigation.navigate('TreeForm', { tree })}
        />
      )}
    </TreeStack.Screen>
    <TreeStack.Screen name="TreeForm" options={{ presentation: 'modal' }}>
      {({ route, navigation }) => (
        <TreeFormScreen
          tree={route.params?.tree}
          onSave={() => navigation.goBack()}
          onCancel={() => navigation.goBack()}
        />
      )}
    </TreeStack.Screen>
  </TreeStack.Navigator>
);

const ActivityNavigator = () => (
  <ActivityStack.Navigator screenOptions={{ headerShown: false }}>
    <ActivityStack.Screen name="ActivityList">
      {({ navigation }) => (
        <ActivityListScreen
          onCreateActivity={() => navigation.navigate('ActivityForm')}
          onEditActivity={(activity) => navigation.navigate('ActivityForm', { activity })}
        />
      )}
    </ActivityStack.Screen>
    <ActivityStack.Screen name="ActivityForm" options={{ presentation: 'modal' }}>
      {({ route, navigation }) => (
        <ActivityFormScreen
          activity={route.params?.activity}
          onSave={() => navigation.goBack()}
          onCancel={() => navigation.goBack()}
        />
      )}
    </ActivityStack.Screen>
  </ActivityStack.Navigator>
);

// ─── Main Tabs ───────────────────────────────────────

const MainTabs = ({ onLogout }: { onLogout: () => void }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textTertiary,
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        elevation: 0,
        backgroundColor: Colors.surface,
      },
      tabBarIcon: ({ color }) => {
        let icon = '';
        if (route.name === 'Dashboard') icon = '🏠';
        else if (route.name === 'Farmers') icon = '👨‍🌾';
        else if (route.name === 'Trees') icon = '🌳';
        else if (route.name === 'Activities') icon = '📋';
        return <Text style={{ fontSize: 20, color }}>{icon}</Text>;
      },
    })}
  >
    <Tab.Screen name="Dashboard">{() => <DashboardNavigator onLogout={onLogout} />}</Tab.Screen>
    <Tab.Screen name="Farmers" component={FarmerNavigator} />
    <Tab.Screen name="Trees" component={TreeNavigator} />
    <Tab.Screen name="Activities" component={ActivityNavigator} />
  </Tab.Navigator>
);

// ─── Root Navigator ──────────────────────────────────

export const AppNavigator = () => {
  const [isReady, setIsReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [hasProject, setHasProject] = useState(false);

  useEffect(() => {
    // Start background sync listener
    const stopSync = startAutoSync();
    
    // Check auth/project state
    checkAuthStatus();

    return () => {
      stopSync();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getToken();
      const projectId = await getActiveProjectId();
      setHasToken(!!token);
      setHasProject(!!projectId);
    } catch {
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  let initialRoute: keyof RootStackParamList = 'Login';
  if (hasToken && hasProject) {
    initialRoute = 'MainTabs';
  } else if (hasToken && !hasProject) {
    initialRoute = 'ProjectSelector';
  }

  return (
    <NavigationContainer theme={Theme}>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        {!hasToken ? (
          <Stack.Screen name="Login">
            {() => <LoginScreen onLoginSuccess={checkAuthStatus} />}
          </Stack.Screen>
        ) : !hasProject ? (
          <Stack.Screen name="ProjectSelector">
            {() => <ProjectSelectorScreen onProjectSelected={checkAuthStatus} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="MainTabs">
            {() => <MainTabs onLogout={() => { setHasToken(false); setHasProject(false); }} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
