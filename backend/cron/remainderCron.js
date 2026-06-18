const cron = require("node-cron");
const Task = require("../models/Task");
const sendEmail = require("../services/emailService");

// This runs every day at 9:00 AM
cron.schedule("0 9 * * *", async () => {
  try {
    // 1. Find all pending tasks and populate the user details
    const tasks = await Task.find({
      status: "Pending"
    }).populate("user");

    // 2. Normalize "today" to midnight to strip hours/minutes/seconds
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach(async (task) => {
      if (!task.deadline || !task.user || !task.user.email) return;

      // 3. Normalize the task deadline to midnight as well
      const deadlineDate = new Date(task.deadline);
      deadlineDate.setHours(0, 0, 0, 0);

      // 4. Calculate the clean date difference in days
      const timeDiff = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.round(timeDiff / (1000 * 60 * 60 * 24));

      // 5. Trigger email alerts for Day After Tomorrow (2), Tomorrow (1), and Deadline Day (0)
      if (diffDays === 2 || diffDays === 1 || diffDays === 0) {
        let dayLabel = "";
        if (diffDays === 2) dayLabel = "is day after tomorrow";
        if (diffDays === 1) dayLabel = "is tomorrow";
        if (diffDays === 0) dayLabel = "is TODAY";

        try {
          await sendEmail(
            task.user.email,
            `Reminder: Your task "${task.title}" ${dayLabel}!`,
            `Hello, this is a reminder that your task "${task.title}" is due on ${new Date(task.deadline).toLocaleDateString()}. Please complete it soon!`
          );
          console.log(`Reminder email sent to ${task.user.email} for task: ${task.title}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${task.user.email}:`, emailError);
        }
      }
    });
  } catch (error) {
    console.error("Error running the remainder cron job:", error);
  }
});