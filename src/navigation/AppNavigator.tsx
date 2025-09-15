import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Business } from '../types';

// Import screens
import BusinessListScreen from '../screens/BusinessListScreen/BusinessListScreen';
// import ArticleListScreen from '../screens/ArticleListScreen';

// Define navigation param types
export type RootStackParamList = {
  BusinessList: undefined;
  ArticleList: {
    business: Business;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="BusinessList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="BusinessList"
          component={BusinessListScreen}
          options={{
            title: 'Businesses',
            headerLeft: () => null, // Remove back button on main screen
          }}
        />
        {/* <Stack.Screen
          name="ArticleList"
          component={ArticleListScreen}
          options={({ route }) => ({
            title: route.params.business.name,
            headerSubtitle: 'Articles',
          })}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
