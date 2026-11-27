import { resolveTestBaseUrl } from "../src/config/testTarget";

// These integration tests send real HTTP requests, including account-creation
// requests. Never silently default them to a deployed or production service.
export const BASE_URL = resolveTestBaseUrl(process.env);
