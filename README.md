![.github/workflows/package.yml](https://github.com/mziech/wall-map-search/actions/workflows/.github/workflows/package.yml/badge.svg)
![.github/workflows/docker.yml](https://github.com/mziech/wall-map-search/actions/workflows/.github/workflows/docker.yml/badge.svg)

# Wall Map Search

Lookup street locations on a wall map using the grid.

![Screenshot](screenshot.png)

## Running it

Easiest way to run this application is using Docker:
```
docker run -p 80:80 ghcr.io/mziech/wall-map-search
```

Since the application uses client-side routing, hosting it under a different path may be a bit tricky.
With the Docker image you can specify the `PUBLIC_URL` environment variable to adjust the base path.
The following command will make the application available under http://localhost/foo/:
```
docker run -p 80:80 -e PUBLIC_URL=/foo ghcr.io/mziech/wall-map-search
```

## Catalog based search

If you got the street name directory from the vendor,
you can convert it into CSV (`;`-separated) and place it in the `public/data` directory.

Adjust [config.json](public/data/config.json) accordingly.

## Map based search

If you don't have a directory, the directory is flawed or you want to search with more precision (e.g. house numbers),
you can make use of OpenStreetMap-based geocoding.
This will also render a preview of the address within the grid rectangle.

You need to create a JSON file for your individual wall map,
see [pharus-berlin-2020.json](public/data/pharus-berlin-2020.json) for example.

### Reference points

Exactly 2 `refpoints` are needed to calculate the map grid.
These reference points are geolocations which are exactly under a grid crossing,
e.g. churches, roundabouts, crossings.
You need to determine the exact latitude and longitude for these locations.
The bigger the distance between the reference points, the better.
