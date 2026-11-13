import React from "react";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { colors, spacing, columns } from '../theme';
import PersonFormScreen from '../screens/PersonFormScreen'
import VehicleFormScreen from '../screens/VehicleFormScreen'
import DocumentsFormScreen from '../screens/DocumentsFormScreen'
import DriverHomeScreen from '../screens/DriverHomeScreen'
import LoginScreen from "../screens/LoginScreen";
import WelcomeScreen from '../screens/WelcomeScreen'

const Stack = createNativeStackNavigator();

export default function UberCloneStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Datos Personales"
                component={PersonFormScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Datos del Vehículo"
                component={VehicleFormScreen}
                options={{ headerShown: false }}
            />
             <Stack.Screen
                name="Documentos"
                component={DocumentsFormScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Home"
                component={DriverHomeScreen}
                options={{ headerShown: false }}
            />
            
        </Stack.Navigator>
    )
}