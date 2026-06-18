import API from "./api";

export const askChatbot = (question, completedHistory = []) => {
  return API.post("/chatbot", {
    question,
    completedTasks: completedHistory // Sending the completed list directly to your backend AI context builder
  });
};