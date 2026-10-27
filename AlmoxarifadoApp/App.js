import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./telas/cadastro";
import inicio from "./telas/home";
import Adicionar from "./telas/adicionaritem";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="inicio" component={inicio} />
        <Stack.Screen name="Adicionar" component={Adicionar} />       
      </Stack.Navigator>
    </NavigationContainer>
  );
}