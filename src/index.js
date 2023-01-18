import getMySearchControl from "./SearchControl"
import { ButtonController, addMapControls } from "./ButtonController"

/**
 * Инициализация Яндекс.Карт
 */
function initYandexMapsCallback() {


  // Создаём объект карты
  const myMap = new ymaps.Map("map", {
    center: [55.7, 54.5],
    zoom: 5,
    controls: [],
  });


  // Задаём управление фильтрами
  const buttonController = new ButtonController(myMap);
  addMapControls(buttonController);

  // Устанавливаем своё управление поиском
  myMap.controls.add(
    getMySearchControl(buttonController),
    { float: "right" }
  );

  myMap.controls.add(new ymaps.control.ZoomControl({
    options: {
      position: {
        top: 108,
        right: 10
      }
    }
  }));

  const mobileSearch = new ymaps.SuggestView()
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
  console.log(1);
}


function main() {
  initYmaps();
}

document.addEventListener("DOMContentLoaded", main);