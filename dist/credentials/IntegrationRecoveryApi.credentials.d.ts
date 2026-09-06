export declare class IntegrationRecoveryApi {
    name: string;
    displayName: string;
    documentationUrl: string;
    properties: {
        displayName: string;
        name: string;
        type: string;
        typeOptions: {
            password: boolean;
        };
        default: string;
        required: boolean;
        description: string;
    }[];
    authenticate: {
        type: string;
        properties: {
            headers: {
                Authorization: string;
            };
        };
    };
    test: {
        request: {
            baseURL: string;
            url: string;
            method: string;
            headers: {
                Accept: string;
            };
        };
    };
}
