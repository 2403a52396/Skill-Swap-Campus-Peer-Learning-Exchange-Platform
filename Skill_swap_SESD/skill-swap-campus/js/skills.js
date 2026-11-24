(function () {
  "use strict";
  const app = window.SkillSwap;
  const form = document.getElementById("skill-form");
  if (!form) return;
  const user = app.currentUser();
  const message = document.getElementById("skill-message");
  const list = document.getElementById("my-skills-list");
  const title = document.getElementById("skill-form-title");
  const submit = document.getElementById("skill-submit");

  function showMessage(text, kind) {
    message.textContent = text;
    message.className = "form-message is-visible " + (kind === "success" ? "is-success" : "is-error");
  }

  function renderOwned() {
    const owned = app.skills().filter(function (skill) { return skill.ownerId === user.id; });
    if (!owned.length) {
      list.innerHTML = '<div class="empty-state"><i class="fa-regular fa-lightbulb"></i><h3>You have not shared a skill yet</h3><p>Post your first offer and invite someone to learn with you.</p></div>';
      return;
    }
    list.innerHTML = owned.map(function (skill) {
      return '<article class="owned-skill"><div><h3>' + app.escape(skill.title) + '</h3><p>' + app.escape(skill.category) + ' · ' + app.escape(skill.level) + ' · ' + app.escape(skill.mode) + '</p></div><div class="owned-actions"><button class="button button-outline button-small" type="button" data-edit-skill="' + app.escape(skill.id) + '"><i class="fa-regular fa-pen-to-square"></i> Edit</button><button class="button button-danger button-small" type="button" data-delete-skill="' + app.escape(skill.id) + '"><i class="fa-regular fa-trash-can"></i> Delete</button></div></article>';
    }).join("");
  }

  function clearForm() {
    form.reset();
    form.elements.skillId.value = "";
    title.textContent = "Share a skill";
    submit.innerHTML = 'Publish skill <i class="fa-solid fa-arrow-right"></i>';
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const payload = {
      title: String(data.get("title")).trim(),
      category: String(data.get("category")),
      description: String(data.get("description")).trim(),
      level: String(data.get("level")),
      mode: String(data.get("mode")),
      days: String(data.get("days")).trim(),
      time: String(data.get("time")).trim(),
      exchangeSkill: String(data.get("exchangeSkill")).trim()
    };
    if (Object.keys(payload).some(function (key) { return !payload[key]; })) return showMessage("Please complete every field before publishing.", "error");
    const allSkills = app.skills();
    const editingId = String(data.get("skillId") || "");
    if (editingId) {
      const index = allSkills.findIndex(function (skill) { return skill.id === editingId && skill.ownerId === user.id; });
      if (index < 0) return showMessage("That skill post is no longer available to edit.", "error");
      allSkills[index] = Object.assign({}, allSkills[index], payload, { updatedAt: new Date().toISOString() });
    } else {
      allSkills.unshift(Object.assign({ id: app.newId("skill"), ownerId: user.id, createdAt: new Date().toISOString() }, payload));
    }
    if (!app.saveSkills(allSkills)) return;
    const wasEditing = Boolean(editingId);
    clearForm();
    renderOwned();
    showMessage(wasEditing ? "Your skill post has been updated." : "Your skill is now available to other students.", "success");
    if (!wasEditing) document.querySelector(".my-skills-section").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  list.addEventListener("click", function (event) {
    const edit = event.target.closest("[data-edit-skill]");
    if (edit) {
      const skill = app.skills().find(function (item) { return item.id === edit.dataset.editSkill && item.ownerId === user.id; });
      if (!skill) return app.notify("You can only edit your own skill posts.", "error");
      form.elements.skillId.value = skill.id;
      form.elements.title.value = skill.title;
      form.elements.category.value = skill.category;
      form.elements.description.value = skill.description;
      form.elements.level.value = skill.level;
      form.elements.mode.value = skill.mode;
      form.elements.days.value = skill.days;
      form.elements.time.value = skill.time;
      form.elements.exchangeSkill.value = skill.exchangeSkill;
      title.textContent = "Edit your skill";
      submit.innerHTML = 'Save changes <i class="fa-solid fa-check"></i>';
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const remove = event.target.closest("[data-delete-skill]");
    if (!remove) return;
    const skillId = remove.dataset.deleteSkill;
    const skill = app.skills().find(function (item) { return item.id === skillId && item.ownerId === user.id; });
    if (!skill) return app.notify("You can only delete your own skill posts.", "error");
    if (!window.confirm('Delete "' + skill.title + '"? Existing exchange requests will remain in your request history.')) return;
    const remaining = app.skills().filter(function (item) { return item.id !== skillId; });
    if (app.saveSkills(remaining)) {
      renderOwned();
      if (form.elements.skillId.value === skillId) clearForm();
      app.notify("Skill post deleted.");
    }
  });

  renderOwned();
}());
