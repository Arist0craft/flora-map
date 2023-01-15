import getMySearchControl from "./SearchControl"

/**
 * Функция, возвращающая данные по точкам складов и т.д.
 * Может быть заменена на API метод
 * @returns {Point[]} Массив точек с координатами и описанием
 */
function getData() {
  const data = [
    {
      coords: [55.641717, 37.842475],
      name: "Склад Котельники",
      address: "МО, г. Котельники, Угрешский Проезд, с3к2",
      pochta: "info@floratrack.ru",
      phone: "8(800)555-35-35",
      wh: "8:00-19:00",
      type: "warehouse"
    },
    {
      coords: [55.906239, 37.430992],
      name: "Склад Химки",
      address: "МО, г. Химки, Заводская улица, вл11",
      pochta: "info@floratrack.ru",
      phone: "8(800)",
      wh: "00:00-24:00",
      type: "city"
    },
    {
      coords: [55.107118, 83.05268],
      name: "Склад Новосибирский",
      address: "Новосибирский район, с. Каменка, ул. Заводская д.28а стр 9",
      pochta: "info@floratrack.ru",
      phone: "8(800)",
      wh: "00:00-24:00",
      type: "soon"
    },
  ];
  return data;
}


/**
 * Создание коллекции геобъектов, которые будут отображены на Яндекс.Картах
 * @param {Point[]} geoPoints - Массив точек
 * @returns {ymaps.GeoObjectCollection} Геоколлекция из точек со складами
 */
function getMapMarkers(geoPoints) {
  const markersCollection = new ymaps.GeoObjectCollection();
  for (const p of geoPoints) {
    markersCollection.add(
      new ymaps.Placemark(
        p.coords,
        {
          balloonContentHeader:
            p.name + "<br> " + '<span class="description"></span>',
          // Зададим содержимое основной части балуна.
          balloonContentBody: '<img src="image/logo.png" height="70" width="150"> <br/> ' +
            p.phone +
            '<b></b> <br/> ',
          // Зададим содержимое нижней части балуна.
          balloonContentFooter: "",
          // Зададим содержимое всплывающей подсказки.
          hintContent: "",
        },
        {
          iconLayout: "default#image",
          iconImageHref: "image/map_marker.svg",
        }
      )
    );
  }

  return markersCollection;
}


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

  // Создаем массив с данными.
  const data = getData();

  // Размещаем метки на карте
  myMap.geoObjects.add(getMapMarkers(data));

  // Устанавливаем своё управление поиском
  myMap.controls.add(getMySearchControl(data), { float: "right" });
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