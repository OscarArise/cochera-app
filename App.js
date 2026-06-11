//Punto de entrada de la app
import { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity  } from "react-native";
import { ref, onValue, set } from "firebase/database";
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

  const controlDoors = (accion) => {
    set(ref(db, "sensores/control/puertas"), accion);
  };

  const controlVentilation = (accion) => {
    set(ref(db, "sensores/control/ventilacion"), accion);
  };


  return(
    <SafeAreaView style = {styles.safeArea}>
      {/* {ScrollView permite hacer scroll si el contenido no cabe en la pantalla} */}
      <ScrollView style={styles.container}>

        {/* {Header} */}
        <View style={styles.header}>
          <Text style={styles.overline}>
            SISTEMA DE SEGURIDAD Y MONITOREO
          </Text>

          <Text style={styles.headerTitle}>
            COCHERA IoT
          </Text>

          <View style={styles.statusContainer}>
            <View style={styles.statusDot}/>
            <Text style={styles.statusText}>
              SISTEMA OPERATIVO
            </Text>
          </View>
        </View>

        {/* {Tarjetas de sensores} */}
        <Text style={styles.sectionTitle}>Sensores</Text>
        <View style={styles.grid}>

          <View style={[styles.card, styles.cardHalf, {borderLeftColor: "#ef4444"}]}>
            <Text style={styles.cardLabel}>Temperatura</Text>
            <Text style={styles.cardValue}>
              {sensors.temperature}
              <Text style={styles.cardUnit}> °C</Text>
            </Text>
          </View>

          <View style={[styles.card, styles.cardHalf, {borderLeftColor: "#3b82f6"}]}>
            <Text style={styles.cardLabel}>Humedad</Text>
            <Text style={styles.cardValue}>
              {sensors.humidity}
              <Text style={styles.cardUnit}> %</Text>
            </Text>
          </View>

          <View style={[styles.card, styles.cardHalf, {borderLeftColor: "#f59e0b"}]}>
            <Text style={styles.cardLabel}>Gas-Aire</Text>
            <Text style={styles.cardValue}>
              {sensors.gas}
              <Text style={styles.cardUnit}> ppm</Text>
            </Text>
          </View>

          <View style={[styles.card, styles.cardHalf, {
            borderLeftColor: sensors.movement ? "#ef4444" : "#22c55e"
          }]}>
            <Text style={styles.cardLabel}>Movimiento</Text>
            <Text style={[
              styles.cardValue,
              {color: sensors.movement ? "#ef4444" : "#22c55e", fontSize: 18}
            ]}>
              {sensors.movement ? "Detectado" : "Sin movimiento"}
            </Text>
          </View>

        </View>

        {/* {Actuadores} */}
        <Text style={styles.sectionTitle}>Actuadores</Text>
        <View style={styles.grid}>

          <View style={[styles.card, styles.cardHalf, {
            borderLeftColor: servos.ventilation ? "#00E676" : "#FF2800"
          }]}>
            <Fontisto
            name={servos.ventilation ? "unlocked" : "locked"}
            size={22}
            color={servos.ventilation ? "#00E676" : "#FF2800"}
            />
            <Text style={styles.cardLabel}>Ventilación</Text>
            <Text style={[
              styles.cardStatus,
              {color: servos.ventilation ? "#00E676" : "#FF2800"}
            ]}>
              {servos.ventilation ? "Abierta" : "Cerrada"}
            </Text>
          </View>

          <View style={[styles.card, styles.cardHalf, {
            borderLeftColor: servos.door ? "#00E676" : "#FF2800"
          }]}>
            <Fontisto
            name={servos.door ? "unlocked" : "locked"}
            size={22}
            color={servos.door ? "#00E676" : "#FF2800"}
            />
            <Text style={styles.cardLabel}>Puerta Cochera</Text>
            <Text style={[
              styles.cardStatus,
              {color: servos.door ? "#00E676" : "#FF2800" }
            ]}>
              {servos.door ? "Abierta" : "Cerrada"}
            </Text>
          </View>

        </View>

        {/* Control de puertas */}
        <Text style={styles.sectionTitle}>Control</Text>
        <View style={styles.grid}>

          <TouchableOpacity style={[styles.boton, {backgroundColor: "#00E676"}]} onPress={() => controlDoors("open")}>
            <Fontisto name="unlocked" size={20} color={"#fff"}/>
            <Text style={styles.botonTexto}>Abrir puertas</Text>
          </TouchableOpacity>

          <TouchableOpacity
          style={[styles.boton, {backgroundColor: "#FF2800"}]} onPress={() => controlDoors("close")}>
            <Fontisto name="locked" size={20} color="#fff"/>
            <Text style={styles.botonTexto}>Cerrar puertas</Text>
          </TouchableOpacity>
          
          {/* Control ventilacion */}
          <TouchableOpacity
          style={[styles.boton, {backgroundColor: "#00E676"}]} onPress={() => controlVentilation("open")}>
            <Fontisto name="unlocked" size={20} color="#fff"/>
            <Text style={styles.botonTexto}>Abrir Ventilacion</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
            style={[styles.boton, {backgroundColor: "#FF2800"}]} onPress={() => controlVentilation("close")}>
              <Fontisto name="locked" size={20} color="#fff"/>
              <Text style={styles.botonTexto}>Cerrar ventilación</Text>
              </TouchableOpacity>
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
    backgroundColor: "#0B0F14"
  },
  container: {
    flex: 1,
    padding: 20
  },
  header: {
    marginBottom: 20,
    paddingBottom: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1AD0CC"
  },
  overline: {
    color: "#00B8D9",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 8
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#F1F5F9"
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12
  },
  statusDot: {
    width: 10,
    height:10,

    borderRadius: 5,

    backgroundColor: "#00E676",

    marginRight: 8
  },
  statusText: {
    color: "#00E676",
    fontSize: 13,
    fontWeight: "600"
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#161B22",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  cardHalf: {
    width: "48%",
  },
  cardLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 8,
    marginTop: 6
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f1f5f9"
  },
  cardUnit: {
    fontSize: 14,
    color: "#64748b",
  },
  cardStatus: {
    fontSize: 16,
    fontWeight: "600"
  },
  boton: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    gap: 8,
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  }
  });