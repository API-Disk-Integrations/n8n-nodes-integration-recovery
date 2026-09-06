import { handleChecksResponse } from "../../shared/safe-response.js";
export class IntegrationRecovery {
    description = {
        displayName: "Integration Recovery",
        name: "integrationRecovery",
        icon: "file:integrationRecovery.svg",
        group: ["transform"],
        version: 1,
        subtitle: "={{$parameter[\"operation\"]}}",
        description: "Compare two integration snapshots and return a repair plan without applying it",
        defaults: { name: "Integration Recovery" },
        usableAsTool: true,
        inputs: ["main"],
        outputs: ["main"],
        credentials: [{ name: "integrationRecoveryApi", required: true }],
        requestDefaults: {
            baseURL: "https://integrationrecovery-api.com",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        },
        properties: [
            {
                displayName: "Operation",
                name: "operation",
                type: "options",
                noDataExpression: true,
                options: [
                    {
                        name: "Check Integration Drift",
                        value: "checkIntegrationDrift",
                        action: "Check integration drift",
                        description: "Return the exact drift report and ordered repair plan",
                        routing: {
                            request: {
                                method: "POST",
                                url: "/v1/checks",
                                timeout: 10000,
                                returnFullResponse: true,
                                ignoreHttpStatusErrors: true,
                            },
                            output: { postReceive: [handleChecksResponse] },
                        },
                    },
                ],
                default: "checkIntegrationDrift",
            },
            {
                displayName: "Input Mode",
                name: "inputMode",
                type: "options",
                noDataExpression: true,
                options: [
                    { name: "Single Check", value: "single" },
                    { name: "Ordered Batch", value: "batch" },
                ],
                default: "single",
            },
            {
                displayName: "Check",
                name: "check",
                type: "json",
                required: true,
                default: "={{$json.check}}",
                description: "Exact check JSON with integrationId, provider, previous, and current",
                displayOptions: { show: { inputMode: ["single"] } },
                routing: { request: { body: { check: "={{$value}}" } } },
            },
            {
                displayName: "Checks",
                name: "checks",
                type: "json",
                required: true,
                default: "={{$json.checks}}",
                description: "Ordered JSON array containing 1–50 exact check objects",
                displayOptions: { show: { inputMode: ["batch"] } },
                routing: { request: { body: { checks: "={{$value}}" } } },
            },
            {
                displayName: "This node only returns recommendations. It never modifies the monitored integration, retries a failed call, or applies a repair plan.",
                name: "safetyNotice",
                type: "notice",
                default: "",
            },
        ],
    };
}
