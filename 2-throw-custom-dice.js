// ¡Buena suerte!
function lanzarDado() {
    let x = Number(process.argv[2]);
    const resultado = Math.floor(Math.random() * x) + 1;
    console.log(`Resultado del dado (${x} caras): ${resultado}`);
  }

  lanzarDado();