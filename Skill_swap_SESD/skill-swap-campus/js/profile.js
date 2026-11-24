(function () {
  "use strict";
  const app = window.SkillSwap;
  const profileForm = document.getElementById("profile-form");
  const user = app.currentUser();

  function showMessage(element, text, success) {
    if (!element) return;
    element.textContent = text;
    element.className = "form-message is-visible " + (success ? "is-success" : "is-error");
  }

  function renderProfile() {
    if (!profileForm || !user) return;
    const current = app.getUser(user.id);
    if (!current) return;
    document.getElementById("profile-avatar").textContent = app.initials(current.fullName);
    document.getElementById("profile-name").textContent = current.fullName;
    document.getElementById("profile-department").textContent = current.department;
    document.getElementById("profile-email").textContent = current.email;
    document.getElementById("profile-year").textContent = current.year;
    document.getElementById("profile-student-id").textContent = current.studentId;
    profileForm.elements.fullName.value = current.fullName;
    profileForm.elements.department.value = current.department;
    profileForm.elements.year.value = current.year;
    profileForm.elements.studentId.value = current.studentId;
    profileForm.elements.skillsTeach.value = (current.skillsTeach || []).join(", ");
    profileForm.elements.skillsWant.value = (current.skillsWant || []).join(", ");

    const skillsTarget = document.getElementById("profile-skills");
    const mySkills = app.skills().filter(function (skill) { return skill.ownerId === current.id; });
    skillsTarget.innerHTML = mySkills.length
      ? mySkills.map(function (skill) { return '<div class="profile-skill-row"><div><strong>' + app.escape(skill.title) + '</strong><small>' + app.escape(skill.category) + ' · ' + app.escape(skill.level) + '</small></div><span class="tag">' + app.escape(skill.mode) + '</span></div>'; }).join("")
      : '<p class="empty-inline">You have not published any skill posts yet.</p>';

    const completedTarget = document.getElementById("completed-exchanges");
    const completed = app.requests().filter(function (request) {
      return request.status === "Completed" && (request.senderId === current.id || request.receiverId === current.id);
    });
    completedTarget.innerHTML = completed.length
      ? completed.map(function (request) {
          const other = app.getUser(request.senderId === current.id ? request.receiverId : request.senderId);
          const skill = app.skills().find(function (item) { return item.id === request.skillId; });
          return '<div class="completed-row"><div><strong>' + app.escape(skill ? skill.title : "Skill exchange") + '</strong><small>With ' + app.escape(other ? other.fullName : "former student") + '</small></div><span class="status-badge status-Completed">Completed</span></div>';
        }).join("")
      : '<p class="empty-inline">Completed exchanges will appear here.</p>';
  }

  if (profileForm && user) {
    const profileMessage = document.getElementById("profile-message");
    profileForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!profileForm.reportValidity()) return;
      const data = new FormData(profileForm);
      const updated = Object.assign({}, app.getUser(user.id), {
        fullName: String(data.get("fullName")).trim(),
        department: String(data.get("department")),
        year: String(data.get("year")),
        studentId: String(data.get("studentId")).trim(),
        skillsTeach: String(data.get("skillsTeach")).split(",").map(function (skill) { return skill.trim(); }).filter(Boolean),
        skillsWant: String(data.get("skillsWant")).split(",").map(function (skill) { return skill.trim(); }).filter(Boolean),
        updatedAt: new Date().toISOString()
      });
      if (!updated.fullName || !updated.studentId || !updated.skillsTeach.length || !updated.skillsWant.length) {
        return showMessage(profileMessage, "Add at least one skill you can teach and one you want to learn.", false);
      }
      const allUsers = app.users().map(function (item) { return item.id === updated.id ? updated : item; });
      if (!app.saveUsers(allUsers)) return;
      showMessage(profileMessage, "Your profile has been updated.", true);
      renderProfile();
      app.notify("Profile saved.");
    });
    renderProfile();
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const contactMessage = document.getElementById("contact-message");
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      const data = new FormData(contactForm);
      const email = String(data.get("email")).trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMessage(contactMessage, "Enter a valid email address.", false);
      const item = {
        id: app.newId("message"),
        name: String(data.get("name")).trim(),
        email: email,
        subject: String(data.get("subject")).trim(),
        message: String(data.get("message")).trim(),
        createdAt: new Date().toISOString()
      };
      if (!item.name || !item.subject || !item.message) return showMessage(contactMessage, "Please complete all contact form fields.", false);
      const allMessages = app.messages();
      allMessages.push(item);
      if (!app.saveMessages(allMessages)) return showMessage(contactMessage, "Your message could not be saved in this browser.", false);
      contactForm.reset();
      showMessage(contactMessage, "Thanks for your message. It has been saved in this browser prototype.", true);
    });
  }
}());
