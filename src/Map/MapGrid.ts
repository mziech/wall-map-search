import {Bounds, LatLng, LatLngBounds, LatLngLiteral, Point, Projection} from "leaflet";

interface ReferencePoint {
    tile: Point,
    geo: Point,
}

class PartitionBounds {
    public readonly tileBounds: Bounds;
    public readonly tileSize: Point;
    public readonly geoBounds: Bounds;

    constructor(tileBounds: Bounds, refpoints: ReferencePoint[]) {
        this.tileBounds = tileBounds;
        this.tileSize = new Point(
            (refpoints[1].geo.x - refpoints[0].geo.x) / (refpoints[1].tile.x - refpoints[0].tile.x),
            (refpoints[1].geo.y - refpoints[0].geo.y) / (refpoints[1].tile.y - refpoints[0].tile.y)
        );
        this.geoBounds = new Bounds(
            new Point(
                refpoints[0].geo.x - (refpoints[0].tile.x - tileBounds.getTopLeft().x) * this.tileSize.x,
                refpoints[0].geo.y - (refpoints[0].tile.y - tileBounds.getTopLeft().y) * this.tileSize.y
            ),
            new Point(
                refpoints[1].geo.x + (tileBounds.getBottomRight().x - refpoints[1].tile.x) * this.tileSize.x,
                refpoints[1].geo.y + (tileBounds.getBottomRight().y - refpoints[1].tile.y) * this.tileSize.y
            )
        );
    }

    public lookupTile(xy: Point): Point | undefined {
        if (!this.geoBounds.contains(xy)) {
            return undefined;
        }

        const relXy = xy.subtract(this.getReferenceCorner());
        return new Point(
            Math.floor(relXy.x / this.tileSize.x),
            Math.floor(relXy.y / this.tileSize.y)
        ).add(this.tileBounds.getTopLeft());
    }

    private getReferenceCorner(): Point {
        if (this.tileSize.y > 0) {
            if (this.tileSize.x > 0) {
                return this.geoBounds.getTopLeft();
            } else {
                return this.geoBounds.getTopRight();
            }
        } else {
            if (this.tileSize.x > 0) {
                return this.geoBounds.getBottomLeft();
            } else {
                return this.geoBounds.getBottomRight();
            }
        }
    }

    public getGeoBoundsOfTile(tile: Point): Bounds {
        const relTile = tile.subtract(this.tileBounds.getTopLeft());
        const origin = this.getReferenceCorner().add(new Point(
            relTile.x * this.tileSize.x, relTile.y * this.tileSize.y
        ));
        return new Bounds(origin, origin.add(this.tileSize));
    }
}

function alphaToNum(alpha: string): number {
    if (/^[A-Z]$/.test(alpha)) {
        return alpha.charCodeAt(0) - "A".charCodeAt(0);
    } else if (/^[a-z]$/.test(alpha)) {
        return alpha.charCodeAt(0) - "a".charCodeAt(0);
    } else if (/^Z[a-z]$/.test(alpha)) {
        return 26 + (alpha.charCodeAt(1) - "a".charCodeAt(0));
    } else if (/^Z[A-Z]$/.test(alpha)) {
        return 26 + (alpha.charCodeAt(1) - "A".charCodeAt(0));
    } else {
        throw new Error(`Unparseable coordinate: ${alpha}`);
    }
}

function numToAlpha(num: number): string {
    if (num >= 0 && num < 26) {
        return String.fromCharCode("A".charCodeAt(0) + num);
    } else if (num >= 26 && num < 52) {
        return String.fromCharCode("Z".charCodeAt(0), "a".charCodeAt(0) + (num - 26));
    } else {
        throw new Error(`Cannot convert coordinate to alpha: ${num}`);
    }
}

export interface TileResult {
    coordinate: string,
    tileBounds: LatLngBounds,
}

export default class MapGrid {
    private readonly projection: Projection;
    private readonly parts: PartitionBounds[];
    private readonly xyBounds: Bounds;
    public readonly llBounds: LatLngBounds;

    constructor(config: MapConfiguration) {
        this.projection = Projection.SphericalMercator;
        this.parts = config.parts.map(part => new PartitionBounds(
            new Bounds(MapGrid.fromCoordinate(part.start), MapGrid.fromCoordinate(part.end)),
            part.refpoints.map<ReferencePoint>(refpoint => {
                return {
                    tile: MapGrid.fromCoordinate(refpoint.coordinate).add(MapGrid.edgeIncrement(refpoint.edge)),
                    geo: this.projection.project(new LatLng(refpoint.lat, refpoint.lon))
                };
            })
        ));
        this.xyBounds = this.parts
            .map(p => p.geoBounds)
            .reduce((prev, curr) => prev.extend(curr.getTopLeft()).extend(curr.getBottomRight()));
        this.llBounds = new LatLngBounds(
            this.projection.unproject(this.xyBounds.getTopLeft()),
            this.projection.unproject(this.xyBounds.getBottomRight())
        );
    }

    public lookup(latlon: LatLng | LatLngLiteral): TileResult | undefined {
        const xy = this.projection.project(latlon);
        for (const part of this.parts) {
            const tile = part.lookupTile(xy);
            if (tile === undefined) {
                continue;
            }

            const geoBounds = part.getGeoBoundsOfTile(tile);

            return {
                coordinate: MapGrid.toCoordinate(tile),
                tileBounds: new LatLngBounds(
                    this.projection.unproject(geoBounds.getTopLeft()),
                    this.projection.unproject(geoBounds.getBottomRight())
                )
            };
        }
        return undefined;
    }

    private static edgeIncrement(edge: string): Point {
        switch (edge) {
            case "nw":
                return new Point(0, 0);
            case "ne":
                return new Point(1, 0);
            case "sw":
                return new Point(0, 1);
            case "se":
                return new Point(1, 1);
            default:
                throw new Error(`Unknown edge: ${edge}`);
        }
    }

    private static fromCoordinate(coordinate: string): Point {
        const re = /^([A-Za-z]+)(\d+)$/.exec(coordinate);
        if (re) {
            return new Point(parseInt(re[2]), alphaToNum(re[1]));
        } else {
            throw new Error(`Unparseable coordinate: ${coordinate}`);
        }
    }

    private static toCoordinate(point: Point): string {
        return numToAlpha(point.y) + point.x;
    }
};
