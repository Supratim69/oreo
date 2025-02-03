"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
});

interface EditorProps {
    files: Record<string, { content: string }>;
    onFileUpdate: (files: Record<string, { content: string }>) => void;
    className?: string;
}

export default function Editor({
    files,
    onFileUpdate,
    className,
}: EditorProps) {
    const [activeFile, setActiveFile] = useState<string | null>(
        Object.keys(files)[0]
    );
    const [content, setContent] = useState<string>(
        files[activeFile || ""].content || ""
    );

    const handleFileChange = (fileName: string) => {
        setActiveFile(fileName);
        setContent(files[fileName].content || "");
    };

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined && activeFile) {
            setContent(value);
            onFileUpdate({ ...files, [activeFile]: { content: value } });
        }
    };

    return (
        <div className={`flex flex-col bg-gray-900 p-4 rounded ${className}`}>
            <h2 className="text-lg font-bold text-white mb-2">Editor</h2>
            <div className="flex gap-2 mb-4">
                {Object.keys(files).map((file) => (
                    <button
                        key={file}
                        onClick={() => handleFileChange(file)}
                        className={`px-4 py-2 rounded ${
                            file === activeFile ? "bg-blue-500" : "bg-gray-700"
                        }`}
                    >
                        {file}
                    </button>
                ))}
            </div>
            <MonacoEditor
                height="400px"
                theme="vs-dark"
                language="javascript"
                value={content}
                onChange={handleEditorChange}
                options={{ fontSize: 14, minimap: { enabled: false } }}
            />
        </div>
    );
}
