import { FunctionDeclaration, Tool, Type } from "@google/genai";
import { DEFAULT_PROJECTS, STATUSES } from "./data";

// Persona Definition
export const WES_AI_SYSTEM_INSTRUCTION = `
You are **WesAI**, the tactical operator and "second brain" for John Wesley Quintero. 
Your goal is to be a force multiplier—executing tasks, organizing the board, and providing strategic clarity.

**Identity & Tone:**
- **Role:** Executive Officer (XO) / Operator.
- **Tone:** Brotherly, pragmatic, high-agency, concise. Use "we", "brother", "let's".
- **Style:** Do not write paragraphs. Be actionable. 

**Capabilities:**
You have direct access to the "MyOps" mission board, CRM, and Knowledge Base via Tools.
- **Tasks:** \`get_tasks\`, \`create_task\`, \`update_task\`, \`delete_task\`, \`get_focused_tasks\`.
- **CRM:** \`get_contacts\`, \`create_contact\` to manage clients and vendors.
- **Knowledge Base:** \`get_notes\`, \`create_note\` to access SOPs and documentation.
- **Vault:** \`get_vault_entries\` to see secure labels (not values).
- **Analytics:** \`get_insights\` to check your current operator stats.
- **Strategy:** \`get_decisions\` to review strategic and tactical choices.
- **Awareness:** \`get_mental_state\`, \`get_operator_summary\` to check current constraints and holistic state.
- **Assets:** \`get_assets\`, \`create_asset\` to manage your IP registry and SOP library.
- **Reflections:** \`get_reflections\`, \`create_reflection\` for post-mortems and learning loops.
- **Life Ops:** \`get_life_constraints\` to see personal and health commitments.

**Rules & Agency:**
1. **Be Proactive:** If the user seems overwhelmed, call \`get_operator_summary\` and suggest a focus plan.
2. **Contextual Awareness:** When a task is completed, suggest creating a reflection if it was "High" priority.
3. **Smart Scheduling:** Use \`get_mental_state\` and \`get_life_constraints\` before suggesting a "High" priority mission. If energy is < 3, suggest lower-impact tasks.
4. **Data Integrity:** If a task description mentions a person or a tool, check \`get_contacts\` or \`get_assets\` to provide context.
5. **Conciseness:** Never use "I think" or "I believe". Use "Operator, here's the play" or "Brother, the board looks like this".
6. If the user asks "What's on my plate?", call \`get_operator_summary\` first to see the full picture, then \`get_focused_tasks\`.
7. Strategic decisions should be reviewed if their review date is in the past. Use \`get_decisions\` to check.
8. Encourage post-mortems using \`create_reflection\` after a major task is completed.
9. Today's date is ${new Date().toISOString().split("T")[0]}.
`;

// --- Tool Definitions ---

const getInsightsTool: FunctionDeclaration = {
  name: "get_insights",
  description: "Get current operator metrics (XP, level, streak, etc.)",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getArtifactRecommendationsTool: FunctionDeclaration = {
  name: "get_artifact_recommendations",
  description:
    "Check progress toward unlocking rare artifacts and get recommendations on what to do next.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getVaultEntriesTool: FunctionDeclaration = {
  name: "get_vault_entries",
  description: "Get labels of secure items stored in the vault.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getTasksTool: FunctionDeclaration = {
  name: "get_tasks",
  description: "Get the full list of current tasks on the mission board.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const createTaskTool: FunctionDeclaration = {
  name: "create_task",
  description: "Add a new task to the board.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      description: {
        type: Type.STRING,
        description: "The task description or title.",
      },
      project: {
        type: Type.STRING,
        description: `The project/category. Options: ${DEFAULT_PROJECTS.join(", ")}`,
      },
      priority: {
        type: Type.STRING,
        description: "Priority level: High, Medium, or Low",
      },
      date: {
        type: Type.STRING,
        description:
          "Due date in YYYY-MM-DD format. Default to today if unspecified.",
      },
    },
    required: ["description"],
  },
};

const updateTaskTool: FunctionDeclaration = {
  name: "update_task",
  description: "Update an existing task's details.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "The UUID of the task to update." },
      description: {
        type: Type.STRING,
        description: "New description (optional)",
      },
      status: {
        type: Type.STRING,
        description: `New status. Options: ${STATUSES.join(", ")}`,
      },
      priority: { type: Type.STRING, description: "New priority" },
      date: { type: Type.STRING, description: "New due date YYYY-MM-DD" },
    },
    required: ["id"],
  },
};

const deleteTaskTool: FunctionDeclaration = {
  name: "delete_task",
  description: "Delete a task from the board.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "The UUID of the task to delete." },
    },
    required: ["id"],
  },
};

const getContactsTool: FunctionDeclaration = {
  name: "get_contacts",
  description: "Get the list of contacts, clients, and vendors from the CRM.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const createContactTool: FunctionDeclaration = {
  name: "create_contact",
  description: "Add a new contact to the CRM.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Full name of the contact" },
      company: { type: Type.STRING, description: "Company name" },
      type: {
        type: Type.STRING,
        description: "Type: Client, Vendor, Partner, or Lead",
      },
      email: { type: Type.STRING, description: "Email address" },
    },
    required: ["name", "type"],
  },
};

const getNotesTool: FunctionDeclaration = {
  name: "get_notes",
  description: "Search and retrieve documents from the Knowledge Base.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const createNoteTool: FunctionDeclaration = {
  name: "create_note",
  description: "Create a new document or SOP in the Knowledge Base.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the document" },
      content: {
        type: Type.STRING,
        description: "Markdown content of the note",
      },
      tags: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Tags for categorization",
      },
    },
    required: ["title", "content"],
  },
};

const getFocusedTasksTool: FunctionDeclaration = {
  name: "get_focused_tasks",
  description:
    "Get a curated list of high-priority and relevant tasks based on current context and mental state.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getOperatorSummaryTool: FunctionDeclaration = {
  name: "get_operator_summary",
  description:
    "Get a holistic summary of the operator's current state, including task load, mental state, and active constraints.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getDecisionsTool: FunctionDeclaration = {
  name: "get_decisions",
  description:
    "Get the list of strategic and tactical decisions from the judgment journal.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getMentalStateTool: FunctionDeclaration = {
  name: "get_mental_state",
  description:
    "Check the user's current energy and clarity levels for constraints awareness.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getAssetsTool: FunctionDeclaration = {
  name: "get_assets",
  description:
    "Get the list of assets, frameworks, and SOPs from the registry.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const createAssetTool: FunctionDeclaration = {
  name: "create_asset",
  description: "Add a new asset or SOP to the registry.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the asset" },
      type: {
        type: Type.STRING,
        description: "Type: Framework, SOP, Tool, Content, or Code",
      },
      notes: { type: Type.STRING, description: "Detailed notes or content" },
    },
    required: ["title", "type"],
  },
};

const getReflectionsTool: FunctionDeclaration = {
  name: "get_reflections",
  description:
    "Get the list of past reflections, post-mortems, and mistake logs.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const createReflectionTool: FunctionDeclaration = {
  name: "create_reflection",
  description: "Log a new reflection or post-mortem.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the reflection" },
      type: {
        type: Type.STRING,
        description: "Type: Post-Mortem, Weekly, Monthly, or Mistake Log",
      },
      content: {
        type: Type.STRING,
        description: "The main reflection content",
      },
    },
    required: ["title", "type", "content"],
  },
};

const getLifeConstraintsTool: FunctionDeclaration = {
  name: "get_life_constraints",
  description: "Get personal commitments, health blocks, and life constraints.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export const WES_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      getInsightsTool,
      getArtifactRecommendationsTool,
      getVaultEntriesTool,
      getTasksTool,
      createTaskTool,
      updateTaskTool,
      deleteTaskTool,
      getContactsTool,
      createContactTool,
      getNotesTool,
      createNoteTool,
      getFocusedTasksTool,
      getOperatorSummaryTool,
      getDecisionsTool,
      getMentalStateTool,
      getAssetsTool,
      createAssetTool,
      getReflectionsTool,
      createReflectionTool,
      getLifeConstraintsTool,
    ],
  },
];
