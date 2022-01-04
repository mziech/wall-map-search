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

export async function loadConfig(path: string): Promise<Config> {
    const res = await fetch(path);
    const json = await res.json();
    return json as Config;
}
