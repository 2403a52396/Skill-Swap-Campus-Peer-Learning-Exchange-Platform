(function () {
  "use strict";
  const app = window.SkillSwap;
  const user = app.currentUser();
  if (!user || !document.getElementById("welcome-name")) return;
  document.getElementById("welcome-name").textContent = user.fullName.split(/\s+/)[0];
  document.getElementById("stat-available").textContent = String(app.skills().length);
  document.getElementById("stat-teach").textContent = String((user.skillsTeach || []).length);
  document.getElementById("stat-learn").textContent = String((user.skillsWant || []).length);
  const involved = app.requests().filter(function (request) { return request.senderId === user.id || request.receiverId === user.id; });
  document.getElementById("stat-pending").textContent = String(involved.filter(function (request) { return request.status === "Pending"; }).length);
  document.getElementById("stat-accepted").textContent = String(involved.filter(function (request) { return request.status === "Accepted"; }).length);

  const recommendations = document.getElementById("recommendations");
  const others = app.users().filter(function (candidate) { return candidate.id !== user.id; });
  const wanted = (user.skillsWant || []).map(function (skill) { return skill.toLowerCase(); });
  const ranked = others.map(function (candidate) {
    const teaching = candidate.skillsTeach || [];
    const matches = teaching.filter(function (skill) {
      return wanted.some(function (want) { return skill.toLowerCase().includes(want) || want.includes(skill.toLowerCase()); });
    });
    return { candidate: candidate, matches: matches };
  }).sort(function (a, b) { return b.matches.length - a.matches.length; }).slice(0, 3);
  if (!ranked.length) {
    recommendations.innerHTML = '<div class="empty-state"><i class="fa-solid fa-user-group"></i><h3>No recommendations yet</h3><p>Check back as more students join the community.</p></div>';
  } else {
    recommendations.innerHTML = ranked.map(function (item) {
      const candidate = item.candidate;
      const skillList = item.matches.length ? item.matches.join(", ") : (candidate.skillsTeach || []).slice(0, 2).join(", ");
      return '<article class="recommendation-card"><span class="avatar avatar-purple">' + app.escape(app.initials(candidate.fullName)) + '</span><div class="recommend-skills"><h3>' + app.escape(candidate.fullName) + '</h3><p>' + app.escape(skillList || candidate.department) + ' · ' + app.escape(candidate.department) + '</p></div><a class="button button-outline button-small" href="explore.html">View skills</a></article>';
    }).join("");
  }

  const activity = document.getElementById("recent-activity");
  const skillItems = app.skills().filter(function (skill) { return skill.ownerId === user.id; }).map(function (skill) {
    return { date: skill.updatedAt || skill.createdAt, text: "You shared " + skill.title, icon: "fa-lightbulb" };
  });
  const requestItems = involved.map(function (request) {
    const skill = app.skills().find(function (item) { return item.id === request.skillId; });
    const other = app.getUser(request.senderId === user.id ? request.receiverId : request.senderId);
    return { date: request.createdAt, text: (request.senderId === user.id ? "You requested " : (other ? other.fullName + " requested " : "A student requested ")) + (skill ? skill.title : "a skill") + " · " + request.status, icon: "fa-handshake" };
  });
  const recent = skillItems.concat(requestItems).filter(function (item) { return item.date; }).sort(function (a, b) { return new Date(b.date) - new Date(a.date); }).slice(0, 5);
  if (!recent.length) {
    activity.innerHTML = '<div class="empty-state"><i class="fa-regular fa-clock"></i><h3>Your activity will show up here</h3><p>Post a skill or send a request to get started.</p></div>';
  } else {
    activity.innerHTML = recent.map(function (item) {
      return '<div class="activity-item"><span class="activity-marker"><i class="fa-solid ' + item.icon + '"></i></span><div><p>' + app.escape(item.text) + '</p><small>' + new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) + '</small></div></div>';
    }).join("");
  }
}());
