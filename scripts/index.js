const API_KEY = CONFIG.API_KEY;
const API_URL = `https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`;
const ROUNDING_DECIMALS = 0;

const previousWeatherToggle = document.querySelector('.show-previous-weather');
const previousWeather = document.querySelector('.previous-weather');

const currentSolElement = document.querySelector('[data-current-sol]');
const currentDateElement = document.querySelector('[data-current-date]');
const currentTempHighElement = document.querySelector('[data-current-temp-high]');
const currentTempLowElement = document.querySelector('[data-current-temp-low]');
const currentWindSpeedElement = document.querySelector('[data-wind-speed]');
const currentWindDirectionTextElement = document.querySelector('[data-wind-direction-text]');
const currentWindDirectionArrowElement = document.querySelector('[data-wind-direction-arrow]');

const previousSolTemplate = document.querySelector('[data-previous-sol-template]');
const previousSolContainer = document.querySelector('[data-previous-sols]');

previousWeatherToggle.addEventListener('click', () => {
  previousWeather.classList.toggle('show-weather')
});

let selectedSolIndex

getWeather().then(sols => {
  selectedSolIndex = sols.length - 1;
  displaySelectedSol(sols);
  displayPreviousSols(sols);
})


function displaySelectedSol(sols) {
  const selectedSol = sols[selectedSolIndex];
  currentSolElement.innerText = selectedSol.sol;
  currentDateElement.innerText = displayDate(selectedSol.date);
  currentTempHighElement.innerText = displayTemperature(selectedSol.maxTemp);
  currentTempLowElement.innerText = displayTemperature(selectedSol.minTemp);
  currentWindSpeedElement.innerText = displaySpeed(selectedSol.windSpeed);
  currentWindDirectionArrowElement.style.setProperty('--direction', `${selectedSol.windDirectionDegrees}deg`)
  currentWindDirectionTextElement.innerText = selectedSol.windDirectionCardinal;
}

function displayPreviousSols(sols) {
  previousSolContainer.innerHTML = '';
  sols.forEach((solData, index) => {
    const solContainer = previousSolTemplate.content.cloneNode(true);
    solContainer.querySelector('[data-sol').innerText = solData.sol
    solContainer.querySelector('[data-date]').innerText = displayDate(solData.date);
    solContainer.querySelector('[data-temp-high]').innerText = displayTemperature(solData.maxTemp);
    solContainer.querySelector('[data-temp-low]').innerText = displayTemperature(solData.minTemp);
    solContainer.querySelector('[data-select-button]').addEventListener('click', () => {
      selectedSolIndex = index
      displaySelectedSol(sols)
    })
    previousSolContainer.appendChild(solContainer);
  })
}


function displayDate(date) {
  return date.toLocaleDateString(
    undefined,
    { day: 'numeric', month: 'long' }
  )
}

function displayTemperature(temperature) {
  return Math.round(temperature * (10 ** ROUNDING_DECIMALS)) / (10 ** ROUNDING_DECIMALS)
}

function displaySpeed(speed) {
  return Math.round(speed * (10 ** ROUNDING_DECIMALS)) / (10 ** ROUNDING_DECIMALS)
}

function getWeather() {
  return fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      const {
        sol_keys,
        validity_checks,
        ...solData
      } = data
      return Object.entries(solData).map(([sol, data]) => {
        return {
          sol: sol,
          maxTemp: data.AT.mx,
          minTemp: data.AT.mn,
          windSpeed: data.HWS.av,
          windDirectionDegrees: data.WD.most_common.compass_degrees,
          windDirectionCardinal: data.WD.most_common.compass_point,
          date: new Date(data.First_UTC)
        }
      })
    })
}
