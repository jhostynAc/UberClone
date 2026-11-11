import React from "react";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { colors, spacing, columns } from '../theme';
import PersonFormScreen from '../screens/PersonFormScreen'
import VehicleFormScreen from '../screens/VehicleFormScreen'
import DocumentsFormScreen from '../screens/DocumentsFormScreen'
import DriverHomeScreen from '../screens/DriverHomeScreen'

const Stack = createNativeStackNavigator();

export default function UberCloneStack() {
    return (
        <Stack.Navigator>
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