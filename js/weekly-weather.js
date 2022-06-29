import { getCurrentPosition } from "./geolocation.js";
import { getWeather } from "./services/weather.js";
import { formatWeekList, formatTemp, formatHumidity, formatWind } from "./utils/format-data.js";
import { createDOM } from "./utils/dom.js";
import draggable from "./draggable.js";

function getTime(hour) {
  return hour >= 12 ? "p" : "a";
}

function getHour(hour) {
  return hour % 12 == 0 ? 12 : hour % 12;
}

function dayItemTemplate(weather, index) {
  const selected = index == 0 ? 'is-selected' : ''
  const temp = formatTemp(weather.main.temp);
  const hour = new Date(weather.dt * 1000).getHours();
  const time = getTime(hour);
  const relativeHour = getHour(hour);
  const match = window.matchMedia(
    "(-webkit-min-device-pixel-ratio: 2)"
  ).matches;
  const resolution = match ? "@2x" : "";
  const icon = `${weather.weather[0].icon}${resolution}`;

  return `
    <li class="dayWeather-item ${selected}">
      <span class="dayWeather-time">${relativeHour} ${time}.&nbsp;m.</span>
      <img
        class="dayWeather-icon"
        height="48px"
        width="48px"
        src="https://openweathermap.org/img/wn/${icon}.png"
        alt="light"
        rain=""
      />
      <span class="dayWeather-temp">${temp}</span>
    </li>
  `;
}

function tabPanelTemplate(index) {
  const hidden = index == 0 ? "" : "hidden";
  return `
    <div class="tabPanel" tabindex="0" aria-labelledby="tab-${index}" ${hidden}>
      <div class="dayWeather" id="dayWeather-${index}">
        <ul class="dayWeather-list" id="dayWeather-list-${index}">
        </ul>
      </div>
    </div>
  `;
}

function dailyInfoTemplate(weather, index) {
  console.log(weather)
  const max = formatTemp(weather.main.temp_max)
  const min = formatTemp(weather.main.temp_min)
  const humidity = formatHumidity(weather.main.humidity)
  const wind = formatWind(weather.wind.speed)
  const hidden = index == 0 ? "" : "hidden";
  return `
    <div ${hidden}>
      <div class="dayWeather-summary">
        <p>Max: <b>${max}</b></p>
        <p>Min: <b>${min}</b></p>
        <p>Viento <b>${wind}</b></p>
        <p>Humedad: <b>${humidity}</b></p>
      </div>
    </div>
  `
}

function handleWeekDayClick(event) {
  console.log(event)
}

function createItem(weather, index) {
  return createDOM(dayItemTemplate(weather, index));
}

function createItems(weatherList, $ul) {
  weatherList.forEach((weather, index) => {
    const $el = createItem(weather, index);
    $ul.append($el);
  });
}

function createTabPanel(index) {
  return createDOM(tabPanelTemplate(index));
}

function createInfoDailyPanel(weather, index) {
  return createDOM(dailyInfoTemplate(weather, index))
}

function createDailyPanel(weekList, $container) {
  const $days = $container.querySelectorAll('.dayWeather-item')
  $days.forEach(($li, index) => {
    const $item = createInfoDailyPanel(weekList[index],index) 
    $container.append($item)
  })
}   

function createPanel(weekList, $container) {
  weekList.forEach((item, index) => {
    const $el = createTabPanel(index);
    $container.append($el);
    
    const $ul = $el.querySelector(`#dayWeather-list-${index}`);
    createItems(item, $ul);
    const $panel = document.querySelector(`#dayWeather-${index}`)
    createDailyPanel(weekList[index], $panel)
  });
}

function configWeeklyWeather(weekList) {
  const $container = document.querySelector(".tabs");

  createPanel(weekList, $container);
}

async function weeklyWeather() {
  const $container = document.querySelector(".weeklyWeather");
  try {
    const { latitude, longitude } = await getCurrentPosition();
    const data = await getWeather(latitude, longitude, "forecast");
    const weekList = formatWeekList(data.list);
    configWeeklyWeather(weekList);
    draggable($container);
  } catch (error) {
    console.log(error);
  }
}

export default weeklyWeather;
