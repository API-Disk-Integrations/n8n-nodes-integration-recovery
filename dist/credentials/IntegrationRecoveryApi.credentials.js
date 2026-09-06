export class IntegrationRecoveryApi {
    name = "integrationRecoveryApi";
    displayName = "Integration Recovery API";
    documentationUrl = "https://integrationrecovery-api.com/docs";
    properties = [
        {
            displayName: "API Key",
            name: "apiKey",
            type: "string",
            typeOptions: { password: true },
            default: "",
            required: true,
            description: "A dedicated Integration Recovery API key. n8n stores this value encrypted.",
        },
    ];
    authenticate = {
        type: "generic",
        properties: {
            headers: {
                Authorization: "=Bearer {{$credentials.apiKey}}",
            },
        },
    };
    test = {
        request: {
            baseURL: "https://integrationrecovery-api.com",
            url: "/v1/usage",
            method: "GET",
            headers: { Accept: "application/json" },
        },
    };
}
