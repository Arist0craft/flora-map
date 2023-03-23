/**
 * Создание коллекции геобъектов, которые будут отображены на Яндекс.Картах
 * @param {Point[]} geoPoints - Массив точек
 * @returns {ymaps.GeoObjectCollection} Геоколлекция из точек со складами
 */
 export default function getMapMarkers(geoPoints) {
  const BallonLayout = ymaps.templateLayoutFactory.createClass(
    `
    <div class="map-baloon" data-type="{{ properties.type }}">
    <div class="map-baloon-header">Склад</div>
    <div class="map-baloon-body">
      <div class="map-baloon-body-h1">{{ properties.name }}</div>
      <div></div>
      <div class="map-baloon-body-address">{{ properties.address }}</div>
      <div class="map-baloon-body-link">
        <svg viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.19299 6.43604C0.993289 6.43604 0.822391 6.35907 0.680299 6.20513C0.537964 6.05094 0.466797 5.86567 0.466797 5.64932V0.929047C0.466797 0.712701 0.537964 0.527561 0.680299 0.373627C0.822391 0.219432 0.993289 0.142334 1.19299 0.142334H7.00256C7.20227 0.142334 7.37329 0.219432 7.51562 0.373627C7.65771 0.527561 7.72876 0.712701 7.72876 0.929047V5.64932C7.72876 5.86567 7.65771 6.05094 7.51562 6.20513C7.37329 6.35907 7.20227 6.43604 7.00256 6.43604H1.19299ZM4.65844 3.30293C4.31982 3.5322 3.87573 3.5322 3.53712 3.30293L1.19299 1.71576V5.64932H7.00256V1.71576L4.65844 3.30293ZM3.53712 2.51622C3.87574 2.74549 4.31982 2.74549 4.65844 2.51622L7.00256 0.929047H1.19299L3.53712 2.51622ZM1.19299 1.71576V0.929047V5.64932V1.71576Z" fill="#F84777"/>
        </svg>
        <a href="mailto:{{ properties.email }}">{{ properties.email }}</a>
      </div>
      <div class="map-baloon-body-link">
        <svg viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.01723 5.27953L5.99042 5.17296C5.86968 5.16006 5.7473 5.17222 5.63247 5.2085C5.51765 5.24478 5.41336 5.30425 5.32744 5.38243L4.58361 6.05864C3.436 5.52805 2.50322 4.68006 1.91956 3.63678L2.66743 2.9569C2.84126 2.79887 2.92616 2.57837 2.89786 2.35419L2.78063 1.42807C2.75771 1.2488 2.66307 1.08344 2.51472 0.96349C2.36638 0.84354 2.17469 0.777374 1.97616 0.777588H1.27679C0.819985 0.777588 0.439984 1.12304 0.468282 1.53832C0.682538 4.67682 3.44361 7.18321 6.89191 7.37799C7.34872 7.40371 7.72872 7.05826 7.72872 6.64298V6.00719C7.73276 5.63601 7.42553 5.32363 7.01723 5.27953Z" fill="#F84777"/>
        </svg>
        <a href="tel:{{ properties.phone }}">{{ properties.phone }}</a>
      </div>
      <div class="map-baloon-body-days">{{ properties.workingDays }}</div>
      <div class="map-baloon-body-time">{{ properties.workingHours }}</div>
    </div>
    </div>
    `
  );

  const markersCollections = {
    "warehouse": new ymaps.GeoObjectCollection(),
    "city": new ymaps.GeoObjectCollection(),
    "soon": new ymaps.GeoObjectCollection(),
  };

  for (const p of geoPoints) {
    markersCollections[p.type].add(
      new ymaps.Placemark(
        p.coords,
        {
          type: p.type,
          name: p.name,
          address: p.address,
          email: p.email,
          phone: p.phone,
          workingDays: p.workingDays,
          workingHours: p.workingHours,
        },
        {
          balloonLayout: BallonLayout,
          balloonOffset: [-5, -5],
          balloonPanelMaxMapArea: 0,
          hideIconOnBalloonOpen: false,
          iconLayout: "default#image",
          iconImageHref: `image/map_marker_${p.type}.svg`,
        }
      )
    );
  }

  return markersCollections;
}