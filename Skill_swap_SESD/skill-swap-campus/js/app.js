(function () {
  "use strict";

  const KEYS = {
    users: "skillSwapUsers",
    skills: "skillSwapSkills",
    requests: "skillSwapRequests",
    messages: "skillSwapMessages"
  };
  const SESSION_KEY = "skillSwapSession";

  function ensureToastRegion() {
    let region = document.querySelector(".toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "toast-region";
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-atomic", "false");
      document.body.appendChild(region);
    }
    return region;
  }

  function notify(message, type) {
    const region = ensureToastRegion();
    const toast = document.createElement("div");
    toast.className = "toast" + (type === "error" ? " error" : "");
    const icon = document.createElement("i");
    icon.className = type === "error" ? "fa-solid fa-circle-exclamation" : "fa-solid fa-circle-check";
    const text = document.createElement("span");
    text.textContent = String(message);
    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Dismiss notification");
    close.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    close.addEventListener("click", function () { toast.remove(); });
    toast.append(icon, text, close);
    region.appendChild(toast);
    window.setTimeout(function () { toast.remove(); }, 5200);
  }

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const value = JSON.parse(raw);
      if (Array.isArray(fallback) && !Array.isArray(value)) throw new Error("Stored data is not a list.");
      if (fallback && typeof fallback === "object" && !Array.isArray(fallback) && (value === null || typeof value !== "object" || Array.isArray(value))) {
        throw new Error("Stored data has an invalid shape.");
      }
      return value;
    } catch (error) {
      notify("Some saved browser data could not be read. You can continue, but that data may need to be cleared.", "error");
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      notify("Your changes could not be saved in this browser. Check available storage and try again.", "error");
      return false;
    }
  }

  function safeText(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function newId(prefix) {
    const id = window.crypto && typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2);
    return (prefix || "id") + "_" + id;
  }

  function users() { return read(KEYS.users, []); }
  function skills() { return read(KEYS.skills, []); }
  function requests() { return read(KEYS.requests, []); }
  function saveUsers(value) { return write(KEYS.users, value); }
  function saveSkills(value) { return write(KEYS.skills, value); }
  function saveRequests(value) { return write(KEYS.requests, value); }
  function messages() { return read(KEYS.messages, []); }
  function saveMessages(value) { return write(KEYS.messages, value); }

  function currentUser() {
    try {
      const id = sessionStorage.getItem(SESSION_KEY);
      if (!id) return null;
      return users().find(function (user) { return user.id === id; }) || null;
    } catch (error) {
      notify("The sign-in session could not be read. Please log in again.", "error");
      return null;
    }
  }

  function requireAuth() {
    if (document.body.dataset.private === "true" && !currentUser()) {
      window.location.replace("login.html");
      return false;
    }
    return true;
  }

  function getUser(id) {
    return users().find(function (user) { return user.id === id; }) || null;
  }

  function initials(name) {
    return String(name || "Student").trim().split(/\s+/).slice(0, 2).map(function (part) {
      return part.charAt(0).toUpperCase();
    }).join("") || "S";
  }

  function seedData() {
    const has = function (key) { return localStorage.getItem(key) !== null; };
    const demo = { id: "student_demo", fullName: "Sam Taylor", email: "demo@campus.edu", studentId: "DEMO-2025", department: "Computer Science", year: "3rd Year", password: "Demo123!", skillsTeach: ["JavaScript", "HTML & CSS", "Git basics"], skillsWant: ["Figma", "Public speaking"], createdAt: "2026-01-15T10:00:00.000Z" };
    const students = [
      demo,
      { id: "student_riya", fullName: "Riya Kapoor", email: "riya@campus.edu", studentId: "CS-2104", department: "Computer Science", year: "2nd Year", password: "Demo123!", skillsTeach: ["Python", "Data visualization"], skillsWant: ["UI design"], createdAt: "2026-02-01T10:00:00.000Z" },
      { id: "student_arjun", fullName: "Arjun Mehta", email: "arjun@campus.edu", studentId: "DES-1182", department: "Design & Media", year: "3rd Year", password: "Demo123!", skillsTeach: ["Figma", "UI design"], skillsWant: ["JavaScript"], createdAt: "2026-02-04T10:00:00.000Z" },
      { id: "student_neha", fullName: "Neha Shah", email: "neha@campus.edu", studentId: "BUS-0908", department: "Business Administration", year: "2nd Year", password: "Demo123!", skillsTeach: ["Public speaking", "Presentation design"], skillsWant: ["Python"], createdAt: "2026-02-08T10:00:00.000Z" },
      { id: "student_omar", fullName: "Omar Ali", email: "omar@campus.edu", studentId: "LAN-3501", department: "Arts & Humanities", year: "4th Year", password: "Demo123!", skillsTeach: ["Conversational French"], skillsWant: ["Excel"], createdAt: "2026-02-12T10:00:00.000Z" }
    ];
    const sampleSkills = [
      { id: "skill_demo_js", ownerId: "student_demo", title: "JavaScript fundamentals", category: "Programming", description: "Get comfortable with variables, functions and DOM basics by building a small interactive page.", level: "Beginner", mode: "Either", days: "Tue / Thu", time: "After 4 PM", exchangeSkill: "Figma basics", createdAt: "2026-03-10T10:00:00.000Z" },
      { id: "skill_riya_python", ownerId: "student_riya", title: "Python for your first project", category: "Programming", description: "Learn Python essentials and create a small project together, even if this is your first time coding.", level: "Beginner", mode: "Offline", days: "Weekends", time: "11 AM - 2 PM", exchangeSkill: "UI design", createdAt: "2026-03-12T10:00:00.000Z" },
      { id: "skill_arjun_figma", ownerId: "student_arjun", title: "Designing clean interfaces in Figma", category: "Design", description: "Turn a rough idea into a polished wireframe and clickable prototype. Bring a project idea or follow along.", level: "Intermediate", mode: "Either", days: "Mon / Wed", time: "After 3 PM", exchangeSkill: "JavaScript basics", createdAt: "2026-03-14T10:00:00.000Z" },
      { id: "skill_neha_talk", ownerId: "student_neha", title: "Confident public speaking", category: "Communication", description: "Practice structuring a talk, speaking with confidence and giving useful presentation feedback.", level: "Beginner", mode: "Offline", days: "Fridays", time: "1 PM - 4 PM", exchangeSkill: "Python basics", createdAt: "2026-03-16T10:00:00.000Z" },
      { id: "skill_omar_french", ownerId: "student_omar", title: "Conversational French", category: "Languages", description: "Friendly conversation practice for everyday situations, pronunciation and useful phrases.", level: "Intermediate", mode: "Online", days: "Tue / Sat", time: "Flexible evenings", exchangeSkill: "Excel", createdAt: "2026-03-18T10:00:00.000Z" },
      { id: "skill_riya_data", ownerId: "student_riya", title: "Make sense of data with Python", category: "Business", description: "Explore a small dataset, create clear charts and practice explaining what the numbers mean.", level: "Advanced", mode: "Online", days: "Wednesday", time: "After 5 PM", exchangeSkill: "Presentation skills", createdAt: "2026-03-20T10:00:00.000Z" }
    ];
    const sampleRequests = [
      { id: "request_sample_received", skillId: "skill_demo_js", senderId: "student_riya", receiverId: "student_demo", offeredSkill: "Python basics", status: "Pending", createdAt: "2026-03-22T11:00:00.000Z" },
      { id: "request_sample_accepted", skillId: "skill_arjun_figma", senderId: "student_demo", receiverId: "student_arjun", offeredSkill: "JavaScript fundamentals", status: "Accepted", createdAt: "2026-03-21T11:00:00.000Z" }
    ];
    try {
      if (!has(KEYS.users)) write(KEYS.users, students);
      if (!has(KEYS.skills)) write(KEYS.skills, sampleSkills);
      if (!has(KEYS.requests)) write(KEYS.requests, sampleRequests);
      if (!has(KEYS.messages)) write(KEYS.messages, []);
    } catch (error) {
      notify("Browser storage is unavailable. The app can open, but saved data may not persist.", "error");
    }
  }

  function renderHeader() {
    const target = document.getElementById("site-header");
    if (!target) return;
    const user = currentUser();
    const pathname = window.location.pathname.split("/").pop() || "index.html";
    const nav = user
      ? [
          ["dashboard.html", "Dashboard"], ["explore.html", "Explore"], ["post-skill.html", "Share a skill"], ["requests.html", "Requests"]
        ]
      : [["index.html", "Home"], ["index.html#how-it-works", "How it works"], ["about.html", "About"]];
    const navHtml = nav.map(function (item) {
      const isActive = item[0].split("#")[0] === pathname && item[0].split("#")[0] !== "index.html";
      return '<li><a href="' + item[0] + '"' + (isActive ? ' class="active" aria-current="page"' : "") + ">" + item[1] + "</a></li>";
    }).join("");
    const actions = user
      ? '<span class="nav-user"><span class="avatar avatar-purple">' + safeText(initials(user.fullName)) + "</span>" + safeText(user.fullName.split(/\s+/)[0]) + '</span><a class="button button-outline button-small" href="profile.html"><i class="fa-regular fa-user"></i> Profile</a><button class="button button-primary button-small" type="button" data-logout>Log out</button>'
      : '<a class="button button-quiet button-small" href="login.html">Log in</a><a class="button button-primary button-small" href="register.html">Join free <i class="fa-solid fa-arrow-right"></i></a>';
    target.innerHTML = '<header class="site-header"><div class="container nav-bar"><a class="brand" href="index.html" aria-label="Skill Swap Campus home"><span class="brand-mark"><i class="fa-solid fa-arrows-rotate"></i></span><span>Skill Swap <em>Campus</em></span></a><button class="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><i class="fa-solid fa-bars"></i></button><ul class="nav-links">' + navHtml + '</ul><div class="nav-actions">' + actions + "</div></div></header>";
  }

  function renderFooter() {
    const target = document.getElementById("site-footer");
    if (!target) return;
    target.innerHTML = '<footer class="site-footer"><div class="container"><div class="footer-main"><div><a class="brand footer-brand" href="index.html"><span class="brand-mark"><i class="fa-solid fa-arrows-rotate"></i></span><span>Skill Swap <em>Campus</em></span></a><p class="footer-copy">A student-powered community for sharing knowledge, discovering skills and learning together.</p></div><div class="footer-links"><div><h3>Explore</h3><a href="index.html#how-it-works">How it works</a><a href="about.html">About the project</a><a href="explore.html">Explore skills</a></div><div><h3>Get started</h3><a href="register.html">Create an account</a><a href="login.html">Log in</a><a href="about.html#contact">Contact us</a></div></div></div><div class="footer-bottom"><p>© 2026 Skill Swap Campus · Student project prototype</p><p>Learn together. Grow together.</p></div></div></footer>';
  }

  seedData();
  renderHeader();
  renderFooter();
  requireAuth();

  document.addEventListener("click", function (event) {
    const logout = event.target.closest("[data-logout]");
    if (logout) {
      try { sessionStorage.removeItem(SESSION_KEY); } catch (error) { notify("Could not clear the sign-in session.", "error"); }
      window.location.href = "login.html";
      return;
    }
    const toggle = event.target.closest(".nav-toggle");
    if (toggle) {
      const links = document.querySelector(".nav-links");
      const open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      toggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    }
    if (event.target.closest(".nav-links a")) {
      const links = document.querySelector(".nav-links");
      if (links) links.classList.remove("is-open");
    }
  });

  try {
    const flash = sessionStorage.getItem("skillSwapFlash");
    if (flash) {
      sessionStorage.removeItem("skillSwapFlash");
      notify(flash);
    }
  } catch (error) {
    notify("A one-time message could not be read from this browser session.", "error");
  }

  window.SkillSwap = {
    KEYS: KEYS,
    read: read,
    write: write,
    users: users,
    skills: skills,
    requests: requests,
    messages: messages,
    saveUsers: saveUsers,
    saveSkills: saveSkills,
    saveRequests: saveRequests,
    saveMessages: saveMessages,
    currentUser: currentUser,
    getUser: getUser,
    requireAuth: requireAuth,
    notify: notify,
    escape: safeText,
    newId: newId,
    initials: initials
  };
}());
