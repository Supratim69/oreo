import CodeRunner from "../components/CodeRunner";

// Simulated LLM-generated backend code (an Express server)
const generatedCode = `
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello from LLM-generated server!');
});

app.listen(PORT, () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
});
`;

export default function Home() {
    return (
        <main>
            <CodeRunner code={generatedCode} />
        </main>
    );
}
