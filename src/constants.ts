export const FORT_MCCLELLAN_CENTER = [33.7258, -85.7864] as [number, number];
export const PELHAM_RANGE_CENTER = [33.7380, -85.8150] as [number, number];

export const MAP_PROVIDERS = {
  SATELLITE: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  LEGACY: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  USGS_ORTHO: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
  TOPO: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
};
