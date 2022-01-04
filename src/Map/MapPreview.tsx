import {MapConsumer, MapContainer, Marker, Rectangle, TileLayer} from "react-leaflet";
import {LatLng} from "leaflet";
import {TileResult} from "./MapGrid";
import L from 'leaflet';

import "leaflet/dist/leaflet.css";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for: https://github.com/PaulLeCam/react-leaflet/issues/453
const MarkerIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize:    [25, 41],
    iconAnchor:  [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize:  [41, 41]
});

export interface MapPreviewProps {
    latLon: LatLng,
    tile: TileResult,
}

export function MapPreview(props: MapPreviewProps) {
    return <MapContainer center={props.tile.tileBounds.getCenter()}
                         zoom={15}
                         scrollWheelZoom={false}
                         style={{height: '500px'}}>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapConsumer>{map => {
            map.setView(props.tile.tileBounds.getCenter(), 15);
            return null;
        }}</MapConsumer>
        <Rectangle bounds={props.tile.tileBounds} fill={false}/>
        <Marker position={props.latLon} icon={MarkerIcon}/>
    </MapContainer>;
}