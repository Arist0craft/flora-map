import getMySearchControl from "./SearchControl"
import { ButtonController, addMapControls } from "./ButtonController"


/**
 * Включение и отключение автоматического скролла для улучшения навигации по
 * странице
 * @param {DOMElement} mapSection Контейнер карты и её управления
 * @param {ymaps.Map} map Инстанс карты
 */
function controlMapMobileScrolling(mapSection, map) {
  // Отключаем скролл карты по дефолту
  map.behaviors.disable(["scrollZoom", "drag"]);

  /**
   * Включение зума на скролл при клике на карту
   * @param {Event} e Событие клика на карту
   */
  function onClickMapScrollEnable(e){
    if (!map.behaviors.isEnabled("scrollZoom")) {
      map.behaviors.enable("scrollZoom");

    }
  }

  /**
   * Отключение зума на скролл при клике на любой элемент, кроме карты
   * @param {Event} e Событие клика вне карты
   */
  function onClickMapScrollDisable(e) {
    if (
      !mapSection.contains(e.target) 
      && map.behaviors.isEnabled("scrollZoom")
      ) {
      map.behaviors.disable("scrollZoom");
    }
  }

  /**
   * При таче на карту / элементы управления включаем драг карты
   * @param {Event} e Событие на начало тача
   */
  function onTouchStartMap(e) {
    map.isTouchMoved = false;
  }

  /**
   * Если тач карты был с движением, пример скролл страницы, то ставим флаг
   * @param {Event} e Событие движения при таче
   */
  function onTouchMoveMap(e) {
    map.isTouchMoved = true;
  }

  /**
   * Если тач карты был с движением, то не включаем движение карты, или включаем драг
   * @param {Event} e Событие движения при таче
   */
  function onTouchEndMapDragEnable(e) {
    if (
      !map.isTouchMoved
      && !map.behaviors.isEnabled("drag")
      ) {
      map.behaviors.enable("drag");
    }
  }
  
  /**
   * Если тач был вне карты или кнопок фильтрации, то отключаем драг
   * @param {Event} e Событие тача вне карты
   */
  function onTouchEndMapDragDisable(e) {
    if (
      ![...mapSection.querySelectorAll(".control"), mapSection.children.map]
        .some(c => c.contains(e.target))
      && map.behaviors.isEnabled("drag")
    ) {
      map.behaviors.disable("drag");
    }
  }

  for (let e of mapSection.children) {
    e.addEventListener("click", onClickMapScrollEnable);
  }

  mapSection.children.map.addEventListener("touchstart", onTouchStartMap);
  mapSection.children.map.addEventListener("touchmove", onTouchMoveMap);
  mapSection.children.map.addEventListener("touchend", onTouchEndMapDragEnable);

  // Отключаем скролл зум, если клик произошёл вне карты
  document.body.addEventListener("click", onClickMapScrollDisable);
  
  // Если клик или тач произошёл вне карты, то отключаем зум
  document.body.addEventListener("touchend", onTouchEndMapDragDisable);
} 


/**
 * Инициализация Яндекс.Карт
 */
function initYandexMapsCallback() {
  const mapSection = document.querySelector(".section-map");

  // Создаём объект карты
  const myMap = new ymaps.Map("map", {
    center: [55.7, 37.6],
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

  // Контроль скролла карты
  controlMapMobileScrolling(mapSection, myMap);
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


function main() {
  initYmaps();
}

document.addEventListener("DOMContentLoaded", main);