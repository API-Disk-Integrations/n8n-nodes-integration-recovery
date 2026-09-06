const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const redact = (value) => (typeof value === "string" ? value : "Integration Recovery request failed")
    .replace(/Bearer\s+[^\s,;]+/gi, "Bearer [REDACTED]")
    .replace(/(x-api-key\s*[:=]\s*)[^\s,;]+/gi, "$1[REDACTED]")
    .slice(0, 500);
const bodyAsJson = (body) => {
    if (typeof body !== "string")
        return body;
    try {
        return JSON.parse(body);
    }
    catch {
        return undefined;
    }
};
export function makeSafeError(statusCode, body) {
    const parsed = bodyAsJson(body);
    const envelope = isRecord(parsed) && isRecord(parsed.error) ? parsed.error : {};
    const code = typeof envelope.code === "string" && envelope.code ? envelope.code : "adapter_error";
    const requestId = typeof envelope.requestId === "string" && envelope.requestId ? envelope.requestId : undefined;
    const message = redact(envelope.message ?? `Integration Recovery returned HTTP ${statusCode}.`);
    const error = new Error(message);
    error.name = "IntegrationRecoveryApiError";
    error.code = code;
    error.httpCode = String(statusCode);
    error.requestId = requestId;
    error.description = requestId ? `${code}; requestId=${requestId}` : code;
    return error;
}
export async function handleChecksResponse(data, response) {
    const statusCode = Number.isInteger(response.statusCode) ? Number(response.statusCode) : 502;
    const parsed = bodyAsJson(response.body);
    if (statusCode < 200 || statusCode >= 300)
        throw makeSafeError(statusCode, parsed);
    if (!isRecord(parsed) || !Number.isInteger(parsed.count) || !Number.isInteger(parsed.breaking) || !Array.isArray(parsed.checks)) {
        throw makeSafeError(502, {
            error: {
                code: "invalid_response",
                message: "Integration Recovery returned an invalid response envelope.",
            },
        });
    }
    if (data.length === 0)
        return [{ json: parsed }];
    return data.map((item) => ({ ...item, json: parsed }));
}
