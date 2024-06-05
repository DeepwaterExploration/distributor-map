import React, { useRef, useState } from "react";
import { TileLayer, MapContainer, useMap, Marker, Popup } from "react-leaflet";
import { styles } from "./style";
import { Box } from "@mui/material";
import L, { LatLngExpression } from "leaflet";
import distributors from "../../assets/distributors.json";
import "leaflet/dist/leaflet.css";
import "./no-leaflet.css"; //hide leaflet logo

const ComponentResize = () => {
  const map = useMap();

  setTimeout(() => {
    map.invalidateSize(); //bugfix to make sure that all map tiles load onstart
  }, 0);

  return null;
};

function getCoordinates(): LatLngExpression {
  const coordinates = distributors.map((x) => x.coordinates);
  if (coordinates.length === 0) {
    return [0, 0] as LatLngExpression; // Handle case with no coordinates
  }

  let sumX = 0;
  let sumY = 0;

  coordinates.forEach((coord) => {
    sumX += coord[0];
    sumY += coord[1];
  });

  const avgX = sumX / coordinates.length;
  const avgY = sumY / coordinates.length;

  console.log(avgX, avgY);
  return [avgX, avgY] as LatLngExpression;
}

const HomePage: React.FC = () => {
  const [mapCenter, _setMapCenter] = useState<LatLngExpression>(getCoordinates());
  const [zoom, _setZoom] = useState(2);
  const mapRef = useRef(null);

  const icon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.0.3/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }); // use custom icon, otherwise it doesn't show at build

  return (
    <Box sx={styles.pageContainer}>
      {/* @ts-ignore */}
      <MapContainer
        minZoom={2}
        maxBounds={[
          [-180, -90],
          [180, 90],
        ]}
        center={mapCenter}
        zoom={zoom}
        ref={mapRef}
        style={styles.mapContainer}
      >
        <ComponentResize />
        <TileLayer
          attribution="OpenStreetMap"
          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
        />
        {distributors.map((element) => {
          const coordinates = element.coordinates;
          let position = [0, 0] as LatLngExpression; // Default position in case extraction fails

          if (Array.isArray(coordinates) && coordinates.length >= 2) {
            // Extracting latitude and longitude from coordinates array
            const latitude = coordinates[0];
            const longitude = coordinates[1];
            position = [latitude, longitude];
          }

          return (
            <Marker key={element.name} position={position} icon={icon}>
              <Popup>
                <a href={element.website}>{element.name}</a>
                <br />
                {element.address}
                {element.email !== "" ? (
                  <>
                    <br />
                    <a href={"mailto:" + element.email}>{element.email}</a>
                  </>
                ) : (
                  ""
                )}
                {element.phone !== "" ? (
                  <>
                    <br />
                    <a href={"tel:" + element.phone}>{element.phone}</a>
                  </>
                ) : (
                  ""
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default HomePage;