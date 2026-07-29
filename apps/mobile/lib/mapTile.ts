function lonToTileX(lon: number, zoom: number) {
  return Math.floor(((lon + 180) / 360) * 2 ** zoom);
}

function latToTileY(lat: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom);
}

/** Uses CARTO tiles, not tile.openstreetmap.org: OSM rejects requests from <Image> for lacking a custom User-Agent. */
export function staticMapTileUrl(lat: number, lng: number, zoom = 14) {
  const x = lonToTileX(lng, zoom);
  const y = latToTileY(lat, zoom);
  return `https://a.basemaps.cartocdn.com/light_all/${zoom}/${x}/${y}.png`;
}
