import type {Config} from "@react-router/dev/config";

// Single-page mode: no server rendering yet (enabled in a later ticket).
export default {
    appDirectory: "src",
    ssr: false,
} satisfies Config;
