// Client-safe surface. Server-only code lives in *.server.ts and must be imported directly
// from route modules' loaders/actions.
export type AuthActionResult = {error?: string; message?: string};
export {safeRedirect} from "./safeRedirect";
