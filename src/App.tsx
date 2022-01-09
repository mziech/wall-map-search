import React, {useEffect, useState} from 'react';
import {
    alpha,
    AppBar,
    Box,
    Button,
    CircularProgress,
    Container, IconButton,
    InputBase,
    styled,
    Toolbar,
    Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CatalogResults from "./Catalog/CatalogResults";
import MapResults from "./Map/MapResults";
import {Link, Route, Routes, useMatch, useNavigate, useSearchParams} from 'react-router-dom';
import {Config, loadConfig} from "./Config";

const Search = styled('div')(({theme}) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        width: 'auto',
    },
}));

const StyledInputBase = styled(InputBase)(({theme}) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '50ch',
        },
    },
}));

function App() {
    const [config, setConfig] = useState<Config|undefined>();
    const [searchParams, setSearchParams] = useSearchParams({ q: "" });
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const navigate = useNavigate();
    const isMapActive = useMatch("/map");
    const isCatalogActive = useMatch("/catalog");

    useEffect(() => {
        loadConfig(`${process.env.PUBLIC_URL}/data/config.json`).then(config => setConfig(config));
    }, []);

    if (config === undefined) {
        return <CircularProgress/>;
    }

    return (
        <Container>
            <Box sx={{flexGrow: 1}}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            Wandplan Suche
                        </Typography>
                        <Box mr={2}>
                            <Button variant={isCatalogActive ? "outlined" : undefined} color="inherit"
                                    onClick={() => navigate(`/catalog?${searchParams}`)}>
                                Katalog
                            </Button>
                            <Button variant={isMapActive ? "outlined" : undefined} color="inherit"
                                    onClick={() => navigate(`/map?${searchParams}`)}>
                                Karte
                            </Button>
                        </Box>
                        {(isMapActive || isCatalogActive) && <form onSubmit={event => {
                            const nsp = new URLSearchParams(searchParams);
                            nsp.set("q", query);
                            nsp.delete("n");
                            setSearchParams(nsp);
                            event.preventDefault();
                        }} >
                            <Search>
                                <StyledInputBase type="text" placeholder="Straßenname" value={query}
                                                 onChange={event => setQuery(event.target.value)}/>
                                <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
                                    <SearchIcon />
                                </IconButton>
                                <IconButton type="button" sx={{ p: '10px' }} aria-label="reset" onClick={() => setQuery("")}>
                                    <DeleteIcon />
                                </IconButton>
                            </Search>
                        </form>}
                    </Toolbar>
                </AppBar>
            </Box>

            <Routes>
                <Route path={"/catalog"} element={<CatalogResults config={config} query={searchParams.get("q") || ""} />}/>
                <Route path={"/map"} element={<MapResults config={config} query={searchParams.get("q") || ""}/>}/>
                <Route path={"*"} element={<Box m={20} textAlign="center">
                    <Typography>
                        Im <Link to="/catalog">Katalog</Link> oder auf der <Link to="/map">Karte</Link> suchen?
                    </Typography>
                </Box>}/>
            </Routes>
        </Container>
    );
}

export default App;
