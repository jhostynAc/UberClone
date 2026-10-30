import React from 'react'
import { View,Text,StyleSheet,TextInput,KeyboardAvoidingView} from 'react-native'

export default function PersonInfo (){

    return(
        <KeyboardAvoidingView>
            <TextInput 
            placeholder='Nombre Completo'
            />
            <TextInput
            placeholder='Documento de Identidad'
            keyboardType='phone-pad'
            />
            <TextInput
            placeholder='Numero Celular'
            keyboardType='phone-pad'
            />
            <TextInput
            placeholder='Documento de identidad'
            keyboardType=''
            />
        </KeyboardAvoidingView>
    )
}