import {useEffect, useMemo, useState} from "react";
import {
    Box,
    Chip,
    CircularProgress,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import MapGrid from "./MapGrid";
import {LatLng} from "leaflet";
import {MapPreview, MapPreviewProps} from "./MapPreview";
import {createSearchParams, useSearchParams} from "react-router-dom";
import PhotonResolver from "./PhotonResolver";
import NominatimResolver from "./NominatimResolver";
import {AddressResolver, AddressResult} from "./AddressResolver";
import {Config} from "../Config";


interface MapResultsProps {
    query: string;
    config: Config;
}

function Coordinate(props: { mapGrid: MapGrid, result: AddressResult, active: boolean, onClick(): void }) {
    if (props.result.lat === undefined || props.result.lon === undefined) {
        return <Typography>?</Typography>;
    }

    let latLon = new LatLng(props.result.lat, props.result.lon);
    try {
        const result = props.mapGrid.lookup(latLon);
        if (result === undefined) {
            return <Typography>-</Typography>
        }
        return <Chip label={result.coordinate}
                     color={props.active ? "secondary" : "primary"}
                     onClick={() => props.onClick()} />;
    } catch (e) {
        console.error("Failed to lookup tile", e);
        return <Typography>-</Typography>
    }
}

function MapResults({query, config}: MapResultsProps) {
    const [mapGrid, setMapGrid] = useState<MapGrid | null>(null);
    const [results, setResults] = useState<AddressResult[] | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const addressResolver: AddressResolver = useMemo(() => searchParams.get('r') === 'n'
        ? new NominatimResolver()
        : new PhotonResolver(), [searchParams]);

    useEffect(() => {
        fetch(config.map.path).then(res => res.json()).then(json => setMapGrid(new MapGrid(json)));
    }, [config]);

    useEffect(() => {
        setResults(null);
        if (mapGrid !== null && query.length >= 3) {
            addressResolver.lookup(query, mapGrid.llBounds).then(results => setResults(results));
        }
    }, [query, mapGrid, addressResolver]);

    if (query.length < 3) {
        return <Box m={20} textAlign={"center"}>
            <Typography>Kein Suchbegriff eingegeben oder der Suchbegriff ist zu kurz.</Typography>
        </Box>;
    }

    if (results === null || mapGrid === null) {
        return <Box m={20} textAlign={"center"}><CircularProgress/></Box>;
    }

    const selected = searchParams.get('n') as number | null;
    const selectedResult = selected !== null && selected < results.length ? results[selected] : undefined;
    const latLon = selectedResult !== undefined && selectedResult.lat !== undefined && selectedResult.lon !== undefined
        ? new LatLng(selectedResult.lat, selectedResult.lon) : undefined;
    const tile = latLon !== undefined ? mapGrid.lookup(latLon) : undefined;
    const preview: MapPreviewProps|undefined = latLon !== undefined && tile !== undefined ? { latLon, tile } : undefined;

    return <Grid container direction="column" justifyContent="flex-start" alignItems="stretch">
        <Grid item>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Straße</TableCell>
                            <TableCell>Koordinate</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.map((result, i) => <TableRow key={i}>
                            <TableCell>{result.title}</TableCell>
                            <TableCell>
                                <Coordinate mapGrid={mapGrid} result={result}
                                            active={searchParams.get("n") === `${i}`} onClick={() => {
                                                const nsp = createSearchParams(searchParams);
                                                nsp.set("n", `${i}`);
                                                setSearchParams(nsp);
                                            }}/>
                            </TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
        <Grid item m={1}>
            <Grid container direction={"row"} alignItems={"center"} justifyContent={"end"}>
                <Box m={1}><InputLabel id="resolver-select">Datenquelle:</InputLabel></Box>
                <Select value={searchParams.get('r') || 'p'} defaultValue={'p'}
                        labelId="resolver-select"
                        onChange={ev => {
                            const nsp = new URLSearchParams(searchParams);
                            if (ev.target.value !== null && ev.target.value !== 'p') {
                                nsp.set('r', ev.target.value);
                            } else {
                                nsp.delete('r');
                            }
                            setSearchParams(nsp);
                        }}
                >
                    <MenuItem value="p">Photon API</MenuItem>
                    <MenuItem value="n">Nominatim API</MenuItem>
                </Select>
            </Grid>
        </Grid>
        {preview && <Grid><MapPreview {...preview}/></Grid>}
    </Grid>
}

export default MapResults;