(function () {
  "use strict";
  const app = window.SkillSwap;
  const user = app.currentUser();
  const list = document.getElementById("request-list");
  if (!list || !user) return;
  let activeTab = "all";

  function displayDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function requestCard(request) {
    const sender = app.getUser(request.senderId);
    const receiver = app.getUser(request.receiverId);
    const skill = app.skills().find(function (item) { return item.id === request.skillId; });
    const isReceiver = request.receiverId === user.id;
    const other = isReceiver ? sender : receiver;
    const personName = other ? other.fullName : "Former student";
    const secondLine = other ? other.department + " · " + other.year : "Student profile unavailable";
    const canRespond = isReceiver && request.status === "Pending";
    const canComplete = (request.senderId === user.id || request.receiverId === user.id) && request.status === "Accepted";
    const actions = canRespond
      ? '<div class="request-actions"><button class="button button-primary button-small" type="button" data-request-action="Accepted" data-request-id="' + app.escape(request.id) + '"><i class="fa-solid fa-check"></i> Accept</button><button class="button button-danger button-small" type="button" data-request-action="Rejected" data-request-id="' + app.escape(request.id) + '">Decline</button></div>'
      : (canComplete ? '<div class="request-actions"><button class="button button-outline button-small" type="button" data-request-action="Completed" data-request-id="' + app.escape(request.id) + '"><i class="fa-solid fa-check-double"></i> Mark complete</button></div>' : "");
    return '<article class="request-card"><div class="request-card-top"><div class="request-person"><span class="avatar avatar-blue">' + app.escape(app.initials(personName)) + '</span><div><h3>' + app.escape(isReceiver ? "Request from " + personName : "Request to " + personName) + '</h3><p>' + app.escape(secondLine) + '</p></div></div><span class="status-badge status-' + app.escape(request.status) + '">' + app.escape(request.status) + '</span></div><div class="exchange-details"><div><span>Requested skill</span><strong>' + app.escape(skill ? skill.title : "Skill post no longer available") + '</strong></div><div><span>Offered in exchange</span><strong>' + app.escape(request.offeredSkill || "Not specified") + '</strong></div></div><div class="request-meta"><span>' + (isReceiver ? "Sender: " + app.escape(sender ? sender.fullName : "Unavailable") + " · Receiver: you" : "Sender: you · Receiver: " + app.escape(receiver ? receiver.fullName : "Unavailable")) + " · " + displayDate(request.createdAt) + '</span>' + actions + '</div></article>';
  }

  function render() {
    const all = app.requests().filter(function (request) { return request.senderId === user.id || request.receiverId === user.id; });
    const received = all.filter(function (request) { return request.receiverId === user.id; });
    const sent = all.filter(function (request) { return request.senderId === user.id; });
    document.getElementById("count-all").textContent = String(all.length);
    document.getElementById("count-received").textContent = String(received.length);
    document.getElementById("count-sent").textContent = String(sent.length);
    const filtered = activeTab === "received" ? received : (activeTab === "sent" ? sent : all);
    const sorted = filtered.slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    list.innerHTML = sorted.length
      ? sorted.map(requestCard).join("")
      : '<div class="empty-state"><i class="fa-regular fa-paper-plane"></i><h3>No ' + (activeTab === "all" ? "" : activeTab + " ") + 'requests yet</h3><p>Browse skills and send a thoughtful exchange offer to get started.</p><a class="button button-primary button-small" href="explore.html">Explore skills</a></div>';
  }

  document.querySelectorAll("[data-request-tab]").forEach(function (button) {
    button.addEventListener("click", function () {
      activeTab = button.dataset.requestTab;
      document.querySelectorAll("[data-request-tab]").forEach(function (tab) { tab.classList.toggle("active", tab === button); });
      render();
    });
  });

  list.addEventListener("click", function (event) {
    const button = event.target.closest("[data-request-action]");
    if (!button) return;
    const requestId = button.dataset.requestId;
    const nextStatus = button.dataset.requestAction;
    const all = app.requests();
    const request = all.find(function (item) { return item.id === requestId; });
    if (!request || (request.senderId !== user.id && request.receiverId !== user.id)) return app.notify("This exchange request is not available to your account.", "error");
    const allowed = (nextStatus === "Accepted" || nextStatus === "Rejected")
      ? request.receiverId === user.id && request.status === "Pending"
      : nextStatus === "Completed" && request.status === "Accepted";
    if (!allowed) return app.notify("That request status cannot be changed by this account.", "error");
    request.status = nextStatus;
    request.updatedAt = new Date().toISOString();
    if (app.saveRequests(all)) {
      render();
      app.notify(nextStatus === "Accepted" ? "Request accepted. Coordinate a time with your peer." : nextStatus === "Rejected" ? "Request declined." : "Exchange marked as completed.");
    }
  });

  render();
}());
