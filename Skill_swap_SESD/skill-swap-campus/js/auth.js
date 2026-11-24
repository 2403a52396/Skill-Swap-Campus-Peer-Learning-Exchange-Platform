(function () {
  "use strict";
  const app = window.SkillSwap;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const formMessage = document.getElementById("form-message");

  function showMessage(message, type) {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = "form-message is-visible " + (type === "success" ? "is-success" : "is-error");
  }

  function splitSkills(value) {
    return value.split(",").map(function (skill) { return skill.trim(); }).filter(Boolean);
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!registerForm.reportValidity()) return;
      const data = new FormData(registerForm);
      const email = String(data.get("email")).trim().toLowerCase();
      const password = String(data.get("password"));
      if (!emailPattern.test(email)) return showMessage("Enter a valid college email address.");
      if (password.length < 8) return showMessage("Your password must be at least 8 characters.");
      if (password !== data.get("confirmPassword")) return showMessage("The passwords do not match.");
      const existing = app.users().some(function (user) { return String(user.email).toLowerCase() === email; });
      if (existing) return showMessage("An account already exists for this email. Please log in instead.");
      const user = {
        id: app.newId("student"),
        fullName: String(data.get("fullName")).trim(),
        email: email,
        studentId: String(data.get("studentId")).trim(),
        department: String(data.get("department")),
        year: String(data.get("year")),
        password: password,
        skillsTeach: splitSkills(String(data.get("skillsTeach"))),
        skillsWant: splitSkills(String(data.get("skillsWant"))),
        createdAt: new Date().toISOString()
      };
      if (!user.fullName || !user.studentId || !user.skillsTeach.length || !user.skillsWant.length) {
        return showMessage("Complete every field and include at least one skill in each list.");
      }
      const allUsers = app.users();
      allUsers.push(user);
      if (!app.saveUsers(allUsers)) return showMessage("Your account could not be saved. Check browser storage and try again.");
      try { sessionStorage.setItem("skillSwapFlash", "Account created successfully. Log in to start swapping skills."); } catch (error) { app.notify("Account created, but the sign-in message could not be saved.", "error"); }
      window.location.href = "login.html";
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!loginForm.reportValidity()) return;
      const email = String(new FormData(loginForm).get("email")).trim().toLowerCase();
      const password = String(new FormData(loginForm).get("password"));
      if (!emailPattern.test(email)) return showMessage("Enter a valid email address.");
      const user = app.users().find(function (candidate) {
        return String(candidate.email).toLowerCase() === email && candidate.password === password;
      });
      if (!user) return showMessage("We could not find an account with those credentials. Check your email and password.");
      try {
        sessionStorage.setItem("skillSwapSession", user.id);
        window.location.href = "dashboard.html";
      } catch (error) {
        showMessage("Your browser could not start a sign-in session. Check your privacy settings and try again.");
      }
    });
  }

  document.querySelectorAll("[data-toggle-password]").forEach(function (button) {
    button.addEventListener("click", function () {
      const input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;
      const visible = input.type === "password";
      input.type = visible ? "text" : "password";
      button.setAttribute("aria-label", visible ? "Hide password" : "Show password");
      button.innerHTML = visible ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
    });
  });
}());
