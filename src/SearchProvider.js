// Провайдер данных для элемента управления ymaps.control.SearchControl.
// Осуществляет поиск геообъектов в по массиву points.
// Реализует интерфейс IGeocodeProvider.

/** Кастомный класс геокодера */
class SearchProvider {
  constructor(geoPoints) {
    // Геоколлекция, по которой происходит поиск
    this.geoPoints = geoPoints;
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
      limit = options.results || 20;

    // Формируем поисковую выдачу по вхождению текста в название точки
    let resultPoints = [];
    for (const p of this.geoPoints) {
      if (p.name.toLowerCase().indexOf(request.toLowerCase()) != -1) {
        resultPoints.push(p);
      }
    }
    // При формировании ответа можно учитывать offset и limit.
    resultPoints = resultPoints.splice(offset, limit);

    const geoObjects = new ymaps.GeoObjectCollection();
    // Добавляем точки в результирующую коллекцию.
    for (const p of resultPoints) {
      geoObjects.add(
        new ymaps.Placemark(p.coords, {
          name: p.name,
          address: p.address,
          phone: p.phone,
          pochta: p.pochta,
          wh: p.wh,
          boundedBy: [p.coords, p.coords],
        })
      );
    }

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
      resultArray = [];
    for (let i = 0; i < this.geoPoints.length; i++) {
      const geoPoint = this.geoPoints[i];
      if (geoPoint.name.toLowerCase().indexOf(request.toLowerCase()) != -1) {
        resultArray.push({
          displayName: geoPoint.name,
          value: geoPoint.name,
        });
      }
    }
    const resultsCount = Math.min(options.results || 5, resultArray.length);

    deferred.resolve(resultArray.slice(0, resultsCount));
    return deferred.promise();
  }
}

export default SearchProvider