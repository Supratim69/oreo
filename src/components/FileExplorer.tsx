"use client";
import React from "react";

interface FileExplorerProps {
    files: Record<string, { content: string }>;
    onFileSelect: (fileName: string) => void;
    activeFile: string | null;
}

export default function FileExplorer({ files, onFileSelect, activeFile }: FileExplorerProps) {
    return (
        <div className="w-64 bg-[#161616] p-4 rounded-xl border border-[#2A2A2A] h-full shadow-md">
            <h2 className="text-lg font-semibold text-gray-300 mb-4 tracking-wide">Files</h2>
            <ul className="space-y-1">
                {Object.keys(files).map((fileName) => (
                    <li
                        key={fileName}
                        className={`p-2 cursor-pointer rounded-lg transition-all duration-200 ${
                            activeFile === fileName
                                ? "bg-blue-500 text-white font-semibold"
                                : "text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                        onClick={() => onFileSelect(fileName)}
                    >
                        {fileName}
                    </li>
                ))}
            </ul>
        </div>
    );
}
