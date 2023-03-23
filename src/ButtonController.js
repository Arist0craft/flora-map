import getMapMarkers from "./Markers";

/**
 * Класс управления фильтрацией маркеров через кнопки на карте
 */
class ButtonController {
  /**
   * Конструктор контроллера
   * @param {ymaps.Map} map Объект Яндекс.Карт
   * @param {*} options Опции инициализации контроллера
   */
  constructor(map, options = {}) {
    this._map = map;
    this._mapMarkersData = options?.mapMarkersData || window.mapMarkersData;
    if (!this._mapMarkersData) {
      throw Error("No markers data provided");
    }
    this._markersCollections = getMapMarkers(this._mapMarkersData);
  }

  /**
   * Добавление маркеров определённого типа на карту
   * @param {String} markersType Тип маркеров для добавления на карту
   */
  _addMarkers(markersType) {
    this._map.geoObjects.add(this._markersCollections[markersType]);
  }

  /**
   * Удаление маркеров определённого типа с карты
   * @param {String} markersType Тип маркеров для удаления с карты
   */
  _removeMarkers(markersType) {
    this._map.geoObjects.remove(this._markersCollections[markersType]);
  }

  /**
   * Сделать кнопку фильтрации маркеров активной
   * @param {DOMElement} button Кнопка фильтрации маркеров
   */
  setActive(button) {
    if (this._activeButton && this._activeButton != button) {
      this._unsetActive();
    }

    this._addMarkers(button.dataset.type);
    button.classList.add("active");
    this._activeButton = button;
  }

  /**
   * Сделать текущую активную кнопку фильтрации неактивной
   */
  _unsetActive() {
    this._removeMarkers(this._activeButton.dataset.type);
    this._activeButton.classList.remove("active");
  }

  /**
   * Геттер текущей активной кнопки фильтрации
   * @returns Текущая активная кнопка фильтрации
   */
  getActiveButton() {
    return this._activeButton;
  }

  getActiveType(){
    return this.getActiveButton().dataset.type;
  }

  /**
   * Геттер словаря с коллекциями маркеров разных типов
   * @returns Словарь с коллекциями маркеров разных типов
   */
  getMarkersCollections() {
    return this._markersCollections;
  }  
}


/**
 * Добавление управления кнопкам карты
 * @param {ButtonController} buttonController контроллер управления кнопками
 */
function addMapControls(buttonController) {
 const controlButtons = document.querySelectorAll("button[name='map_control']");
 for (const button of controlButtons) {
  if (button.dataset.type == "warehouse") {
    buttonController.setActive(button);
  }
   button.addEventListener("click", function (e) {
      buttonController.setActive(button);
   });
 }
}


export {ButtonController, addMapControls};