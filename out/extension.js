"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const openai_1 = __importDefault(require("openai"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const vscode = __importStar(require("vscode"));
function activate(context) {
    console.log('Screen AI Helper extension is now active');
    const disposable = vscode.commands.registerCommand('screenAiHelper.explainCurrentError', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor');
            return;
        }
        const document = editor.document;
        const uri = document.uri;
        // Get diagnostics (errors/warnings) for this file
        const allDiagnostics = vscode.languages.getDiagnostics(uri);
        if (!allDiagnostics || allDiagnostics.length === 0) {
            vscode.window.showInformationMessage('No diagnostics found in this file.');
            return;
        }
        // Take the first diagnostic for now
        const targetDiag = allDiagnostics[0];
        // Highlight the error range in the editor (our basic "pointer")
        if (targetDiag.range) {
            highlightRange(editor, targetDiag.range);
        }
        const errorRange = targetDiag.range;
        const errorText = errorRange
            ? document.getText(errorRange)
            : '(no specific error range)';
        const fullText = document.getText();
        const payload = {
            languageId: document.languageId,
            fileName: document.fileName,
            errorMessage: targetDiag.message,
            errorSeverity: targetDiag.severity,
            errorText,
            fullText
        };
        vscode.window.setStatusBarMessage('Screen AI Helper: Processing...', 3000);
        // For now this is a fake AI call – we'll swap this with real API later
        const explanation = await callAi(payload);
        showExplanationWebview(context, explanation, payload);
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
/**
 * Highlight a given range in the editor using a decoration.
 */
function highlightRange(editor, range) {
    const decorationType = vscode.window.createTextEditorDecorationType({
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: '#ff4b4b',
        backgroundColor: 'rgba(255, 75, 75, 0.1)'
    });
    editor.setDecorations(decorationType, [range]);
    // Remove decoration after 5 seconds
    setTimeout(() => {
        decorationType.dispose();
    }, 5000);
}
async function callAi(payload) {
    try {
        const client = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY
        });
        const prompt = `
You are an expert coding assistant. Explain the following error clearly
and provide the corrected code.

Language: ${payload.languageId}
File: ${payload.fileName}

Error Message:
${payload.errorMessage}

Code Snippet Causing Error:
${payload.errorText}

Full File Context:
${payload.fullText}
        `;
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You help programmers understand and fix code errors."
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });
        return response.choices[0].message?.content ?? "AI returned no explanation.";
    }
    catch (error) {
        return "AI Error: " + error.message;
    }
}
/**
 * Create a webview panel that shows the error and AI explanation.
 */
function showExplanationWebview(context, explanation, payload) {
    const panel = vscode.window.createWebviewPanel('screenAiHelperExplanation', 'Screen AI Helper – Error Explanation', vscode.ViewColumn.Beside, {
        enableScripts: true
    });
    panel.webview.html = getHtml(explanation, payload);
}
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
function getHtml(explanation, payload) {
    const safeExplanation = escapeHtml(explanation);
    const safeError = escapeHtml(payload.errorText);
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: system-ui, sans-serif;
            padding: 12px;
            background: #1e1e1e;
            color: #e5e5e5;
        }
        pre {
            background: #252526;
            padding: 8px;
            border-radius: 6px;
            white-space: pre-wrap;
        }
        .section { margin-bottom: 20px; }
        .badge {
            padding: 4px 10px;
            background: #2e2e2e;
            border-radius: 20px;
            margin-right: 7px;
            border: 1px solid #555;
        }
    </style>
</head>
<body>

<h2>Screen AI Helper – Error Explanation</h2>

<div class="section">
    <span class="badge">Language: ${payload.languageId}</span>
    <span class="badge">File: ${payload.fileName}</span>
</div>

<div class="section">
    <strong>Code causing the error:</strong>
    <pre>${safeError}</pre>
</div>

<div class="section">
    <strong>AI Explanation:</strong>
    <pre>${safeExplanation}</pre>
</div>

</body>
</html>`;
}
//# sourceMappingURL=extension.js.map