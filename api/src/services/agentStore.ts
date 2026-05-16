type AgentInput = {
  walletAddress: string;
  name: string;
  ownerAddress?: string | null;
  capabilities: string[];
  pricePerTask: number;
  metadataUri?: string | null;
};

export type Agent = AgentInput & {
  id: string;
  reputation: number;
  tasksCompleted: number;
  tasksFailed: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const now = new Date().toISOString();

const fallbackAgents = new Map<string, Agent>(
  [
    {
      id: "demo-atlas-web-scraper",
      walletAddress: "0x1111111111111111111111111111111111111111",
      name: "Atlas Web Scraper",
      ownerAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      capabilities: ["web-scraper", "research"],
      pricePerTask: 12.5,
      reputation: 82,
      tasksCompleted: 37,
      tasksFailed: 0,
      active: true,
      metadataUri: "ipfs://demo/atlas-web-scraper",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "demo-nova-data-analyst",
      walletAddress: "0x2222222222222222222222222222222222222222",
      name: "Nova Data Analyst",
      ownerAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      capabilities: ["data-analyst", "csv", "visualization"],
      pricePerTask: 20,
      reputation: 91,
      tasksCompleted: 64,
      tasksFailed: 0,
      active: true,
      metadataUri: "ipfs://demo/nova-data-analyst",
      createdAt: now,
      updatedAt: now
    }
  ].map((agent) => [agent.walletAddress.toLowerCase(), agent])
);

export function listFallbackAgents() {
  return [...fallbackAgents.values()]
    .filter((agent) => agent.active)
    .sort((a, b) => b.reputation - a.reputation || b.tasksCompleted - a.tasksCompleted);
}

export function getFallbackAgent(address: string) {
  return fallbackAgents.get(address.toLowerCase()) ?? null;
}

export function upsertFallbackAgent(input: AgentInput) {
  const key = input.walletAddress.toLowerCase();
  const existing = fallbackAgents.get(key);
  const updatedAt = new Date().toISOString();

  const agent: Agent = {
    id: existing?.id ?? `local-${key}`,
    walletAddress: input.walletAddress,
    name: input.name,
    ownerAddress: input.ownerAddress ?? null,
    capabilities: input.capabilities,
    pricePerTask: input.pricePerTask,
    reputation: existing?.reputation ?? 50,
    tasksCompleted: existing?.tasksCompleted ?? 0,
    tasksFailed: existing?.tasksFailed ?? 0,
    active: true,
    metadataUri: input.metadataUri ?? null,
    createdAt: existing?.createdAt ?? updatedAt,
    updatedAt
  };

  fallbackAgents.set(key, agent);
  return agent;
}

export function queryFallbackAgents(input: {
  capability: string;
  minReputation: number;
  maxPrice?: number;
}) {
  return listFallbackAgents()
    .filter((agent) => agent.capabilities.includes(input.capability))
    .filter((agent) => agent.reputation >= input.minReputation)
    .filter((agent) => input.maxPrice === undefined || agent.pricePerTask <= input.maxPrice)
    .sort((a, b) => b.reputation - a.reputation || b.tasksCompleted - a.tasksCompleted || a.pricePerTask - b.pricePerTask);
}
