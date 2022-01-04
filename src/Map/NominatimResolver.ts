import {AddressResolver, AddressResult} from "./AddressResolver";
import {LatLngBounds} from "leaflet";

export default class NominatimResolver implements AddressResolver {
    async lookup(query: string, bounds: LatLngBounds): Promise<AddressResult[]> {
        const params = new URLSearchParams({
            street: query,
            format: 'jsonv2',
            country: 'Germany',
            limit: '200',
            countrycodes: 'de',
            dedupe: '0',
            bounded: '1',
            viewbox: `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`,
        });

        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
        const json = await res.json() as [{display_name: string, lat?: number, lon?: number}];

        let displayNames = new Set();
        return json.filter(r => {
            if (displayNames.has(r.display_name)) {
                return false;
            }
            displayNames.add(r.display_name);
            return true;
        }).map(r => {
            return {
                title: r.display_name,
                lat: r.lat,
                lon: r.lon,
            } as AddressResult;
        });
    }
}