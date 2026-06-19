const config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                "neon-blue": "hsl(var(--neon-blue))",
            },
            fontFamily: {
                sans: ["var(--font-inter)"],
                mono: ["var(--font-mono)"],
            },
        },
    },
    plugins: [],
};
export default config;
