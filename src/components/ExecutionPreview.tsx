"use client";
import { useState, useEffect } from "react";
import { WebContainer } from "@webcontainer/api";

interface ExecutionPreviewProps {
    previewUrl?: string;
    webcontainerInstance?: WebContainer | null;
    className?: string;
}

export default function ExecutionPreview({
    previewUrl,
    webcontainerInstance,
    className,
}: ExecutionPreviewProps) {
    const [url, setUrl] = useState<string | null>(
        previewUrl || "http://localhost:3000"
    );

    useEffect(() => {
        // For Next.js, always use the standard local development URL
        setUrl("http://localhost:3000");
    }, [webcontainerInstance]);

    return (
        <div
            className={`bg-gray-800 p-4 rounded w-full h-full flex flex-col items-center justify-center ${className}`}
        >
            <h2 className="text-lg font-bold text-white mb-2">
                Execution Preview
            </h2>
            {url ? (
                <iframe
                    src={url}
                    className="w-full h-full border-none rounded"
                    onError={(e) => {
                        console.error("Iframe load error:", e);
                    }}
                />
            ) : (
                <p className="text-gray-400">No preview available</p>
            )}
        </div>
    );
}
