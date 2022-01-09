export interface Config {
    catalog: {
        path: string;
        indexed: string[];
        columns: string[];
    },
    map: {
        path: string;
    }
}

function makeAbsolute(path: string): string {
    if (path.indexOf("/") === 0 || path.indexOf("http://") === 0 || path.indexOf("https://") === 0) {
        return path;
    }

    return `${process.env.PUBLIC_URL}/${path}`;
}

export async function loadConfig(path: string): Promise<Config> {
    const res = await fetch(path);
    const json = await res.json();
    const config = json as Config;
    config.catalog.path = makeAbsolute(config.catalog.path);
    config.map.path = makeAbsolute(config.map.path);
    return config;
}
