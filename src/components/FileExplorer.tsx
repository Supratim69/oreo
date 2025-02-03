"use client";
import { useState } from "react";
import {
    FaFolder,
    FaFile,
    FaChevronDown,
    FaChevronRight,
} from "react-icons/fa";

interface FileExplorerProps {
    files: Record<string, { content: string }>;
    onFileUpdate: (files: Record<string, { content: string }>) => void;
    webcontainerInstance: any;
}

export default function FileExplorer({
    files,
    onFileUpdate,
    webcontainerInstance,
}: FileExplorerProps) {
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

    const toggleExpand = (folder: string) => {
        setExpanded((prev) => ({ ...prev, [folder]: !prev[folder] }));
    };

    const handleFileUpdate = (
        updatedFiles: Record<string, { content: string }>
    ) => {
        onFileUpdate(updatedFiles);
        updateWebContainerFiles(updatedFiles);
    };

    async function updateWebContainerFiles(
        files: Record<string, { content: string }>
    ) {
        if (!webcontainerInstance) return;
        for (const [filePath, file] of Object.entries(files)) {
            await webcontainerInstance.fs.writeFile(filePath, file.content);
        }
    }

    const renderFileTree = (fileTree: Record<string, { content: string }>) => {
        return Object.keys(fileTree).map((filePath) => {
            const isFolder = filePath.includes("/");
            const parts = filePath.split("/");
            const fileName = parts.pop()!;
            const folderPath = parts.join("/");

            if (isFolder && !expanded[folderPath]) return null;

            return (
                <div key={filePath} className="pl-4">
                    {isFolder ? (
                        <div
                            onClick={() => toggleExpand(folderPath)}
                            className="cursor-pointer flex items-center"
                        >
                            {expanded[folderPath] ? (
                                <FaChevronDown />
                            ) : (
                                <FaChevronRight />
                            )}
                            <FaFolder className="ml-2" />
                            <span className="ml-2">{folderPath}</span>
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <FaFile className="mr-2" />
                            <span>{fileName}</span>
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="w-64 bg-gray-800 p-4 min-h-screen">
            <h2 className="text-lg font-bold">File Explorer</h2>
            <div className="mt-4 text-gray-300">{renderFileTree(files)}</div>
        </div>
    );
}
