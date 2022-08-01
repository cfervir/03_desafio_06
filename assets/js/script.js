const iniciarBusqueda = document.querySelector('#iniciarBusqueda');
let resultadoFinal = document.querySelector('#resultadoFinal');
let sectionBG = document.getElementById('sectionBG');
let disclaimer = document.getElementById('disclaimer');

iniciarBusqueda.addEventListener('click', () => { inicioCalculo(); });

let inicioCalculo = () => {
  const cantidad = document.querySelector('#cantidadCLP').value;
  const moneda = document.querySelector('#selectorMonedas').value;

  cantidad == '' ? alert(`¡Debes ingresar un valor!`) : calcularDivisa(cantidad, moneda);
};

async function calcularDivisa(cantidad, moneda) {
  try {
    const res = await fetch(`https://mindicador.cl/api/${moneda}`);
    const datos = await res.json();

    let unidadMoneda = eval(`document.querySelector('#moneda_${moneda}').innerHTML;`);
    disclaimer.textContent = '';

    switch (moneda) {
      case 'dolar':
      case 'euro':
        resultadoFinal.textContent = `$${(cantidad / datos.serie[0].valor).toLocaleString('es-CL', {maximumFractionDigits: 2})} ${unidadMoneda}`;
        break;
      case 'uf':
      case 'utm':
        resultadoFinal.textContent = `$${(cantidad / datos.serie[0].valor).toLocaleString('es-CL', {maximumFractionDigits: 3})} ${unidadMoneda}`;
        break;
      case 'bitcoin':
        async function obtenerUSD() {
          try {
            const res = await fetch(`https://mindicador.cl/api/dolar`);
            const dolar = await res.json();

            let valorDolar = dolar.serie[0].valor;
            return valorDolar;

          } catch (e) {
            alert(`Ooops, pasó que: ${e.message}`);
          };
        };
        const datosUSD = await obtenerUSD();
        resultadoFinal.textContent = `$${((cantidad / datos.serie[0].valor) / datosUSD).toLocaleString('es-CL', {maximumFractionDigits: 5})} ${unidadMoneda}`;
        disclaimer.textContent = `* Bitcoin en el gráfico está expresado en USD.`
    };

  } catch (e) {
    alert(`Ooops, pasó que: ${e.message}`);
  };

  datosGrafico(moneda);
};

async function datosGrafico(moneda) {
  try {
    const res = await fetch(`https://mindicador.cl/api/${moneda}/2022`);
    const datos = await res.json();

    let myChart = document.getElementById("myChart");

    let labels = datos.serie.slice(0,100).map((info) => info.fecha.replace(/T04:00:00.000Z|T03:00:00.000Z/,'')).reverse();
    let data = datos.serie.slice(0,100).map((info) => info.valor).reverse();

    let bgRandom = Math.floor(Math.random()*16777215).toString(16);

    const dataFinal = {
      labels: labels,
      datasets: [{
        label: `${moneda.toUpperCase()}`,
        data: data,
        borderColor: `#${bgRandom}`,
      }],
    };
    
    const config = {
      type: 'line',
      data: dataFinal,
    };

    if (window.myNewChart && window.myNewChart !== null){
      window.myNewChart.destroy();
    };

    sectionBG.style.backgroundColor = '#ffffff';
    sectionBG.style.boxShadow = '5px 5px 0px 0px rgba(0,0,0,0.85)';

    window.myNewChart = new Chart(myChart, config);

  } catch (e) {
    alert(`Ooops, pasó que: ${e.message}`);
  };
};