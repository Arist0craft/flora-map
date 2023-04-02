export default class ScrollControl {

  /**
   * @param {HTMLElement} mapSection Секция карты
   * @param {any} map Инстанс Яндекс.Карт
   */
  constructor(mapSection, map) {
    this._map = map;
    this._scrollingEndCallback = undefined;
    this._isScrollButtonPressed = false;
    this._isToucheMoved = false;
    this._mapSection = mapSection;
    this._infoElement = this._mapSection.querySelector(".map-scroll-info");
    this._infoElementVisible = false;
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
    const timeOutCallback = () => {
      if(this._infoElementVisible) {
        this._infoElement.style.opacity = 0;
        this._infoElementVisible = false;
      }
    }

    window.clearTimeout(this._scrollingEndCallback);

    if(this._mapSection.matches(":hover") && !this._isScrollButtonPressed) {
      this._infoElementVisible = true;
      this._infoElement.style.opacity = 1;
      this._infoElement.style.transitionDuration = "0.5s";
      this._scrollingEndCallback = setTimeout(timeOutCallback, 66);
    }
  }

  /**
   * Событие окончания анимации показа шторки
   * @param {Event} e Событие окончания анимации
   */
  _transitionEnd(e) {
    if (this._infoElement.style.transitionDuration == "0.5s") {
      this._infoElement.style.transitionDuration = "0.8s";
    }
  }


  /**
  * При таче на карту / элементы управления включаем драг карты
  * @param {Event} e Событие на начало тача
  */
  _onTouchStartMap(e) {
    if (e.touches.length > 1) {
      this._map._isTouched = false;
      return;
    }
    this._map._isTouched = true;
  }

  /**
   * Если тач карты был с движением, пример скролл страницы, то ставим флаг и 
   * показываем шторку
   * @param {Event} e Событие движения при таче
   */
  _onTouchMoveMap(e) {
    if (e.touches.length > 1 || e.changedTouches.length > 1) {
      return;
    }
    if(this._map._isTouched && !this._infoElementVisible) {
      this._infoElementVisible = true;
      this._infoElement.style.opacity = 1;
      this._infoElement.style.transitionDuration = "0.5s";
    }
  }

  /**
   * Если тач карты был с движением, то отменяем флаг
   * @param {Event} e Событие движения при таче
   */
  _onTouchEndMap(e) {
    if (this._infoElementVisible && this._infoElement.style.opacity == 1) {
      this._infoElement.style.opacity = 0;
      this._infoElementVisible = false;
    }
    this._map._isTouched = false;
    
  }


  registerHandlers() {
    // Проверка на зажатую кнопку Ctrl/Cmd
    window.addEventListener("keydown", e => this._scrollButtonDown(e));
    window.addEventListener("keyup", e => this._scrollButtonUp(e));
    if (!this._isTouchDevice) {
      // Показ шторки на Desktop версии
      window.addEventListener("scroll", e => this._scrollWindow(e));

    } else {
      // Показ шторки на мобильной версии
      this._mapSection.children.map.addEventListener("touchstart", e => this._onTouchStartMap(e));
      this._mapSection.children.map.addEventListener("touchmove", e => this._onTouchMoveMap(e));
      window.addEventListener("touchend", e => this._onTouchEndMap(e));
    }
    // После скролла с наведением на карту возвращаем длину анимации
    this._infoElement.addEventListener("transitionend", e => this._transitionEnd(e));


  }
}
