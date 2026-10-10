const colores = {
  BL: "#FFFFFF",
  AM: "#F9E300",
  NA: "#ff6720",
  RO: "#DA291C",
  VI: "#753bbd",
  AZ: "#0032a0",
  VE: "#007934"
};

const wiphala = [
  ["BL", "AM", "NA", "RO", "VI", "AZ", "VE"],
  ["VE", "BL", "AM", "NA", "RO", "VI", "AZ"],
  ["AZ", "VE", "BL", "AM", "NA", "RO", "VI"],
  ["VI", "AZ", "VE", "BL", "AM", "NA", "RO"],
  ["RO", "VI", "AZ", "VE", "BL", "AM", "NA"],
  ["NA", "RO", "VI", "AZ", "VE", "BL", "AM"],
  ["AM", "NA", "RO", "VI", "AZ", "VE", "BL"]
];


// ========================================
// FOTOS
// ========================================

let fotos = {
  BL: [],
  AM: [],
  NA: [],
  RO: [],
  VI: [],
  AZ: [],
  VE: []
};


// Las 7 fotos que se muestran actualmente
let seleccion = {
  BL: [],
  AM: [],
  NA: [],
  RO: [],
  VI: [],
  AZ: [],
  VE: []
};


let imagenesCargadas = false;


// ========================================
// CAMBIO DE FOTOS
// ========================================

let ultimoCambio = 0;
const intervalo = 1000;


// ========================================
// FLAMEO
// ========================================

const amplitud = 12;
const frecuencia = 1.2;
const velocidad = 0.0025;


// ========================================
// SETUP
// ========================================

async function setup() {

  createCanvas(windowWidth, windowHeight);

  noStroke();


  // Cargar imágenes
  for (let codigoColor in fotos) {

    let rutas = [];

    for (let i = 1; i <= 7; i++) {

      let numero = nf(i, 2);

      rutas.push(
        `images/${nombreColor(codigoColor)}_${numero}.png`
      );
    }

    fotos[codigoColor] = await Promise.all(
      rutas.map(ruta => loadImage(ruta))
    );
  }


  console.log("Todas las imágenes cargadas.");


  // Selección inicial
  for (let codigoColor in fotos) {

    seleccion[codigoColor] = [];

    for (let i = 0; i < 7; i++) {
      seleccion[codigoColor].push(i);
    }
  }


  imagenesCargadas = true;

  ultimoCambio = millis();
}


// ========================================
// NOMBRE DE COLOR
// ========================================

function nombreColor(codigo) {

  const nombres = {
    BL: "blanco",
    AM: "amarillo",
    NA: "naranja",
    RO: "rojo",
    VI: "violeta",
    AZ: "azul",
    VE: "verde"
  };

  return nombres[codigo];
}


// ========================================
// DRAW
// ========================================

function draw() {

  background(0);

  if (!imagenesCargadas) {
    return;
  }


  // Cambiar fotos cada 12 segundos
  if (millis() - ultimoCambio >= intervalo) {

    cambiarFotos();

    ultimoCambio = millis();
  }


  dibujarWiphala();
}


// ========================================
// CAMBIAR FOTOS
// ========================================

function cambiarFotos() {

  console.log("CAMBIO DE FOTOS");

  for (let codigoColor in fotos) {

    let indicesDisponibles = [];

    for (let i = 0; i < fotos[codigoColor].length; i++) {
      indicesDisponibles.push(i);
    }


    indicesDisponibles =
      mezclarArray(indicesDisponibles);


    seleccion[codigoColor] =
      indicesDisponibles.slice(0, 7);
  }
}


// ========================================
// MEZCLAR ARRAY
// ========================================

function mezclarArray(array) {

  let copia = [...array];

  for (let i = copia.length - 1; i > 0; i--) {

    let j = floor(random(i + 1));

    let temporal = copia[i];

    copia[i] = copia[j];
    copia[j] = temporal;
  }

  return copia;
}


// ========================================
// FLAMEO
// ========================================

function movimientoFlameo(columna, fila, tiempo) {

  /*
   * La onda se propaga de izquierda
   * a derecha.
   *
   * El lado izquierdo se mueve menos.
   */

  let progresoX = columna / 6;

  let onda =
    sin(
      tiempo +
      progresoX * frecuencia * TWO_PI
    );


  // El movimiento aumenta hacia la derecha
  let fuerza =
    progresoX * progresoX;


  return onda * amplitud * fuerza;
}


// ========================================
// DIBUJAR WIPHALA
// ========================================

function dibujarWiphala() {

  let lado = min(width, height);

  let tamano = lado / 7;

  let inicioX =
    (width - lado) / 2;

  let inicioY =
    (height - lado) / 2;


  let tiempo =
    millis() * velocidad;


  // ----------------------------------------
  // CONTADOR DE FOTOS
  // ----------------------------------------

  let indices = {
    BL: 0,
    AM: 0,
    NA: 0,
    RO: 0,
    VI: 0,
    AZ: 0,
    VE: 0
  };


  // ----------------------------------------
  // DIBUJAR
  // ----------------------------------------

  for (let fila = 0; fila < 7; fila++) {

    for (let columna = 0; columna < 7; columna++) {

      let codigoColor =
        wiphala[fila][columna];


      // ------------------------------------
      // POSICIÓN ORIGINAL
      // ------------------------------------

      let x =
        inicioX +
        columna * tamano;

      let y =
        inicioY +
        fila * tamano;


      // ------------------------------------
      // FLAMEO
      // ------------------------------------

      let desplazamiento =
        movimientoFlameo(
          columna,
          fila,
          tiempo
        );


      /*
       * Para que toda la celda se mueva
       * como una pieza.
       */

      let xFinal =
        x;

      let yFinal =
        y +
        desplazamiento;


      // ------------------------------------
      // FONDO
      // ------------------------------------

      fill(colores[codigoColor]);

      rect(
        xFinal,
        yFinal,
        tamano,
        tamano
      );


      // ------------------------------------
      // FOTO
      // ------------------------------------

      let posicion =
        indices[codigoColor];


      let indiceImagen =
        seleccion[codigoColor][posicion];


      let img =
        fotos[codigoColor][indiceImagen];


      image(
        img,
        xFinal,
        yFinal,
        tamano,
        tamano
      );


      indices[codigoColor]++;
    }
  }
}


// ========================================
// REDIMENSIONAR
// ========================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );
}