"use client";

import { useEffect, useState } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Crosshair, Layers, Minus, Plus } from "lucide-react";
import { getAccess, getRoads, settlements } from "@/lib/scenario";

interface Props {
  selected: string;
  step: number;
  onSelect: (id: string) => void;
  showRoute: boolean;
}

function MapControls({ selected }: { selected: string }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return (
    <div className="map-controls">
      <button aria-label="Zoom in" onClick={() => map.zoomIn()}>
        <Plus size={17} />
      </button>
      <button aria-label="Zoom out" onClick={() => map.zoomOut()}>
        <Minus size={17} />
      </button>
      <button
        aria-label="Center selected settlement"
        onClick={() =>
          map.flyTo(settlements.find((s) => s.id === selected)!.position, 12, {
            duration: 0.7,
          })
        }
      >
        <Crosshair size={17} />
      </button>
    </div>
  );
}

export default function OperationsMap({
  selected,
  step,
  onSelect,
  showRoute,
}: Props) {
  const [hazards, setHazards] = useState(true);
  const [tilesFailed, setTilesFailed] = useState(false);
  const roads = getRoads(step);
  const access = getAccess(selected, step);
  const colors = {
    "Confirmed closed": "#f27477",
    "Suspected blocked": "#eebc69",
    Unknown: "#8d9fa9",
    "Reported open": "#68ceba",
  };
  return (
    <div className="map-wrap">
      <MapContainer
        center={[11.535, 76.137]}
        zoom={11}
        minZoom={9}
        maxZoom={16}
        zoomControl={false}
        scrollWheelZoom
        className="operations-map"
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          eventHandlers={{ tileerror: () => setTilesFailed(true) }}
        />
        {hazards &&
          settlements
            .filter((s) => s.concern === "High concern")
            .map((s) => (
              <Circle
                key={`hazard-${s.id}`}
                center={s.position}
                radius={2200}
                pathOptions={{
                  color: "#e9a569",
                  fillColor: "#e39a58",
                  fillOpacity: 0.09,
                  weight: 1,
                  dashArray: "4 6",
                }}
              >
                <Tooltip>
                  Illustrative concern area · simulated, not a GSI layer
                </Tooltip>
              </Circle>
            ))}
        {roads.map((road) => (
          <Polyline
            key={road.id}
            positions={road.points}
            pathOptions={{
              color: colors[road.state],
              weight: 3,
              opacity: 0.8,
              dashArray:
                road.state === "Unknown" || road.state === "Suspected blocked"
                  ? "7 7"
                  : undefined,
            }}
          >
            <Tooltip sticky>
              {road.id} · {road.state}
              <br />
              Schematic corridor, not surveyed road geometry
            </Tooltip>
          </Polyline>
        ))}
        {showRoute && access.route && (
          <Polyline
            positions={roads.find((r) => r.id === access.route)!.points}
            pathOptions={{
              color: "#73ccef",
              weight: 5,
              opacity: 0.8,
              dashArray: "9 8",
            }}
          >
            <Tooltip>
              Candidate {access.route} · schematic / unverified access
            </Tooltip>
          </Polyline>
        )}
        {settlements.map((s) => (
          <Marker
            key={s.id}
            title={`Select ${s.name}`}
            alt={s.name}
            position={s.position}
            icon={L.divIcon({
              className: "settlement-marker",
              html: `<span class="map-dot ${s.concern === "High concern" ? "danger" : s.concern === "Watch" ? "warning" : "normal"} ${selected === s.id ? "selected" : ""}"></span>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
            eventHandlers={{ click: () => onSelect(s.id) }}
          >
            <Tooltip
              permanent
              direction={s.id === "chooralmala" ? "left" : "right"}
              offset={[10, 0]}
              className={`settlement-label ${selected === s.id ? "selected-label" : ""}`}
            >
              {s.name}
              {s.id === "mundakkai" && step >= 3 ? " · isolated" : ""}
            </Tooltip>
          </Marker>
        ))}
        <MapControls selected={selected} />
      </MapContainer>
      <div className="map-location">
        <span className="live-dot" /> WAYANAD DISTRICT{" "}
        <span className="muted">/ KERALA</span>
      </div>
      <button
        className={`layer-toggle ${hazards ? "active" : ""}`}
        onClick={() => setHazards(!hazards)}
        aria-pressed={hazards}
      >
        <Layers size={14} /> Concern areas
      </button>
      <div className="map-north">
        <span>↑</span>N
      </div>
      <div className="map-legend">
        <span>
          <i className="dot danger" />
          High concern
        </span>
        <span>
          <i className="dot warning" />
          Watch
        </span>
        <span>
          <i className="legend-line" />
          Candidate route
        </span>
      </div>
      <div className="map-disclaimer">
        {tilesFailed
          ? "Base map unavailable · scenario markers remain interactive"
          : "Illustrative scenario overlays & schematic corridors · not for navigation"}
      </div>
    </div>
  );
}
