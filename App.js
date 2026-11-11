import './src/I18n/i18n'; 
import react from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RegistrationProvider } from './src/context/RegistrationContext';
import UberCloneStack from './src/navigation/UberCloneStack';
import DriverHomeScreen from './src/screens/DriverHomeScreen';
import { colors } from './src/theme';

const temaNavegacion = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.fondo,
    card: colors.superficie,
    primary: colors.primario,
    text: colors.texto,
    border: colors.borde,
  },
};

export default function App() {
  return(
    <SafeAreaProvider>
      <RegistrationProvider>
        <NavigationContainer theme={temaNavegacion}>
          <StatusBar style="dark" />
          <DriverHomeScreen />
        </NavigationContainer>
      </RegistrationProvider>
    </SafeAreaProvider>
  )
}