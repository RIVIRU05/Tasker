function lonToTileX(lon: number, zoom: number) {
  return Math.floor(((lon + 180) / 360) * 2 ** zoom);
}

function latToTileY(lat: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom);
}

/** A single OpenStreetMap raster tile roughly centered on the given coordinates. */
export function staticMapTileUrl(lat: number, lng: number, zoom = 14) {
  const x = lonToTileX(lng, zoom);
  const y = latToTileY(lat, zoom);
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}
