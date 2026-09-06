type JsonRecord = Record<string, unknown>;
export type N8nItem = {
    json: JsonRecord;
    [key: string]: unknown;
};
export type FullResponse = {
    statusCode?: number;
    body?: unknown;
};
export declare function makeSafeError(statusCode: number, body: unknown): Error;
export declare function handleChecksResponse(data: N8nItem[], response: FullResponse): Promise<N8nItem[]>;
export {};
