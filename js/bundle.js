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
          // balloonContentBody: '<img src="image/logo.png" height="70" width="150"> <br/> ' +
          //   p.phone +
          //   '<b></b> <br/> ',
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
 * Создание шаблона класса поисковой формы для Яндекс.Карт
 * @returns Шаблон поисковой формы
 */
function buildSearhLayout() {
  const domEventManager = ymaps.domEvent.manager;

  // Задаём шаблон
  const SearchLayout = ymaps.templateLayoutFactory.createClass(
    `
    <div class="map-search" id="map-search">
      <button id="map-search-button">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.7579 0.333252C9.12719 0.333387 7.52015 0.711677 6.07085 1.43656C4.62156 2.16145 3.37205 3.21191 2.42656 4.5003C1.48108 5.78869 0.86704 7.27766 0.635678 8.84297C0.404315 10.4083 0.562336 12.0046 1.09656 13.4986C1.63078 14.9926 2.52571 16.3411 3.70669 17.4316C4.88766 18.522 6.32044 19.3228 7.88547 19.7671C9.45051 20.2114 11.1024 20.2863 12.7034 19.9857C14.3044 19.685 15.808 19.0174 17.0888 18.0386L21.4826 22.2992C21.7095 22.5118 22.0134 22.6294 22.3289 22.6267C22.6443 22.624 22.9461 22.5013 23.1691 22.285C23.3922 22.0687 23.5187 21.7761 23.5215 21.4702C23.5242 21.1643 23.403 20.8696 23.1838 20.6496L18.79 16.3889C19.9787 14.9266 20.7188 13.1694 20.9256 11.3183C21.1325 9.46714 20.7978 7.59694 19.9597 5.92169C19.1216 4.24645 17.8141 2.83383 16.1868 1.84552C14.5595 0.857209 12.6781 0.333127 10.7579 0.333252ZM2.93761 10.2499C2.93761 8.23869 3.76153 6.30984 5.22812 4.88769C6.69472 3.46554 8.68384 2.66659 10.7579 2.66659C12.832 2.66659 14.8211 3.46554 16.2877 4.88769C17.7543 6.30984 18.5782 8.23869 18.5782 10.2499C18.5782 12.2611 17.7543 14.19 16.2877 15.6121C14.8211 17.0343 12.832 17.8333 10.7579 17.8333C8.68384 17.8333 6.69472 17.0343 5.22812 15.6121C3.76153 14.19 2.93761 12.2611 2.93761 10.2499Z" fill="#242424"/>
        </svg>
      </button>
      <input id="map-search-input" type="search" placeholder="{{ options.placeholderContent }}">
    </div>
    `,
    {
      build: function () {
        /*
         * Замена конструктора класса шаблона
         */
        SearchLayout.superclass.build.call(this);
        this._elements = {
          input: this._getElement("map-search-input"),
          button: this._getElement("map-search-button"),
        };
        // Добавляем прослушивание событий на наши элементы
        this._createElementListeners();
        // Добавляем поисковые подсказки к нашему полю ввода
        this._createSuggestPanel();
        // const data = this.getData(),
        //       state = data.state,
        //       sharedState = data.sharedState;

        // Добавляем элемент поля ввода в расшаренное состояние
        // Это позволит забирать поисковый запрос на событии formsubmit
        sharedState.set({formInput: this._elements.input});

      },
      _getElement: function(id) {
        return document.getElementById(id);
      },

      _createElementListeners: function() {
        // Добавление прослушивания событий на элементы формы
        const e = this._elements;
        this._elementListeners = {
          input: domEventManager.group(e.input),
          button: domEventManager.group(e.button),
        }
        this._elementListeners.input
          .add("keypress", this._onInputKeyPress, this)
          .add("keyup", this._onInputKeyUp, this);
        this._elementListeners.button.add(
          "click", 
          this._onButtonClick, this
          );
      },
      _onInputKeyPress: function(domEvent) {
        /*
        / Проверка, если вводимый символ клавиша Enter,
        / т.е отправка поискового запроса
        */
        if ("13" == domEvent.get("charCode") || "13" == domEvent.get("keyCode"))
          return (
            this._formSubmit(),
            (domEvent.originalEvent.cancelBubble = !0),
            (domEvent.originalEvent.returnValue = !1),
            domEvent.originalEvent.preventDefault &&
              domEvent.originalEvent.preventDefault(),
            !1
          );
      },
      _onInputKeyUp: function(domEvent) {
        /*
         * Помещаем в состояние значение поля ввода
         */
        this.getData().state.set("inputValue", this._elements.input.value);
      },

      _onButtonClick: function(domEvent) {
        // Клик на кнопку поискового запроса инициирует поиск
        this._formSubmit();
      },
      
      _formSubmit: function () {
        // Отправка поискового запроса
        this.events.fire("formsubmit");
      },

      _createSuggestPanel: function() {

      }
    }
  );

  return SearchLayout;
}

/**
 * Создание  кастомного управления поиском
 * @param {Point[]} geoPoints - Массив точек для поисковой выдачи
 * @returns {ymaps.control.SearchControl} Кастомное управление поиском
 */
function getMySearchControl(geoPoints) {
  // Меняем форму объектов поисковой выдачи
  // const MySearchControlPopupItemLayoutClass =
  //   ymaps.templateLayoutFactory.createClass(
  //     `
  //   <div class="item_container">
  //     <div class="item_name">{{ data.name }}</div>
  //     <div class="item_address">{{ data.address }}</div>
  //     <div class="item_address">{{ data.pochta }}</div>
  //     <div class="item_phone">{{ data.phone|default:"неизвестно" }}</div>
  //     <div class="item_wh">Время работы: {% if data.wh %} {{ data.wh }} {% else %} не работает{% endif %}</div>
  //   </div>
  //   `
  //   );



  // Создаем экземпляр класса ymaps.control.SearchControl
  const mySearchControl = new ymaps.control.SearchControl({
    options: {
      // Заменяем стандартный провайдер данных (геокодер) нашим собственным.
      provider: new SearchProvider(geoPoints),
      // Не будем показывать еще одну метку при выборе результата поиска,
      // т.к. метки коллекции myCollection уже добавлены на карту.
      noPlacemark: true,
      noCentering: true,
      resultsPerPage: 5,
      placeholderContent: "Поиск склада",
      // popupItemLayout: MySearchControlPopupItemLayoutClass,
      // layout: buildSearhLayout(),
    },
  });

  // Настраиваем зум при выборе варианта
  mySearchControl.events.add("resultshow", async function (e) {
    const resultIndex = e.get("index");
    const myMap = mySearchControl.getMap();
    mySearchControl.prevCenter = myMap.getCenter();
    mySearchControl.prevZoom = myMap.getZoom();
    const point = await mySearchControl.getResult(resultIndex);
    const newCoordinates = point.geometry.getCoordinates();
    myMap.setCenter(newCoordinates, 15, {
      checkZoomRange: true,
    });
  });

  // Возвращаем зум при очистке
  mySearchControl.events.add("clear", function (e) {
    if (mySearchControl.prevCenter && mySearchControl.prevZoom) {
      const myMap = mySearchControl.getMap();
      myMap.setCenter(mySearchControl.prevCenter, mySearchControl.prevZoom);
    }
  });

  // const suggestView = new ymaps.SuggestView("map-suggest", {provider: new CustomSearchProvider(geoPoints), results: 5});

  return mySearchControl;
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
  console.log(myMap);
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
  for (b of controlButtons) {
    b.addEventListener("click", function (e) {
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
