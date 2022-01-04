import {Config} from "../Config";
import {parse} from "csv-parse/browser/esm";
import Fuse from "fuse.js";

export default class CatalogIndex {
    private fuse: Fuse<any>;
    public readonly columns: string[];

    constructor(fuse: Fuse<any>, config: Config) {
        this.fuse = fuse;
        this.columns = config.catalog.columns;
    }

    public lookup(query: string): string[][] {
        return this.fuse.search(query, {
            limit: 100
        }).map(result =>
            this.columns.map(column => result.item[column] as string));
    }

    public static async load(config: Config): Promise<CatalogIndex> {
        const res = await fetch(config.catalog.path);
        if (res.body === null || !res.ok) {
            throw new Error(`Failed to download catalog from ${config.catalog.path}`);
        }
        const text = await res.text();
        const fuse = new Fuse<any>([], {
            keys: config.catalog.indexed.map((col, i) => {
                return {
                    name: col,
                    weight: config.catalog.indexed.length - i
                };
            })
        });
        await new Promise<void>(resolve =>
            parse(text, { delimiter: ';', columns: true })
                .on("data", row => fuse.add(row))
                .on("end", () => resolve())
        );
        return new CatalogIndex(fuse, config);
    }

}