import getMySearchControl from "./SearchControl"
import getMapMarkers from "./Markers"

/**
 * Инициализация Яндекс.Карт
 */
function initYandexMapsCallback() {
  // Создаём объект карты
  const myMap = new ymaps.Map("map", {
    center: [55.7, 54.5],
    zoom: 5,
    controls: ["zoomControl"],
  });

  const geoOjectCollections = getMapMarkers(window.mapPointsData);

  // Размещаем метки на карте
  myMap.geoObjects.add(geoOjectCollections["warehouse"]);

  // Устанавливаем своё управление поиском
  myMap.controls.add(getMySearchControl(geoOjectCollections["warehouse"]), { float: "right" });
}


/**
 * Дожидаемся загрузки библиотеки ymaps из CDN, после чего инициализуруем карту
 */
function initYmaps() {
  const ymapsScript = document.createElement("script");
  ymapsScript.type = "text/javascript";
  ymapsScript.src =
    "https://api-maps.yandex.ru/2.1/?lang=ru_RU&amp;apikey=492e958b-e294-47cb-a1e5-c938260b6a0e";

  ymapsScript.addEventListener("load", (e) => {
    ymaps.ready(initYandexMapsCallback);
  });
  document.head.appendChild(ymapsScript);
}


/**
 * Добавление управления кнопкам карты
 */
function addMapControls() {
  let controlButtons = document.querySelectorAll("button[name='map_control']");
  for (const button of controlButtons) {
    button.addEventListener("click", function (e) {
      Array.prototype.map.call(controlButtons, (b) =>
        b.classList.remove("active")
      );
      e.target.classList.add("active");
    });
  }
}


function main() {
  addMapControls();
  initYmaps();
}

document.addEventListener("DOMContentLoaded", main);