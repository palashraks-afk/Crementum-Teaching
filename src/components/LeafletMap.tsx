"use client";

import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import { useEffect, useMemo } from "react";
import type { DbBranch } from "@/server/db";
import type { Focus } from "./BranchMap";
import "leaflet/dist/leaflet.css";
import styles from "./BranchMap.module.css";

const USA: [number, number] = [39.5, -98.35];
const USA_ZOOM = 4;
const WORLD: [number, number] = [25, 0];
const WORLD_ZOOM = 2;

/** CSS-drawn pin, avoids Leaflet's default PNG breaking under bundlers. */
function pin(kind: "hq" | "branch" | "active") {
  return divIcon({
    className: "",
    html: `<span class="${styles.pin}" data-kind="${kind}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

/** react-leaflet has no declarative pan/zoom prop, so drive it imperatively. */
function ViewControl({ view, focus }: { view: "usa" | "world"; focus: Focus | null }) {
  const map = useMap();

  useEffect(() => {
    if (focus) {
      map.flyTo([focus.lat, focus.lng], focus.zoom, { duration: 0.9 });
      return;
    }
    const [center, zoom] = view === "usa" ? [USA, USA_ZOOM] : [WORLD, WORLD_ZOOM];
    map.flyTo(center as [number, number], zoom as number, { duration: 0.8 });
  }, [view, focus, map]);

  return null;
}

export default function LeafletMap({
  branches,
  view,
  focus,
  selectedId,
  onSelect,
}: {
  branches: DbBranch[];
  view: "usa" | "world";
  focus: Focus | null;
  selectedId: string | null;
  onSelect: (branch: DbBranch) => void;
}) {
  const icons = useMemo(
    () => ({ hq: pin("hq"), branch: pin("branch"), active: pin("active") }),
    [],
  );

  return (
    <MapContainer
      center={USA}
      zoom={USA_ZOOM}
      minZoom={2}
      scrollWheelZoom={false}
      worldCopyJump
      className={styles.map}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <ViewControl view={view} focus={focus} />

      {/* Marks the searched or detected point so it reads as "you are here". */}
      {focus ? (
        <Circle
          center={[focus.lat, focus.lng]}
          radius={12000}
          pathOptions={{ color: "#1d4ed8", fillColor: "#1d4ed8", fillOpacity: 0.18, weight: 2 }}
        />
      ) : null}

      {branches.map((branch) => (
        <Marker
          key={branch.id}
          position={[branch.lat, branch.lng]}
          icon={
            branch.id === selectedId ? icons.active : branch.hq ? icons.hq : icons.branch
          }
          eventHandlers={{ click: () => onSelect(branch) }}
          title={`${branch.city}, ${branch.region}`}
        />
      ))}
    </MapContainer>
  );
}
