const Task = require("../models/Task");
const askGemini = require("../services/geminiService");

exports.chat = async (req, res) => {
  try {
    // 1. Fetch the active pending tasks from the database
    const tasks = await Task.find({
      user: req.user
    });

    // 2. Grab the completed tasks sent from our updated frontend request body
    const completedTasks = req.body.completedTasks || [];

    // 3. Format a cleaner prompt structure so Gemini doesn't get confused by massive JSON blobs
    const activeTasksSummary = tasks
      .map(t => `- [Pending] Title: "${t.title}", Priority: ${t.priority}, Due: ${t.deadline}`)
      .join("\n");

    const completedTasksSummary = completedTasks
      .map(t => `- [Completed] Title: "${t.title}", Priority: ${t.priority}, Original Deadline: ${t.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A'}, Completed On: ${t.completedAt ? new Date(t.completedAt).toLocaleDateString() : 'N/A'}`)
      .join("\n");
    const prompt = `
You are a smart task manager assistant. Analyze the user's task lists below to answer their question.

Active/Pending Tasks:
${activeTasksSummary || "No active pending tasks."}

Completed Tasks History:
${completedTasksSummary || "No completed tasks yet."}

User Question:
${req.body.question}

Answer the question accurately based on the combined active and completed task data above. Keep your answer clear and concise.
`;

    // 4. Send the updated comprehensive prompt to Gemini
    const response = await askGemini(prompt);

    res.json({
      answer: response
    });
    
  } catch (error) {
    console.error("Chatbot Controller Error:", error);
    res.status(500).json({ answer: "Sorry, I encountered an error processing your tasks." });
  }
};