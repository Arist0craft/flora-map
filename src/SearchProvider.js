// Провайдер данных для элемента управления ymaps.control.SearchControl.
// Осуществляет поиск геообъектов в по массиву points.
// Реализует интерфейс IGeocodeProvider.

import ButtonController from "./ButtonController";

/** Кастомный класс геокодера */
export default class SearchProvider {

  /**
   * Конструктор поискового провайдера
   * @param {ButtonController} buttonController Контроллер управления кнопками фильтров
   */
  constructor(buttonController) {
    // Геоколлекция, по которой происходит поиск
    this._buttonController = buttonController;
    this._markersCollections = buttonController.getMarkersCollections();
  }

  /**
   * Функция поиска по тексту
   * @param {string} request - Поиcковый запрос
   * @param {object} options - Опции поискового запроса
   * @return {object} Промис от vow объекта
   */
  geocode(request, options) {
    const deferred = new ymaps.vow.defer(),
      // Сколько результатов нужно пропустить.
      offset = options.skip || 0,
      // Количество возвращаемых результатов.
      limit = options.results || 20,
      currentMarkersType = this._buttonController.getActiveType(),
      currentMarkersCollection = this._markersCollections[currentMarkersType];

    // Формируем поисковую выдачу по вхождению текста в название точки
    let geoObjects = new ymaps.GeoObjectCollection();

    for (const marker of currentMarkersCollection.toArray()) {
      const markerName = marker.properties.get("name"),
        coords = marker.geometry.getCoordinates(),
        properties = {
          boundedBy: [coords, coords]
        };

      if (markerName.toLowerCase().indexOf(request.toLowerCase()) != -1) {
        geoObjects.add(new ymaps.Placemark(coords, properties));
      }
    }
    // При формировании ответа можно учитывать offset и limit.
    geoObjects = geoObjects.splice(offset, limit);

    deferred.resolve({
      // Геообъекты поисковой выдачи.
      geoObjects: geoObjects,
      // Метаинформация ответа.
      metaData: {
        geocoder: {
          // Строка обработанного запроса.
          request: request,
          // Количество найденных результатов.
          found: geoObjects.getLength(),
          // Количество возвращенных результатов.
          results: limit,
          // Количество пропущенных результатов.
          skip: offset,
        },
      },
    });

    // Возвращаем объект-обещание.
    return deferred.promise();
  }

  /**
   * Функция выдачи подсказки поисковых запросов по тексту
   * @param {string} request - Поиcковый запрос
   * @param {object} options - Опции поискового запроса
   * @return {object} Промис от vow объекта (массив подсказок в случае удачи)
   */
  suggest(request, options) {
    const deferred = new ymaps.vow.defer(),
      resultArray = [],
      currentMarkersType = this._buttonController.getActiveType(),
      currentMarkersCollection = this._markersCollections[currentMarkersType];

    for (let i = 0; i < currentMarkersCollection.getLength(); i++) {
      const marker = currentMarkersCollection.get(i),
        markerName = marker.properties.get("name");

      if (markerName.toLowerCase().indexOf(request.toLowerCase()) != -1) {
        resultArray.push({
          displayName: markerName,
          value: markerName,
        });
      }
    }
    const resultsCount = Math.min(options.results || 5, resultArray.length);

    deferred.resolve(resultArray.slice(0, resultsCount));
    return deferred.promise();
  }
}
