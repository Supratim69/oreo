"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import FileExplorer from "@/components/FileExplorer";
import Editor from "@/components/Editor";
import Terminal from "@/components/Terminal";
import ExecutionPreview from "@/components/ExecutionPreview";
import { WebContainer } from "@webcontainer/api";

const sampleProject = {
    files: {
        "package.json": {
            content:
                '{\n  "name": "todo-nextjs",\n  "version": "1.0.0",\n  "private": true,\n  "scripts": {\n    "dev": "npx next dev",\n    "build": "next build",\n    "start": "next start"\n  },\n  "dependencies": {\n    "next": "latest",\n    "react": "latest",\n    "react-dom": "latest"\n  }\n}',
        },
        "app/layout.js": {
            content:
                "\"use client\";\nimport \"../styles/globals.css\";\n\nexport default function Layout({ children }) {\n  return (\n    <html lang='en'>\n      <body>\n        <div className='container'>\n          <h1>Todo App</h1>\n          {children}\n        </div>\n      </body>\n    </html>\n  );\n}",
        },
        "app/page.js": {
            content:
                "\"use client\";\nimport { useState } from 'react';\nimport TodoList from '../components/TodoList';\nimport TodoForm from '../components/TodoForm';\n\nexport default function Home() {\n  const [todos, setTodos] = useState([]);\n\n  const addTodo = (text) => {\n    setTodos([...todos, { id: Date.now(), text }]);\n  };\n\n  const removeTodo = (id) => {\n    setTodos(todos.filter(todo => todo.id !== id));\n  };\n\n  return (\n    <div className='todo-container'>\n      <TodoForm addTodo={addTodo} />\n      <TodoList todos={todos} removeTodo={removeTodo} />\n    </div>\n  );\n}",
        },
        "components/TodoForm.js": {
            content:
                "\"use client\";\nimport { useState } from 'react';\n\nexport default function TodoForm({ addTodo }) {\n  const [text, setText] = useState('');\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    if (!text.trim()) return;\n    addTodo(text);\n    setText('');\n  };\n\n  return (\n    <form onSubmit={handleSubmit} className='todo-form'>\n      <input\n        type='text'\n        value={text}\n        onChange={(e) => setText(e.target.value)}\n        placeholder='Add a new task...'\n      />\n      <button type='submit'>Add</button>\n    </form>\n  );\n}",
        },
        "components/TodoList.js": {
            content:
                "\"use client\";\nimport TodoItem from './TodoItem';\n\nexport default function TodoList({ todos, removeTodo }) {\n  return (\n    <ul className='todo-list'>\n      {todos.map(todo => (\n        <TodoItem key={todo.id} todo={todo} removeTodo={removeTodo} />\n      ))}\n    </ul>\n  );\n}",
        },
        "components/TodoItem.js": {
            content:
                "\"use client\";\nexport default function TodoItem({ todo, removeTodo }) {\n  return (\n    <li className='todo-item'>\n      {todo.text}\n      <button onClick={() => removeTodo(todo.id)}>Delete</button>\n    </li>\n  );\n}",
        },
        "styles/globals.css": {
            content:
                "body {\n  font-family: Arial, sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  background-color: #f0f0f0;\n}\n\n.container {\n  background: white;\n  padding: 20px;\n  border-radius: 8px;\n  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);\n  width: 300px;\n  text-align: center;\n}\n\ninput {\n  width: 80%;\n  padding: 8px;\n  margin: 10px 0;\n}\n\nbutton {\n  padding: 8px;\n  background-color: #28a745;\n  color: white;\n  border: none;\n  cursor: pointer;\n}\n\nbutton:hover {\n  background-color: #218838;\n}\n\nul {\n  list-style: none;\n  padding: 0;\n}\n\nli {\n  display: flex;\n  justify-content: space-between;\n  padding: 8px;\n  background: #fff;\n  margin: 5px 0;\n  border: 1px solid #ddd;\n}\n\nli button {\n  background-color: #dc3545;\n}\n\nli button:hover {\n  background-color: #c82333;\n}",
        },
    },
};

export default function CodePortal() {
    const [logs, setLogs] = useState<string[]>([]);
    const [files, setFiles] = useState<Record<string, { content: string }>>(
        sampleProject.files
    );
    const [webcontainerInstance, setWebcontainerInstance] =
        useState<WebContainer | null>(null);
    const [isInstalling, setIsInstalling] = useState(false);

    useEffect(() => {
        async function bootWebContainer() {
            const instance = await WebContainer.boot();
            setWebcontainerInstance(instance);
            setLogs((prevLogs) => [...prevLogs, "✅ WebContainer Initialized"]);

            // Update files first
            await updateWebContainerFiles(files, instance);

            // Install dependencies
            setIsInstalling(true);
            const npmInstallProcess = await instance.spawn("npm", ["install"]);

            npmInstallProcess.output.pipeTo(
                new WritableStream({
                    write(data) {
                        // Optionally log minimal progress if needed
                        console.log(data);
                    },
                })
            );

            await npmInstallProcess.exit;

            // Finish installation
            setIsInstalling(false);
            setLogs((prevLogs) => [...prevLogs, "✅ Dependencies Installed"]);
        }
        bootWebContainer();
    }, []);

    async function updateWebContainerFiles(
        files: Record<string, { content: string }>,
        instance: WebContainer
    ) {
        for (const [filePath, file] of Object.entries(files)) {
            const pathParts = filePath.split("/");
            if (pathParts.length > 1) {
                const dirPath = pathParts.slice(0, -1).join("/");
                await instance.fs.mkdir(dirPath, { recursive: true });
            }
            await instance.fs.writeFile(filePath, file.content);
        }
    }

    async function runCommand(command: string[]) {
        if (!webcontainerInstance) return;
        setLogs((prevLogs) => [
            ...prevLogs,
            `🚀 Running: ${command.join(" ")}`,
        ]);
        const process = await webcontainerInstance.spawn(
            command[0],
            command.slice(1)
        );
        process.output.pipeTo(
            new WritableStream({
                write(data) {
                    setLogs((prevLogs) => [...prevLogs, data]);
                },
            })
        );
        await process.exit;
    }

    const handleRun = async () => {
        await runCommand(["npx", "next", "dev"]);
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* File Explorer Sidebar */}
            <FileExplorer
                files={files}
                onFileUpdate={setFiles}
                webcontainerInstance={webcontainerInstance}
            />

            {/* Main Content */}
            <div className="flex flex-col flex-1 p-4">
                <h1 className="text-2xl font-bold">Code Portal</h1>
                <div className="flex flex-1 gap-4 mt-4">
                    {/* Editor Area */}
                    <Editor
                        files={files}
                        onFileUpdate={setFiles}
                        className="flex-1"
                    />

                    {/* Execution Preview Area */}
                    <ExecutionPreview
                        webcontainerInstance={webcontainerInstance}
                        className="flex-1 bg-gray-800 rounded p-4"
                    />
                </div>

                {/* Terminal */}
                {isInstalling ? (
                    <div
                        className={`bg-black text-green-400 p-4 rounded h-48 flex items-center justify-center`}
                    >
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-400"></div>
                        <span className="ml-4">Installing dependencies...</span>
                    </div>
                ) : (
                    <Terminal logs={logs} className="mt-4" />
                )}
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex gap-2">
                <Button
                    onClick={handleRun}
                    className="bg-blue-500 hover:bg-blue-700"
                >
                    Run
                </Button>
                <Button className="bg-gray-600 hover:bg-gray-700">
                    Deploy
                </Button>
            </div>
        </div>
    );
}
