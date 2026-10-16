import type {Config} from "@react-router/dev/config";

// Server rendering on (Netlify handler via @netlify/vite-plugin-react-router).
export default {
    appDirectory: "src",
    ssr: true,
} satisfies Config;
