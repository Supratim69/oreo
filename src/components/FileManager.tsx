"use client";
import { useState } from "react";

export default function FileManager({
    onFileUpdate,
}: {
    onFileUpdate: (files: Record<string, string>) => void;
}) {
    const [files, setFiles] = useState<Record<string, string>>({
        "index.html":
            "<!DOCTYPE html>\n<html>\n<head>\n<title>My App</title>\n</head>\n<body>\n<h1>Hello, World!</h1>\n</body>\n</html>",
        "script.js": "console.log('Hello from script.js');",
    });
    const [newFileName, setNewFileName] = useState("");
    const [newFileContent, setNewFileContent] = useState("");

    const handleAddFile = () => {
        if (newFileName.trim() !== "") {
            setFiles((prevFiles) => {
                const updatedFiles = {
                    ...prevFiles,
                    [newFileName]: newFileContent,
                };
                onFileUpdate(updatedFiles);
                return updatedFiles;
            });
            setNewFileName("");
            setNewFileContent("");
        }
    };

    const handleEditFile = (fileName: string, content: string) => {
        setFiles((prevFiles) => {
            const updatedFiles = { ...prevFiles, [fileName]: content };
            onFileUpdate(updatedFiles);
            return updatedFiles;
        });
    };

    const handleDeleteFile = (fileName: string) => {
        setFiles((prevFiles) => {
            const updatedFiles = { ...prevFiles };
            delete updatedFiles[fileName];
            onFileUpdate(updatedFiles);
            return updatedFiles;
        });
    };

    return (
        <div className="p-4 bg-gray-900 text-white">
            <h2 className="text-xl font-bold">File Manager</h2>
            <div className="mt-4">
                <input
                    type="text"
                    placeholder="Filename"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="p-2 rounded bg-gray-700 text-white mr-2"
                />
                <textarea
                    placeholder="File Content"
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    className="p-2 rounded bg-gray-700 text-white w-full h-20 mt-2"
                />
                <button
                    onClick={handleAddFile}
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Add File
                </button>
            </div>
            <ul className="mt-4">
                {Object.entries(files).map(([fileName, content]) => (
                    <li key={fileName} className="mb-2">
                        <div className="flex justify-between items-center">
                            <span>{fileName}</span>
                            <button
                                onClick={() => handleDeleteFile(fileName)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                            >
                                Delete
                            </button>
                        </div>
                        <textarea
                            value={content}
                            onChange={(e) =>
                                handleEditFile(fileName, e.target.value)
                            }
                            className="p-2 rounded bg-gray-700 text-white w-full h-20 mt-2"
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
