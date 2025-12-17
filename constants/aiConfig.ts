import { FunctionDeclaration, Tool, Type } from "@google/genai";
import { DEFAULT_PROJECTS, PRIORITIES, STATUSES } from '../constants';

// Persona Definition
export const WES_AI_SYSTEM_INSTRUCTION = `
You are **WesAI**, the tactical operator and "second brain" for John Wesley Quintero. 
Your goal is to be a force multiplier—executing tasks, organizing the board, and providing strategic clarity.

**Identity & Tone:**
- **Role:** Executive Officer (XO) / Operator.
- **Tone:** Brotherly, pragmatic, high-agency, concise. Use "we", "brother", "let's".
- **Style:** Do not write paragraphs. Be actionable. 

**Capabilities:**
You have direct access to the "MyOps" mission board via Tools.
- **ALWAYS** check the current state of the board using \`get_tasks\` before answering questions about what is on the list.
- **Create Tasks:** Use \`create_task\` when the user asks to add something.
- **Update Tasks:** Use \`update_task\` to change status, priority, or description.
- **Delete Tasks:** Use \`delete_task\` to remove items.

**Rules:**
1. If the user asks "What's on my plate?", call \`get_tasks\` first.
2. When creating tasks, infer the best **Project** (${DEFAULT_PROJECTS.join(', ')}) and **Priority** (${PRIORITIES.join(', ')}). Default to 'Inbox' and 'Medium' if unsure.
3. Today's date is ${new Date().toISOString().split('T')[0]}.
`;

// --- Tool Definitions ---

const getTasksTool: FunctionDeclaration = {
    name: "get_tasks",
    description: "Get the full list of current tasks on the mission board.",
    parameters: {
        type: Type.OBJECT,
        properties: {},
    }
};

const createTaskTool: FunctionDeclaration = {
    name: "create_task",
    description: "Add a new task to the board.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING, description: "The task description or title." },
            project: { type: Type.STRING, description: `The project/category. Options: ${DEFAULT_PROJECTS.join(', ')}` },
            priority: { type: Type.STRING, description: "Priority level: High, Medium, or Low" },
            date: { type: Type.STRING, description: "Due date in YYYY-MM-DD format. Default to today if unspecified." }
        },
        required: ["description"]
    }
};

const updateTaskTool: FunctionDeclaration = {
    name: "update_task",
    description: "Update an existing task's details.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "The UUID of the task to update." },
            description: { type: Type.STRING, description: "New description (optional)" },
            status: { type: Type.STRING, description: `New status. Options: ${STATUSES.join(', ')}` },
            priority: { type: Type.STRING, description: "New priority" },
            date: { type: Type.STRING, description: "New due date YYYY-MM-DD" }
        },
        required: ["id"]
    }
};

const deleteTaskTool: FunctionDeclaration = {
    name: "delete_task",
    description: "Delete a task from the board.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "The UUID of the task to delete." }
        },
        required: ["id"]
    }
};

export const WES_TOOLS: Tool[] = [{
    functionDeclarations: [getTasksTool, createTaskTool, updateTaskTool, deleteTaskTool]
}];