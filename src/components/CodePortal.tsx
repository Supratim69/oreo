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
  const [activeFile, setActiveFile] = useState<string | null>(
    Object.keys(files)[0]
  );

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
    setLogs((prevLogs) => [...prevLogs, `🚀 Running: ${command.join(" ")}`]);
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
    <div className="flex flex-col md:flex-row h-[95vh] bg-[#0D0D0D] text-gray-200 overflow-hidden relative">
      {/* Action Buttons - Positioned at the Top Right */}
      <div className="absolute top-2 right-2 flex gap-2">
        <Button
          onClick={handleRun}
          className="bg-[#4682B4] hover:bg-[#5A9BD6] px-4 py-2 rounded-xl shadow-md transition-all text-xs text-white font-semibold"
        >
          Run
        </Button>
        <Button className="bg-[#8A2BE2] hover:bg-[#9D4EF1] px-4 py-2 rounded-xl shadow-md transition-all text-xs text-white font-semibold">
          Deploy
        </Button>
      </div>

      {/* File Explorer Sidebar */}
      <FileExplorer
        files={files}
        onFileSelect={setActiveFile}
        activeFile={activeFile}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 p-2 h-full overflow-hidden">
        <h1 className="text-xl font-semibold text-center md:text-left text-[#FFD700]">
          Code Portal
        </h1>
        <div className="flex flex-col md:flex-row flex-1 gap-2 mt-2 overflow-hidden">
          {/* Editor Area */}
          <Editor
            files={files}
            onFileUpdate={setFiles}
            activeFile={activeFile}
            className="flex-1 bg-[#161616] p-3 rounded-xl shadow-md text-sm border border-[#2A2A2A] max-h-[50vh] min-h-[50vh]"
          />

          {/* Execution Preview Area */}
          <ExecutionPreview
            webcontainerInstance={webcontainerInstance}
            className="flex-1 bg-[#161616] rounded-xl p-3 shadow-md text-sm border border-[#2A2A2A] h-full"
          />
        </div>

        {/* Terminal - Fixed Height Even During Installation */}
        <div className="h-[225px] flex flex-col justify-center">
          {isInstalling ? (
            <div className="bg-[#000000] text-[#32CD32] p-4 rounded-xl h-[225px] flex items-center justify-center animate-pulse">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#32CD32]"></div>
              <span className="ml-2 text-sm">Installing dependencies...</span>
            </div>
          ) : (
            <Terminal logs={logs} className="mt-2" />
          )}
        </div>
      </div>
    </div>
  );
}
