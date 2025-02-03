"use client";
import { useState, useEffect } from "react";
import { WebContainer } from "@webcontainer/api";
import FileManager from "../components/FileManager";

export default function VirtualFileSystem() {
    const [webcontainerInstance, setWebcontainerInstance] =
        useState<WebContainer | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [files, setFiles] = useState<Record<string, string>>({
        "index.html":
            "<!DOCTYPE html>\n<html>\n<head>\n<title>My App</title>\n</head>\n<body>\n<h1>Hello, World!</h1>\n</body>\n</html>",
        "script.js": "console.log('Hello from script.js');",
    });

    useEffect(() => {
        async function setupWebContainer() {
            const instance = await WebContainer.boot();
            setWebcontainerInstance(instance);
            setLogs((prev) => [...prev, "✅ WebContainer Initialized"]);

            await createProjectFiles(files, instance);
            await runCommand(["npm", "install"]);
        }

        setupWebContainer();
    }, [files]);

    async function createProjectFiles(
        files: Record<string, string>,
        instance: WebContainer
    ) {
        for (const [filePath, content] of Object.entries(files)) {
            await instance.fs.writeFile(filePath, content);
            setLogs((prev) => [...prev, `📂 Created: ${filePath}`]);
        }
    }

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

    async function startProject() {
        await runCommand(["npm", "start"]);
        const url = await webcontainerInstance?.url;
        setPreviewUrl(url ? `${url}/public/index.html` : null);
    }

    return (
        <div className="p-6 bg-gray-800 text-white min-h-screen">
            <h1 className="text-2xl font-bold">Virtual File System</h1>
            <FileManager onFileUpdate={setFiles} />
            <button
                onClick={startProject}
                className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
                Start Project
            </button>
            <pre className="mt-4 bg-gray-900 p-4 rounded text-sm overflow-auto">
                {logs.join("\n")}
            </pre>
            {previewUrl && (
                <iframe
                    src={previewUrl}
                    className="w-full h-[500px] border-none mt-4"
                />
            )}
        </div>
    );
}
