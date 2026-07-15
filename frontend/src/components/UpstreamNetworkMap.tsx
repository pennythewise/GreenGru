// Zoomable 2D map of the Baowu/Baosteel downstream processing & distribution
// network — client-only (wrap in <ClientOnly> at the usage site, same pattern
// as FactoryScene). MapLibre GL over Carto's free "Positron" light-gray
// basemap (no API key; attribution rendered by the map itself). One colored
// marker per facility by cluster group; click a marker for the facility card,
// and "Monitor" flies the map into the site then opens the shared 3D factory
// floor (FactoryScene, reused from the SME dashboard) as an overlay.
// Basemap tiles load from Carto's CDN — demo-acceptable, but note it is an
// external (non-domestic) tile service if data-sovereignty review ever
// extends to map tiles.
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import { ArrowLeft } from "lucide-react";

import { facilities, facilityGroups, facilityStatuses, type Facility } from "@/lib/upstream-map-data";

// Same simulated factory floor the SME dashboard uses — loaded on demand so
// three.js only ships when someone actually clicks Monitor.
const FactoryScene = lazy(() =>
  import("@/components/FactoryScene").then((m) => ({ default: m.FactoryScene })),
);

const OVERVIEW = { center: [110.5, 32.5] as [number, number], zoom: 3.4 };

const STYLE_URL = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// Raster fallback if the vector style.json fetch fails (observed transiently;
// also more likely on China-side networks where the demo will be shown).
const RASTER_FALLBACK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [{ id: "carto", type: "raster", source: "carto" }],
};

function popupHtml(f: (typeof facilities)[number]): string {
  const g = facilityGroups[f.group];
  const st = facilityStatuses[f.status];
  return `
    <div style="font-family: var(--font-sans); min-width: 220px; max-width: 260px;">
      <div style="display:flex; align-items:center; gap:6px; font-family: var(--font-mono); font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:${st.color};">
        <span style="width:6px; height:6px; border-radius:9999px; background:${st.color};"></span>
        ${st.label} · ${st.zh}
      </div>
      <div style="margin-top:6px; font-size:12.5px; font-weight:600; line-height:1.3; color:#1c2a30;">${f.nameEn}</div>
      <div style="font-family: var(--font-mono); font-size:11px; color:#5b6b71;">${f.nameZh}</div>
      <p style="margin-top:6px; font-size:10.5px; line-height:1.45; color:#5b6b71;">${f.focus}</p>
      <div style="margin-top:6px; padding-top:6px; border-top:1px solid rgba(28,42,48,0.12); font-family: var(--font-mono); font-size:9.5px; color:#5b6b71;">
        ${g.label} · ${g.zh}<br/>${f.location}<br/>${f.lat.toFixed(4)}° N · ${f.lon.toFixed(4)}° E
      </div>
      <button data-monitor-id="${f.id}" style="margin-top:8px; width:100%; padding:6px 0; border:none; border-radius:6px; background:var(--primary); color:var(--primary-foreground); font-family: var(--font-sans); font-size:11.5px; font-weight:500; cursor:pointer;">
        Monitor · 监控
      </button>
    </div>`;
}

// Facility points as a GeoJSON source rendered by WebGL circle layers — unlike
// DOM markers, these are drawn in the same pass as the basemap and cannot
// drift off their coordinates during zoom/pan. Also the layer type that
// supports native clustering if the facility list grows.
const FACILITIES_GEOJSON = {
  type: "FeatureCollection",
  features: facilities.map((f) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [f.lon, f.lat] },
    properties: { id: f.id, color: facilityStatuses[f.status].color },
  })),
} as FeatureCollection;

const POINT_LAYERS = ["facility-halo", "facility-dot"];

function addFacilityLayers(map: maplibregl.Map) {
  if (map.getSource("facilities")) return;
  map.addSource("facilities", { type: "geojson", data: FACILITIES_GEOJSON });
  map.addLayer({
    id: "facility-halo",
    type: "circle",
    source: "facilities",
    paint: { "circle-radius": 11, "circle-color": ["get", "color"], "circle-opacity": 0.22 },
  });
  map.addLayer({
    id: "facility-dot",
    type: "circle",
    source: "facilities",
    paint: {
      "circle-radius": 5.5,
      "circle-color": ["get", "color"],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 2,
    },
  });
}

function SceneFallback() {
  return (
    <div className="h-full flex items-center justify-center bg-[#0d1319]">
      <span className="text-[11px] font-mono text-white/50 animate-pulse">
        Loading factory floor · 工厂实时加载中…
      </span>
    </div>
  );
}

export function UpstreamNetworkMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [monitored, setMonitored] = useState<Facility | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Kill any zombie canvas left by a previous mount (HMR / double-mount) —
    // two stacked map instances render one instance's basemap under another's
    // points, which reads as "markers off their coordinates".
    containerRef.current.innerHTML = "";
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: OVERVIEW.center,
      zoom: OVERVIEW.zoom,
      minZoom: 2,
      maxZoom: 13,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.scrollZoom.enable();

    let fellBack = false;
    map.on("error", (e) => {
      const msg = String(e.error?.message ?? "");
      if (!fellBack && msg.includes("style.json")) {
        fellBack = true;
        map.setStyle(RASTER_FALLBACK_STYLE);
      }
    });

    // "style.load" fires on initial load and again if we swap to the raster
    // fallback (setStyle wipes custom sources/layers), so layers survive both.
    map.on("style.load", () => addFacilityLayers(map));

    let openPopup: maplibregl.Popup | null = null;
    map.on("click", (e) => {
      if (POINT_LAYERS.every((l) => !map.getLayer(l))) return;
      const feats = map.queryRenderedFeatures(e.point, { layers: POINT_LAYERS });
      const f = facilities.find((x) => x.id === feats[0]?.properties?.id);
      if (!f) return;
      openPopup?.remove();
      openPopup = new maplibregl.Popup({ offset: 14, maxWidth: "280px" })
        .setLngLat([f.lon, f.lat])
        .setHTML(popupHtml(f))
        .addTo(map);
    });
    map.on("mousemove", (e) => {
      if (POINT_LAYERS.every((l) => !map.getLayer(l))) return;
      const hit = map.queryRenderedFeatures(e.point, { layers: POINT_LAYERS }).length > 0;
      map.getCanvas().style.cursor = hit ? "pointer" : "";
    });

    // Popup content is raw HTML, so the Monitor buttons are caught by
    // delegation on the map container rather than per-button React handlers.
    const container = containerRef.current;
    const onMonitorClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest("[data-monitor-id]");
      if (!btn) return;
      const f = facilities.find((x) => x.id === btn.getAttribute("data-monitor-id"));
      if (!f) return;
      openPopup?.remove();
      openPopup = null;
      map.flyTo({ center: [f.lon, f.lat], zoom: 10.5, speed: 1.6, curve: 1.4 });
      map.once("moveend", () => setMonitored(f));
    };
    container.addEventListener("click", onMonitorClick);

    return () => {
      container.removeEventListener("click", onMonitorClick);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const closeMonitor = () => {
    setMonitored(null);
    mapRef.current?.flyTo({ ...OVERVIEW, speed: 1.6, curve: 1.4 });
  };

  return (
    <div className="relative h-[420px] rounded-lg overflow-hidden border border-border">
      <div ref={containerRef} className="h-full" />
      {monitored && (
        <div className="absolute inset-0 z-10 flex flex-col bg-surface">
          <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border bg-surface shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: facilityStatuses[monitored.status].color }}
              />
              <span className="text-[12px] font-medium truncate">{monitored.nameEn}</span>
              <span className="hidden md:inline text-[10.5px] font-mono text-muted-foreground truncate">
                {monitored.nameZh} · simulated live floor · 工厂实时
              </span>
            </div>
            <button
              onClick={closeMonitor}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface-2 text-[11.5px] font-mono text-muted-foreground hover:text-foreground transition shrink-0"
            >
              <ArrowLeft className="h-3 w-3" /> Back to map
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <Suspense fallback={<SceneFallback />}>
              <FactoryScene fullscreen />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
