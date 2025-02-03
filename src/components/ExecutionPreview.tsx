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
    const [url, setUrl] = useState<string | null>(previewUrl || null);

    useEffect(() => {
        if (webcontainerInstance) {
            // Add event listener for server-ready event
            const handleServerReady = (port: number, serverUrl: string) => {
                console.log(`Server ready on port ${port}`);
                setUrl(serverUrl);
            };

            webcontainerInstance.on("server-ready", handleServerReady);

            // Return cleanup function to remove event listener
            return () => {
                webcontainerInstance.off("server-ready", handleServerReady);
            };
        }
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
                <div className="flex items-center justify-center">
                    <p className="text-gray-400 ml-4">No preview to show</p>
                </div>
            )}
        </div>
    );
}
