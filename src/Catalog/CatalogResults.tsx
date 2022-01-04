import {
    Box,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Config} from "../Config";
import CatalogIndex from "./CatalogIndex";

interface CatalogResultsProps {
    query: string;
    config: Config;
}

function CatalogResults({ config, query }: CatalogResultsProps) {
    const [catalog, setCatalog] = useState<CatalogIndex | null>(null);
    const [results, setResults] = useState<string[][] | null>(null);

    useEffect(() => {
        CatalogIndex.load(config).then(catalog => setCatalog(catalog));
    }, [config]);

    useEffect(() => {
        if (catalog !== null && query.length > 1) {
            setResults(catalog.lookup(query));
        } else {
            setResults(null);
        }
    }, [query, catalog])

    if (query.length < 1) {
        return <Box m={20} textAlign={"center"}>
            <Typography>Kein Suchbegriff eingegeben oder der Suchbegriff ist zu kurz.</Typography>
        </Box>;
    }

    if (catalog === null) {
        return <Box m={20} textAlign={"center"}><CircularProgress/></Box>;
    }

    return <>
        {results !== null && <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        {catalog.columns.map(column => <TableCell key={column}>{column}</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {results.map((row: string[], ri: number) => <TableRow key={ri}>
                        {row.map((column: string, ci: number) => <TableCell key={`${ri}x${ci}`}>{column}</TableCell>)}
                    </TableRow>)}
                </TableBody>
            </Table>
        </TableContainer>}
    </>
}

export default CatalogResults;
