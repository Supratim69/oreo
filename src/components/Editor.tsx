"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface EditorProps {
    files: Record<string, { content: string }>;
    onFileUpdate: (files: Record<string, { content: string }>) => void;
    activeFile: string | null;
    className: string | null;
}

export default function Editor({ files, onFileUpdate, activeFile,className }: EditorProps) {
    const [content, setContent] = useState<string>(activeFile ? files[activeFile].content : "");

    useEffect(() => {
        if (activeFile) {
            setContent(files[activeFile].content);
        }
    }, [activeFile]);

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined && activeFile) {
            setContent(value);
            onFileUpdate({ ...files, [activeFile]: { content: value } });
        }
    };

    return (
        <div className="mt-2 flex flex-col bg-[#161616] p-4 rounded-xl shadow-lg border border-[#2A2A2A] flex-1">
            <h2 className="text-xl font-semibold text-gray-300 mb-2 bg-[#0D0D0D] px-3 py-2 rounded-lg">
                {activeFile || "Select a file"}
            </h2>
            {activeFile ? (
                <MonacoEditor
                    height="500px"
                    theme="vs-dark"
                    language="javascript"
                    value={content}
                    onChange={handleEditorChange}
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        padding: { top: 10 },
                    }}
                />
            ) : (
                <p className="text-gray-400 text-center py-10">No file selected</p>
            )}
        </div>
    );
}