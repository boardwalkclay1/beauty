
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector("#navLinks");
  const messageElement = document.querySelector("#message");
  const newMessageButton = document.querySelector("#newMessage");
  const particlesContainer = document.querySelector(".particles");
  const currentYear = document.querySelector("#currentYear");

  // Footer year
  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  // Accessible mobile navigation
  if (menuToggle && navLinks) {
    const closeMenu = () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
      navLinks.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    };

    menuToggle.addEventListener("click", () => {
      const isExpanded =
        menuToggle.getAttribute("aria-expanded") === "true";

      menuToggle.setAttribute("aria-expanded", String(!isExpanded));
      menuToggle.setAttribute(
        "aria-label",
        isExpanded ? "Open navigation menu" : "Close navigation menu"
      );

      navLinks.classList.toggle("is-open", !isExpanded);
      document.body.classList.toggle("menu-open", !isExpanded);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        menuToggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        navLinks.classList.contains("is-open") &&
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        closeMenu();
      }
    });
  }

  // Daily beauty messages
  const messages = [
    "The stars wish they could shine the way you do.",
    "You make ordinary moments feel like magic.",
    "There is something beautiful about the way you see the world.",
    "You deserve kindness, happiness, and all the little things that make you smile.",
    "Your smile could brighten even the cloudiest day.",
    "Never forget how much beauty you bring into the world.",
    "You are a little bit of magic in an ordinary world.",
    "May your day be filled with reasons to smile and dreams worth chasing.",
    "You deserve the same love and kindness you give to others.",
    "Even the smallest things become special when you are part of them.",
    "Your heart is a treasure, and your dreams deserve room to grow.",
    "You do not have to be perfect to be wonderful.",
    "May today bring you a lovely surprise and a beautiful memory.",
    "You are worthy of the gentleness you show everyone else.",
    "The world feels a little brighter when you let your light shine."
  ];

  let lastMessageIndex = 0;

  if (messageElement && newMessageButton) {
    newMessageButton.addEventListener("click", () => {
      let nextIndex;

      do {
        nextIndex = Math.floor(Math.random() * messages.length);
      } while (
        messages.length > 1 &&
        nextIndex === lastMessageIndex
      );

      lastMessageIndex = nextIndex;
      messageElement.textContent = messages[nextIndex];
    });
  }

  // Floating decorative particles
  // Keep the effect lightweight and disable it for reduced-motion users.
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (
    particlesContainer &&
    !reducedMotion.matches
  ) {
    const symbols = ["✧", "♡", "✦", "⋆"];
    const maxParticles = 14;
    let particleTimer;

    const createParticle = () => {
      if (
        document.hidden ||
        particlesContainer.childElementCount >= maxParticles
      ) {
        return;
      }

      const particle = document.createElement("span");
      const duration = 10 + Math.random() * 9;

      particle.className = "particle";
      particle.textContent =
        symbols[Math.floor(Math.random() * symbols.length)];

      particle.setAttribute("aria-hidden", "true");
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.fontSize = `${10 + Math.random() * 13}px`;
      particle.style.animationDuration = `${duration}s`;

      particlesContainer.appendChild(particle);

      particle.addEventListener(
        "animationend",
        () => particle.remove(),
        { once: true }
      );
    };

    const startParticles = () => {
      if (particleTimer) {
        return;
      }

      createParticle();

      particleTimer = window.setInterval(createParticle, 1200);
    };

    const stopParticles = () => {
      if (particleTimer) {
        window.clearInterval(particleTimer);
        particleTimer = undefined;
      }
    };

    startParticles();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopParticles();
      } else {
        startParticles();
      }
    });

    reducedMotion.addEventListener("change", (event) => {
      if (event.matches) {
        stopParticles();
        particlesContainer.replaceChildren();
      } else {
        startParticles();
      }
    });
  }
});
