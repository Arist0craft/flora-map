export default class ScrollControl {

  /**
   * @param {HTMLElement} mapSection Секция карты
   * @param {any} map Инстанс Яндекс.Карт
   */
  constructor(mapSection, map) {
    this._map = map;
    this._isScrolling = false;
    this._scrollingEndCallback = undefined;
    this._isScrollButtonPressed = false;
    this._mapSection = mapSection;
    this._infoElement = this._mapSection.querySelector(".map-scroll-info");
    const infoTextElement = this._infoElement.querySelector(".map-scroll-info-text");

    this._isTouchDevice = (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0));

    this._isMacDevice = navigator.userAgent.indexOf('Mac') != -1;

    if(this._isTouchDevice) {
      map.behaviors.disable("drag");
      infoTextElement.innerHTML = "Чтобы переместиить карту, проведите по ней двумя пальцами";
    } else {
      const buttonText =  this._isMacDevice ? "⌘" : "Ctrl";
      infoTextElement.innerHTML = `Чтобы изменить масштаб, нажмите ${buttonText} + прокрутка`;
    }
  }

  /**
   * Обработчик нажатия клавиш Ctrl/Cmd
   * @param {Event} e Событие нажатия клавиши
   */
  _scrollButtonDown(e) {
    if(this._isScrollButtonPressed) {
      return;
    }
    if(this._isMacDevice && e.metaKey) {
      this._isScrollButtonPressed = true;
      this._map.behaviors.enable("scrollZoom");

    } else if (!this._isMacDevice && e.ctrlKey) {
      this._isScrollButtonPressed = true;
      this._map.behaviors.enable("scrollZoom");
    }
  }

  /**
   * Обработчик отпускания клавиш Ctrl/Cmd
   * @param {Event} e Событие отпускания клавиши
   */
  _scrollButtonUp(e) {
    if(!this._isScrollButtonPressed) {
      return;
    }
    this._isScrollButtonPressed = false;
    this._map.behaviors.disable("scrollZoom");
  }

  /**
   * Обработчик скролла. Если на карту наведена мышь, то мы показываем шторку
   * подсказки
   * @param {Event} e Событие скролла
   */
  _scrollWindow(e) {
    const timeOutCallback = function() {
      if(this._infoElement.style.opacity == 1) {
        this._infoElement.style.opacity = 0;
      }
    }

    window.clearTimeout(this._scrollingEndCallback);
    if(this._mapSection.matches(":hover") && !this._isScrollButtonPressed) {
      this._infoElement.style.opacity = 1;
      this._infoElement.style.transitionDuration = "0.3s";
      this._scrollingEndCallback = setTimeout(timeOutCallback.bind(this), 1000);
    }
  }

  /**
   * Событие окончания анимации показа шторки
   * @param {Event} e Событие окончания анимации
   */
  _transitionEnd(e) {
    if (this._infoElement.style.transitionDuration == "0.3s") {
      this._infoElement.style.transitionDuration = "0.8s";
    }
  }


  registerHandlers() {
    // Проверка на зажатую кнопку Ctrl/Cmd
    window.addEventListener("keydown", e => this._scrollButtonDown(e));
    window.addEventListener("keyup", e => this._scrollButtonUp(e));
    window.addEventListener("scroll", e => this._scrollWindow(e));
    // После скролла с наведением на карту возвращаем длину анимации
    this._infoElement.addEventListener("transitionend", e => this._transitionEnd(e));
  }
}


/**
 * Включение и отключение автоматического скролла для улучшения навигации по
 * странице
 * @param {DOMElement} mapSection Контейнер карты и её управления
 * @param {ymaps.Map} map Инстанс карты
 */
function controlMapScroll(mapSection, map) {

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

    // Показ уведомления, если пользователь скроллит страницу с ховером на карту
    document.addEventListener("scroll", function(){
      if(mapSection.children.map.matches(":hover")) {
  
      }
    })

      // mapSection.children.map.addEventListener("touchstart", onTouchStartMap);
  // mapSection.children.map.addEventListener("touchmove", onTouchMoveMap);
  // mapSection.children.map.addEventListener("touchend", onTouchEndMapDragEnable);
  
  

  // for (let e of mapSection.children) {
  //   e.addEventListener("click", onClickMapScrollEnable);
  // }



  // // Отключаем скролл зум, если клик произошёл вне карты
  // document.body.addEventListener("click", onClickMapScrollDisable);
  
  // // Если клик или тач произошёл вне карты, то отключаем зум
  // document.body.addEventListener("touchend", onTouchEndMapDragDisable);
} 