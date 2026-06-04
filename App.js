//Punto de entrada de la app
import { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, SafeAreaView } from "react-native";
import { ref, onValue } from "firebase/database";
import { db } from "./src/firebase/config";
import { Fontisto } from "@expo/vector-icons";

export default function App(){

  const [sensors, setSensors] = useState({
    temperature: 0,
    humidity: 0,
    gas: 0,
    movement: false
  });

  const [servos, setServos] = useState({
    ventilation: false,
    door: false
  });

  useEffect(() => {
    //Rutas
    const dht11Ref = ref(db, "sensores/dht11");
    const mq135Ref = ref(db, "sensores/mq135");
    const pirRef = ref(db, "sensores/pir");
    const servosRef = ref(db, "sensores/servos");

    const unsubDht = onValue(dht11Ref, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensors((prev) => ({
          ...prev,
          temperature: data.temperatura,
          humidity: data.humedad,
        }));
      }
    });

    const unsubMq = onValue(mq135Ref, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensors((prev) => ({
          ...prev,
          gas: data.valor
        }));
      }
    });

    const unsubPir = onValue(pirRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setSensors((prev) => ({
          ...prev,
          movement: data.movimiento
        }));
      }
    });

    const unsubServos = onValue(servosRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null){
        setServos({
          ventilation: data.ventilacion,
          door: data.puerta
        });
      }
    });

    //Limpieza
    return () => {
      unsubDht();
      unsubMq();
      unsubPir();
      unsubServos();
    };

  },[]);

  return(
    <SafeAreaView style = {styles.safeArea}>
      {/* {ScrollView permite hacer scroll si el contenido no cabe en la pantalla} */}
      <ScrollView style={styles.container}>

        {/* {Header} */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cochera IoT</Text>
          <Text style={styles.headerSubtitle}>
            Sistema de seguridad y monitoreo
          </Text>
        </View>

        {/* {Tarjetas de sensores} */}
        <Text style={styles.sectionTitle}>Sensores</Text>

        <View style={[
          styles.card,
          {borderLeftColor:"#ef4444"}]}>
          <Text style={styles.cardLabel}>Temperatura</Text>
          <Text style={styles.cardValue}>
            {sensors.temperature}
            <Text style={styles.cardUnit}>°C</Text>
          </Text>
        </View>

        <View style={[
          styles.card,
          {borderLeftColor:"#3b82f6"} ]}>
          <Text style={styles.cardLabel}>Humedad</Text>
          <Text style={styles.cardValue}>
            {sensors.humidity}
            <Text style={styles.cardUnit}>%</Text>
          </Text>
        </View>

        <View style={[
          styles.card,
          {borderLeftColor:"#f59e0b"}]}>
          <Text style={styles.cardLabel}>Gas-Aire</Text>
          <Text style={styles.cardValue}>
            {sensors.gas}
            <Text style={styles.cardUnit}>ppm</Text>
          </Text>
        </View>

        <View style={[
          styles.card,
          {borderLeftColor: sensors.movement ? "#ef4444" : "#22c55e"}
        ]}>
          <Text style={styles.cardLabel}>Movimiento</Text>
          <Text style={[
            styles.cardValue,
            {color: sensors.movement ? "#ef4444" : "#22c55e"}
          ]}>
            {sensors.movement ? "Detectado" : "Sin Movimiento"}
          </Text>
        </View>

        {/* {Actuadores} */}
        <Text style={styles.sectionTitle}>Actuadores</Text>

        <View style={[
          styles.card,
          {borderLeftColor: servos.ventilation ? "#22c55e" : "#ef4444"}]}>
          <Text style={styles.cardLabel}>
            {servos.ventilation ? <Fontisto name="unlocked" size={24} color="#22c55e" /> : <Fontisto name="locked" size={24} color="#ef4444" />}
          </Text>
          <Text style={[
            styles.cardStatus,
            {color: servos.ventilation ? "#22c55e" : "#ef4444" }
          ]}>
            {servos.ventilation  ? "Abierta" : "Cerrada"}
          </Text>
        </View>

        <View style={[
          styles.card,
          {borderLeftColor: servos.door ? "#22c55e" : "#ef4444"}]}>
          <Text style={styles.cardLabel}>
            {servos.door ? <Fontisto name="unlocked" size={24} color="#22c55e" /> : <Fontisto name="locked" size={24} color="#ef4444" />}
          </Text>
          <Text style={[
            styles.cardStatus,
            {color: servos.door ? "#22c55e" : "#ef4444"}
          ]}>
            {servos.door ? "Abierta" : "Cerrada"}
          </Text>
        </View>

        {/* {Espacio al final para que el scroll no corte} */}
        <View style={{height: 40}}/>

      </ScrollView>
    </SafeAreaView>
  );

}

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#1C1C1C"
    },
    container: {
      flex: 1,
      padding: 20
    },
    header: {
      marginBottom: 15,
      paddingBottom: 16,
      paddingTop:20,
      borderBottomWidth: 1,
      borderBottomColor: "#1AD0CC"
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: "#f1f5f9"
    },
    headerSubtitle: {
      fontSize: 13,
      color: "#64748b",
      marginTop: 4
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 12,
      marginTop: 16
    },
    card: {
      backgroundColor: "#272727",
      borderRadius: 12,
      padding: 18,
      marginBottom: 12,
      borderLeftWidth: 4,
    },
    cardLabel: {
      fontSize: 13,
      color: "#94a3b8",
      marginBottom: 8
    },
    cardValue: {
      fontSize: 32,
      fontWeight: "700",
      color: "#f1f5f9"
    },
    cardUnit: {
      fontSize: 16,
      color: "#64748b",
    },
    cardStatus: {
      fontSize: 18,
      fontWeight: "600"
    }
  });