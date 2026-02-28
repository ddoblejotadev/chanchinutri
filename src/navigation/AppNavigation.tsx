import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import CreateDietScreen from '../screens/CreateDietScreen';
import DietResultScreen from '../screens/DietResultScreen';
import SavedDietsScreen from '../screens/SavedDietsScreen';

export type RootStackParamList = {
  Home: undefined;
  CreateDiet: undefined;
  DietResult: undefined;
  SavedDiets: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'EvaPig' }} />
        <Stack.Screen name="CreateDiet" component={CreateDietScreen} options={{ title: 'Crear Dieta' }} />
        <Stack.Screen name="DietResult" component={DietResultScreen} options={{ title: 'Resultados' }} />
        <Stack.Screen name="SavedDiets" component={SavedDietsScreen} options={{ title: 'Dietas Guardadas' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
