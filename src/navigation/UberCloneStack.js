import React from "react";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { colors, spacing, columns } from '../theme';
import PersonFormScreen from '../screens/PersonFormScreen'

const Stack = createNativeStackNavigator();

export default function UberCloneStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Datos Personales"
                component={PersonFormScreen}
                options={{ headerShown: false }}
            />
        
        </Stack.Navigator>
    )
}