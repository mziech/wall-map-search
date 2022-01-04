import {LatLngBounds} from "leaflet";

export interface AddressResult {
    lat?: number;
    lon?: number;
    title: string;
}

export interface AddressResolver {
    lookup(query: string, bounds: LatLngBounds): Promise<AddressResult[]>;
}
