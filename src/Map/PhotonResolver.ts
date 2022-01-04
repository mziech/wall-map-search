import {FeatureCollection, Point} from "geojson";
import {AddressResolver, AddressResult} from "./AddressResolver";
import {LatLngBounds} from "leaflet";

interface PhotonRequest {
    q: string;
    bbox?: number[];
    lat?: number;
    lon?: number;
    zoom?: number;
    location_bias_scale?: number;
    limit?: number;
    lang?: string;
}

const PROPS = [
    "name",
    "street",
    "housenumber",
    "postcode",
    "district",
    "city",
];

export default class PhotonResolver implements AddressResolver {
    async search(req: PhotonRequest): Promise<FeatureCollection> {
        const params = new URLSearchParams();
        Object.entries(req).forEach(([k, v]) => {
            if (v === undefined) {
                return;
            }

            if (k === 'bbox') {
                params.set(k, v.join(','));
            } else {
                params.set(k, v.toString());
            }
        });
        const res = await fetch(`https://photon.komoot.io/api?${params}`);
        return await res.json();
    }

    async lookup(query: string, bounds: LatLngBounds): Promise<AddressResult[]> {
        const features = await this.search({
            q: query,
            bbox: [bounds.getWest(), bounds.getNorth(), bounds.getEast(), bounds.getSouth()],
            lat: bounds.getCenter().lat,
            lon: bounds.getCenter().lng,
        });

        return features.features.map(feature => {
            const title = feature.properties !== null ? PROPS
                .map(k => (feature.properties || {})[k])
                .filter(v => v !== undefined)
                .join(", ") : "";
            const [lon, lat] = (feature.geometry as Point).coordinates;
            return {
                title, lat, lon
            } as AddressResult;
        });
    }

}
