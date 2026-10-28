import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./telas/cadastro";
import Home from "./telas/home";
import Retirada from "./telas/devolucao_retiradaus";
import Historico from "./telas/historico";
import Admin from "./telas/admincadastro";
import AdicionarItem from "./telas/adicionaritem";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {/* navigation.replace(... "Home" ou "Admin") no login */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />

        {/* navigation.navigate(...) a partir da Home */}
        <Stack.Screen name="Retirada" component={Retirada} />
        <Stack.Screen name="Historico" component={Historico} />
        <Stack.Screen name="Admin" component={Admin} />

        {/* navigation.navigate("AdicionarItem") a partir da Retirada */}
        <Stack.Screen name="AdicionarItem" component={AdicionarItem} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}