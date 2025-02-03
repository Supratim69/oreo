"use client";
import { useState, useEffect } from "react";
import { WebContainer } from "@webcontainer/api";

export default function CodeRunner({ code }: { code: string }) {
    const [logs, setLogs] = useState<string[]>([]);
    const [webcontainerInstance, setWebcontainerInstance] =
        useState<WebContainer | null>(null);

    useEffect(() => {
        async function setupWebContainer() {
            const instance = await WebContainer.boot();
            setWebcontainerInstance(instance);
            setLogs((prev) => [...prev, "✅ WebContainer Initialized"]);

            await instance.fs.writeFile("/app.js", code);
            await instance.fs.writeFile(
                "/package.json",
                JSON.stringify({
                    name: "webcontainer-app",
                    version: "1.0.0",
                    scripts: { start: "node app.js" },
                    dependencies: { express: "^4.18.2" },
                })
            );

            await runCommand(["npm", "install"]);
        }

        setupWebContainer();
    }, [code]);

    async function runCommand(command: string[]) {
        if (!webcontainerInstance) return;

        setLogs((prev) => [...prev, `🚀 Running: ${command.join(" ")}`]);

        const process = await webcontainerInstance.spawn(
            command[0],
            command.slice(1)
        );

        process.output.pipeTo(
            new WritableStream({
                write(data: string) {
                    setLogs((prev) => [...prev, data]);
                },
            })
        );

        await process.exit;
    }

    async function handleRunCode() {
        await runCommand(["npm", "start"]);
    }

    return (
        <div className="p-6 bg-gray-800 text-white min-h-screen">
            <h1 className="text-2xl font-bold">Run LLM-Generated Code</h1>
            <button
                onClick={handleRunCode}
                className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
                Run Code
            </button>
            <pre className="mt-4 bg-gray-900 p-4 rounded text-sm overflow-auto">
                {logs.join("\n")}
            </pre>
        </div>
    );
}
