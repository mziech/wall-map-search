enum CoordinateEdge {
    nw = "nw",
    ne = "ne",
    sw = "sw",
    se = "se",
}

interface MapConfiguration {
    parts:
        {
            start: string,
            end: string,
            refpoints: {
                lat: number,
                lon: number,
                coordinate: string,
                edge: CoordinateEdge|string,
            }[]
        }[]
}
