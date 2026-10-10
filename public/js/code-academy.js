
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.textContent = isOpen ? "✕ Close" : "☰ Menu";
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰ Menu";
      });
    });
  }

  // Copy lesson code to the clipboard
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const codeElement = document.getElementById(button.dataset.copy);
      if (!codeElement) return;

      const originalText = button.textContent;

      try {
        await navigator.clipboard.writeText(codeElement.textContent);
        button.textContent = "Copied!";
      } catch {
        // Fallback for browsers that do not allow clipboard access.
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(codeElement);
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = "Select and copy";
      }

      window.setTimeout(() => {
        button.textContent = originalText;
      }, 1800);
    });
  });

  // Course progress is based on opened lessons and answered mini-quizzes.
  const progressItems = [
    ...document.querySelectorAll(".lesson-detail[data-progress]"),
    ...document.querySelectorAll("[data-mini-quiz]")
  ];

  const progressBar = document.getElementById("courseProgressBar");
  const progressTrack = document.getElementById("courseProgress");
  const progressText = document.getElementById("courseProgressText");
  const progressHint = document.getElementById("courseProgressHint");

  function updateCourseProgress() {
    if (!progressItems.length) return;

    const completed = progressItems.filter((item) => {
      if (item.matches("details")) return item.open;
      return item.dataset.answered === "true";
    }).length;

    const percent = Math.round((completed / progressItems.length) * 100);

    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${percent}% explored`;
    if (progressTrack) progressTrack.setAttribute("aria-valuenow", String(percent));

    if (progressHint) {
      if (percent === 100) {
        progressHint.textContent = "Excellent work! You've explored every lesson and answered every practice question.";
      } else {
        progressHint.textContent = `${completed} of ${progressItems.length} lesson topics and practice questions explored.`;
      }
    }
  }

  document.querySelectorAll(".lesson-detail[data-progress]").forEach((details) => {
    details.addEventListener("toggle", updateCourseProgress);
  });

  // Short quizzes at the end of each lesson.
  document.querySelectorAll("[data-mini-quiz]").forEach((quiz) => {
    const correctAnswer = quiz.dataset.answer;
    const buttons = quiz.querySelectorAll("[data-option]");
    const feedback = quiz.querySelector(".feedback");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        // Each mini-quiz can be answered once; refresh the page to retry.
        if (quiz.dataset.answered === "true") return;

        const isCorrect = button.dataset.option === correctAnswer;
        quiz.dataset.answered = "true";

        buttons.forEach((choice) => {
          choice.disabled = true;

          if (choice.dataset.option === correctAnswer) {
            choice.classList.add("correct");
          } else if (choice === button && !isCorrect) {
            choice.classList.add("incorrect");
          }
        });

        if (feedback) {
          feedback.textContent = isCorrect
            ? "Correct! Great job — you've got it."
            : "Not quite. The correct answer is highlighted. Read the lesson and keep learning!";
          feedback.classList.add(isCorrect ? "good" : "bad");
        }

        updateCourseProgress();
      });
    });
  });

  // Interactive playground: change the displayed message and button color.
  const messageInput = document.getElementById("playgroundMessage");
  const colorSelect = document.getElementById("playgroundColor");
  const applyButton = document.getElementById("applyPlayground");
  const messageOutput = document.getElementById("playgroundMessageOutput");
  const actionButton = document.getElementById("playgroundAction");
  const feedbackOutput = document.getElementById("playgroundFeedback");
  const previewHeading = document.getElementById("playgroundHeading");

  const validColors = ["purple", "pink", "blue", "green"];

  function updatePlayground() {
    if (!messageInput || !colorSelect || !messageOutput || !actionButton) return;

    const message = messageInput.value.trim();
    messageOutput.textContent = message || "Your message will appear here.";
    actionButton.classList.remove("color-pink", "color-blue", "color-green");

    const selectedColor = validColors.includes(colorSelect.value)
      ? colorSelect.value
      : "purple";

    if (selectedColor !== "purple") {
      actionButton.classList.add(`color-${selectedColor}`);
    }

    if (feedbackOutput) feedbackOutput.textContent = "";
    if (previewHeading) previewHeading.textContent = "Hello, World!";
  }

  if (applyButton) {
    applyButton.addEventListener("click", updatePlayground);
  }

  if (messageInput) {
    messageInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") updatePlayground();
    });
  }

  if (actionButton) {
    actionButton.addEventListener("click", () => {
      if (feedbackOutput) {
        feedbackOutput.textContent = "Button clicked! JavaScript is working.";
      }
    });
  }

  // Set up the initial playground state.
  updatePlayground();
  updateCourseProgress();
});
