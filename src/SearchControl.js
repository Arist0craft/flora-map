import SearchProvider from "./SearchProvider";

/**
 * Создание шаблона класса поисковой формы для Яндекс.Карт
 * @returns Шаблон поисковой формы
 */
function buildSearсhLayout() {
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
      /**
       * Создание инстанса шаблона поиска по карте
       */
      build: function () {
        SearchLayout.superclass.build.call(this);
        this._elements = {
          input: this._getElement("map-search-input"),
          button: this._getElement("map-search-button"),
        };
        const data = this.getData(),
          state = data.state

        // Добавляем элемент поля ввода в состояние
        // Это позволит обращ
        state.set({ formInput: this._elements.input });

        // Создаём панель поисковых подсказок
        this._createSuggestView();

        // Добавляем прослушивание событий на наши элементы
        this._createElementListeners();

      },

      /**
       * Поиск DOM элемента по его id
       * @param {string} id id DOM элемента
       * @returns DOM элемент
       */
      _getElement: function (id) {
        return document.getElementById(id);
      },

      /**
       * Добавление прослушивания событий к элементам формы поиска
       */
      _createElementListeners: function () {
        const e = this._elements;
        this._elementListeners = {
          input: domEventManager.group(e.input),
          button: domEventManager.group(e.button),
        };
        this._elementListeners.input
          .add("keypress", this._onInputKeyPress, this)
          .add("search", this._onClearInput, this);
        this._elementListeners.button.add("click", this._handleRequest, this);

        this._suggestViewListeners = this._suggestView.events
          .group()
          .add("select", this._handleRequest, this);
      },

      /**
       * Обработчик ввода символов в поле поиска
       * @param {Event} domEvent Событие ввода символа в поле поиска
       */
      _onInputKeyPress: function (domEvent) {
        // Если клавиша enter - обрабатываем запрос
        if ("13" == domEvent.get("charCode") || "13" == domEvent.get("keyCode")) {
          this._handleRequest();
        }
      },

      /**
       * Обработчик очистки поискового поля
       * @param {Event} domEvent Событие ввода символа в поле поиска
       */
      _onClearInput: function (domEvent) {
        const searchRequest = domEvent.get("target").value;
        if (!searchRequest) {
          this.events.fire("dataclear");
        } 
      },

      /**
       * Создание панели поисковых подсказок
       */
      _createSuggestView: function () {
        const d = this.getData(),
              input = this._elements.input;
        if (input) {
          this._suggestView = new ymaps.SuggestView(input, {
            provider: d.options.get("provider"),
            results: d.options.get("results"),
          })
        } else {
          console.error("Can't create SuggestView without input");
        }
      },

      /**
       * Обработка поискового запроса, старт поиска
       */
      _handleRequest: function () {
        const searchRequest = this._elements.input.value;
        if (searchRequest) {
          this.events.fire("search", {request: searchRequest});
        }
      },
    }
  );

  return SearchLayout;
}

/**
 * Создание  кастомного управления поиском
 * @param {Point[]} geoPoints - Массив точек для поисковой выдачи
 * @returns {ymaps.control.SearchControl} Кастомное управление поиском
 */
export default function getMySearchControl(geoPoints) {
  // Создаем экземпляр класса ymaps.control.SearchControl
  const mySearchControl = new ymaps.control.SearchControl({
    options: {
      // Заменяем стандартный провайдер данных (геокодер) нашим собственным.
      provider: new SearchProvider(geoPoints),
      // Не будем показывать еще одну метку при выборе результата поиска,
      // т.к. метки коллекции myCollection уже добавлены на карту.
      noPlacemark: true,
      noCentering: true,
      results: 5,
      placeholderContent: "Поиск склада",
      layout: buildSearсhLayout(),
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
      mySearchControl.prevCenter = undefined;
      mySearchControl.prevZoom = undefined;
    }
  });

  return mySearchControl;
}
