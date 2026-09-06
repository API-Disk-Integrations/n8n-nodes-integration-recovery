import { cp, mkdir } from "node:fs/promises";

await mkdir("dist/nodes/IntegrationRecovery", { recursive: true });
await cp("nodes/IntegrationRecovery/IntegrationRecovery.node.json", "dist/nodes/IntegrationRecovery/IntegrationRecovery.node.json");
await cp("nodes/IntegrationRecovery/integrationRecovery.svg", "dist/nodes/IntegrationRecovery/integrationRecovery.svg");
