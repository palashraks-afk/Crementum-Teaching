"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import { useEffect, useMemo } from "react";
import type { DbBranch } from "@/server/db";
import "leaflet/dist/leaflet.css";
import styles from "./BranchMap.module.css";

/** Continental US, which is where most branches are. */
const USA: [number, number] = [39.5, -98.35];
const USA_ZOOM = 4;
const WORLD: [number, number] = [25, 0];
const WORLD_ZOOM = 2;

/**
 * A CSS-drawn pin. Using divIcon rather than Leaflet's default PNG avoids the
 * well-known broken-marker-image problem under bundlers entirely.
 */
function pin(hq: boolean) {
  return divIcon({
    className: "",
    html: `<span class="${styles.pin}" data-hq="${hq}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

/** Imperative view control — react-leaflet has no declarative "fly to" prop. */
function ViewControl({ view }: { view: "usa" | "world" }) {
  const map = useMap();
  useEffect(() => {
    const [center, zoom] = view === "usa" ? [USA, USA_ZOOM] : [WORLD, WORLD_ZOOM];
    map.flyTo(center as [number, number], zoom as number, { duration: 0.8 });
  }, [view, map]);
  return null;
}

export default function LeafletMap({
  branches,
  view,
}: {
  branches: DbBranch[];
  view: "usa" | "world";
}) {
  const icons = useMemo(() => ({ hq: pin(true), normal: pin(false) }), []);

  return (
    <MapContainer
      center={USA}
      zoom={USA_ZOOM}
      minZoom={2}
      scrollWheelZoom={false}
      worldCopyJump
      className={styles.map}
    >
      {/* Carto's light basemap keeps the map quiet so the orange pins read first. */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <ViewControl view={view} />
      {branches.map((branch) => (
        <Marker
          key={branch.id}
          position={[branch.lat, branch.lng]}
          icon={branch.hq ? icons.hq : icons.normal}
        >
          <Popup>
            <strong className={styles.popupCity}>{branch.city}</strong>
            <span className={styles.popupRegion}>
              {branch.region}
              {branch.country ? `, ${branch.country}` : ""}
            </span>
            {branch.hq ? <span className={styles.popupHq}>Headquarters</span> : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
