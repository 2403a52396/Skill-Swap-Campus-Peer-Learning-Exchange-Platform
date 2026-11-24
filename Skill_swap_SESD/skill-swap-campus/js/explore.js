(function () {
  "use strict";
  const app = window.SkillSwap;
  const search = document.getElementById("skill-search");
  if (!search) return;
  const category = document.getElementById("category-filter");
  const level = document.getElementById("level-filter");
  const results = document.getElementById("skill-results");
  const count = document.getElementById("results-count");
  const dialog = document.getElementById("request-dialog");
  const form = document.getElementById("request-form");
  const currentUser = app.currentUser();
  let selectedSkill = null;

  function iconFor(categoryName) {
    const icons = {
      Programming: "fa-code",
      Design: "fa-pen-ruler",
      Communication: "fa-comments",
      Business: "fa-briefcase",
      Languages: "fa-language",
      Other: "fa-lightbulb"
    };
    return icons[categoryName] || icons.Other;
  }

  function cardMarkup(skill, owner) {
    return '<article class="skill-card"><div class="skill-card-top"><span class="category-icon purple"><i class="fa-solid ' + iconFor(skill.category) + '"></i></span><span class="tag">' + app.escape(skill.category) + '</span></div><h2>' + app.escape(skill.title) + '</h2><p class="skill-card-description">' + app.escape(skill.description) + '</p><div class="skill-tags"><span class="level-badge ' + app.escape(skill.level) + '">' + app.escape(skill.level) + '</span><span><i class="fa-solid fa-' + (skill.mode === "Online" ? "wifi" : "location-dot") + '"></i> ' + app.escape(skill.mode) + '</span><span><i class="fa-regular fa-calendar"></i> ' + app.escape(skill.days) + '</span></div><div class="skill-owner"><span class="avatar avatar-blue">' + app.escape(app.initials(owner.fullName)) + '</span><span><strong>' + app.escape(owner.fullName) + '</strong><small>' + app.escape(owner.department) + " · " + app.escape(owner.year) + '</small></span><button class="button button-outline button-small" type="button" data-request-skill="' + app.escape(skill.id) + '">Request</button></div></article>';
  }

  function render() {
    const term = search.value.trim().toLowerCase();
    const matches = app.skills().filter(function (skill) {
      const owner = app.getUser(skill.ownerId);
      if (!owner || skill.ownerId === currentUser.id) return false;
      const haystack = [skill.title, skill.description, skill.category, skill.level, owner.fullName, owner.department].join(" ").toLowerCase();
      return (!term || haystack.includes(term)) && (!category.value || skill.category === category.value) && (!level.value || skill.level === level.value);
    });
    count.textContent = matches.length + (matches.length === 1 ? " skill found" : " skills found");
    if (!matches.length) {
      results.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-magnifying-glass"></i><h3>No skills found</h3><p>Try a different search or clear one of the filters.</p><button class="button button-outline button-small" type="button" data-clear-search>Clear filters</button></div>';
      return;
    }
    results.innerHTML = matches.map(function (skill) { return cardMarkup(skill, app.getUser(skill.ownerId)); }).join("");
  }

  search.addEventListener("input", render);
  category.addEventListener("change", render);
  level.addEventListener("change", render);

  results.addEventListener("click", function (event) {
    if (event.target.closest("[data-clear-search]")) {
      search.value = "";
      category.value = "";
      level.value = "";
      render();
      return;
    }
    const button = event.target.closest("[data-request-skill]");
    if (!button) return;
    const skill = app.skills().find(function (item) { return item.id === button.dataset.requestSkill; });
    if (!skill) return app.notify("This skill post is no longer available.", "error");
    if (skill.ownerId === currentUser.id) return app.notify("You cannot request your own skill post.", "error");
    selectedSkill = skill;
    form.elements.skillId.value = skill.id;
    document.getElementById("request-skill-name").textContent = "Requesting: " + skill.title;
    form.elements.offeredSkill.value = currentUser.skillsTeach && currentUser.skillsTeach.length ? currentUser.skillsTeach[0] : "";
    if (typeof dialog.showModal === "function") dialog.showModal();
    else app.notify("Your browser does not support the request form dialog.", "error");
  });

  dialog.querySelectorAll("[data-close-dialog]").forEach(function (button) {
    button.addEventListener("click", function () { dialog.close(); });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity() || !selectedSkill) return;
    const offeredSkill = form.elements.offeredSkill.value.trim();
    if (!offeredSkill) return app.notify("Tell the student what you can offer in exchange.", "error");
    const allRequests = app.requests();
    const duplicate = allRequests.some(function (request) {
      return request.skillId === selectedSkill.id && request.senderId === currentUser.id && request.status === "Pending";
    });
    if (duplicate) {
      dialog.close();
      app.notify("You already have a pending request for this skill.", "error");
      return;
    }
    allRequests.push({
      id: app.newId("request"),
      skillId: selectedSkill.id,
      senderId: currentUser.id,
      receiverId: selectedSkill.ownerId,
      offeredSkill: offeredSkill,
      status: "Pending",
      createdAt: new Date().toISOString()
    });
    if (!app.saveRequests(allRequests)) return;
    dialog.close();
    form.reset();
    selectedSkill = null;
    app.notify("Your skill exchange request was sent.");
  });

  render();
}());
