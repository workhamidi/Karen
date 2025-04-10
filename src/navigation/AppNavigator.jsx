import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from '../screens/MainScreen';
import DummyPreviousScreen from '../screens/DummyPreviousScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Dummy" component={DummyPreviousScreen} />
      <Stack.Screen name="Main" component={MainScreen} />
      {/* Add other screens here if needed */}
    </Stack.Navigator>
  );
};

export default AppNavigator;