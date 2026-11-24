# Skill Swap Campus – Peer Learning Process

A responsive, frontend-only campus platform where students can teach skills they know in exchange for learning something new. The project uses HTML, CSS and vanilla JavaScript; all application data is stored in the browser.

> **Academic prototype notice:** Authentication and all records are stored in browser storage. This is for demonstration only: it is not secure, does not verify college identities, and must not be used for real accounts, private information or production deployment. A real service needs a trusted backend, secure password hashing, authorization, transport security and privacy controls.

## 1. Problem statement

Students often want practical help that is not part of their formal courses, while other students already have the knowledge to help. Finding peers across departments can be difficult, and paid lessons may not be accessible. The project explores a simple way to discover skills and organize fair, no-money exchanges.

## 2. Objectives

- Let students describe skills they can teach and skills they want to learn.
- Make student skill offers searchable and filterable.
- Support a clear request, accept/decline and completion workflow.
- Provide profiles, activity summaries and a responsive, student-friendly interface.
- Demonstrate client-side persistence without a server or build step.

## 3. Scope

Included: a landing page, registration, login/logout, protected student pages, skill publishing and management, search and filters, exchange requests, profile editing, about information and a contact form. This project is a single-browser prototype; it does not provide real messaging, calendar scheduling, email delivery or multi-device synchronization.

## 4. Functional requirements

1. Register with a name, college email, student ID, department, year, password and skill lists.
2. Reject invalid or duplicate email registrations and mismatched passwords.
3. Log in using a registered email and password; keep the session in `sessionStorage`.
4. Require a signed-in session for dashboard, explore, skill posting, requests and profile pages.
5. View, search and filter campus skill offers by category and experience level.
6. Publish, edit and delete the signed-in student's own offers.
7. Request another student's skill with an offered skill; reject duplicate pending requests.
8. Allow only the skill owner to accept or reject a pending request; allow either participant to complete an accepted exchange.
9. Edit profile details and both skill lists.
10. Save contact form messages in browser storage and display confirmation.

## 5. Non-functional requirements

- Responsive layouts for mobile, tablet and desktop.
- Semantic HTML, labels, accessible status messages and keyboard-focus styling.
- User-provided content is HTML-escaped before it is inserted into generated markup.
- Invalid/missing browser data is handled with safe defaults and visible feedback.
- No framework, package installation, database server or build process is required.

## 6. Hardware and software requirements

- A modern desktop or mobile device with a current browser.
- VS Code (recommended) and the Live Server extension, or any local static HTTP server.
- Internet access is optional for the application logic; Google Fonts and Font Awesome load from CDNs when available.

## 7. Technology stack

- HTML5 for page structure and forms.
- CSS3 for layout, responsiveness, states and visual design.
- Vanilla JavaScript (ES6) for validation, rendering and interactions.
- `localStorage` for users, skills, requests and contact messages.
- `sessionStorage` for the current browser session.
- Google Fonts (DM Sans, Manrope) and Font Awesome icons.

## 8. System architecture

This is a static multi-page frontend. Each HTML page loads the common `js/app.js` helpers and, where needed, a page-specific JavaScript module. The common module seeds sample content on first use, provides safe storage and escaping helpers, renders the shared navigation/footer, and checks session access. Page modules read and update the browser's JSON records. There is no server or database connection.

## 9. Modules

- **Home (`index.html`):** project introduction, process, featured offers, benefits and calls to action.
- **Registration/login:** client-side account validation and session-based sign-in.
- **Dashboard:** summary counts, suggested students, recent activity and quick links.
- **Explore:** searchable/filterable skill cards and exchange-request form.
- **Post a skill:** create, edit and delete offers owned by the current student.
- **Requests:** sent/received views and pending, accepted, rejected and completed status changes.
- **Profile:** editable student details, skills offered and completed exchanges.
- **About/contact:** project overview and objectives, peer-learning benefits, future scope and locally saved contact submissions.

## 10. Browser storage design

| Key | Stored value |
| --- | --- |
| `skillSwapUsers` | Array of student profiles. Prototype records include a demonstration password. |
| `skillSwapSkills` | Array of skill posts with owner ID, title, category, description, level and availability. |
| `skillSwapRequests` | Array of sender/receiver IDs, skill ID, offered skill, status and timestamps. |
| `skillSwapMessages` | Array of contact form submissions. |
| `sessionStorage.skillSwapSession` | Current signed-in user's ID; removed at logout. |

`js/app.js` supplies reusable JSON read/write helpers, ID generation, current-user lookup, authentication protection, HTML escaping, notifications and sample-data initialization. Storage is per browser profile and origin. Reset the prototype by clearing the four `skillSwap*` localStorage keys and `skillSwapSession` from browser developer tools.

### Demo accounts

On first load, sample accounts and skill posts are added to the browser. Use any of these accounts; sample accounts share the same demo password:

| Email | Password | Profile |
| --- | --- | --- |
| `demo@campus.edu` | `Demo123!` | Sam Taylor, Computer Science |
| `riya@campus.edu` | `Demo123!` | Riya Kapoor, Computer Science |
| `arjun@campus.edu` | `Demo123!` | Arjun Mehta, Design & Media |
| `neha@campus.edu` | `Demo123!` | Neha Shah, Business Administration |
| `omar@campus.edu` | `Demo123!` | Omar Ali, Arts & Humanities |

The demo data includes a pending request for Sam and an accepted request Sam sent to Arjun to make the request actions easy to try.

## 11. Advantages

- Makes existing student knowledge easier to discover.
- Encourages reciprocal learning without a fee.
- Provides practice in frontend design, validation, state management and usability.
- Runs as a static site without a complex installation.

## 12. Limitations

- Browser storage is editable, local to one browser and not a secure data store.
- The prototype stores demo passwords in localStorage; never reuse real credentials.
- There is no server-side authorization, identity verification, encryption-at-rest strategy, backup or cross-device synchronization.
- Requests are tracked locally; participants must coordinate outside the app.
- External fonts and icon assets may not load offline.

## 13. Future enhancements

- Add a secure backend and database with hashed passwords and server-side authorization.
- Verify student accounts using institutional identity providers.
- Add messaging, calendar scheduling, notifications, ratings and exchange feedback.
- Add moderation, reporting, privacy controls, accessibility testing and analytics.
- Support cross-device synchronization and formal data retention controls.

## 14. Installation and execution

1. Open the `skill-swap-campus` folder in VS Code.
2. To use Live Server, install the **Live Server** extension if it is not already available.
3. Right-click `index.html` and choose **Open with Live Server**. Alternatively, open `index.html` directly in a modern browser.
4. Choose **Join free** to register, or log in with `demo@campus.edu` / `Demo123!`.
5. Use the dashboard navigation to explore skills, post an offer and manage requests.

No npm install, database setup, API key or build step is required.

## 15. Testing test cases

The checklist below describes the expected manual browser checks. Sample data is added on first run; test registration with a new email address.

| Test | Steps | Expected result |
| --- | --- | --- |
| User registration | Submit all required registration fields with a valid new email and matching password | Account is saved and the login page displays a success notification |
| Duplicate registration | Register again using the same email | Registration is blocked with an explanatory error |
| Invalid login | Enter an unknown email or incorrect password | Error is shown; no signed-in session is created |
| Successful login | Use a registered account or the demo credentials | Dashboard opens and session persists while navigating |
| Dashboard access | Log in and open Dashboard | User name, skill/request counts, recommendations and activity appear |
| Add skill | Publish a complete skill offer | Offer is saved and appears under owned posts and Explore |
| Search skill | Search for a seeded skill name or student | Only matching offers are displayed |
| Filter skills | Choose a category and/or experience level | Results match all selected filters |
| Send exchange request | Request another student's offer with an exchange skill | Request is saved with Pending status and appears in sender/receiver accounts |
| Prevent duplicate request | Send another pending request for the same offer | Duplicate is blocked with a notification |
| Accept request | Log in as the recipient and accept a pending request | Status becomes Accepted |
| Reject request | Log in as the recipient and decline a pending request | Status becomes Rejected |
| Complete exchange | Mark an accepted request complete as either participant | Status becomes Completed and is visible in the profile |
| Edit profile | Change profile details and skills, then save | Profile summary and stored user data are updated |
| Edit/delete skill | Edit a post, save, then delete a post you own | Changes persist; only owner posts have controls |
| Logout | Select Log out | Session is removed and login page opens |
| Unauthorized dashboard access | Log out, then open `dashboard.html` directly | Browser redirects to login |
| Contact form | Submit valid contact details on About & Contact | Confirmation appears and message is saved locally |
| Persistence after refresh | Add/change a record and reload the page | Saved browser data remains available |

## 16. File guide

| File/folder | Purpose |
| --- | --- |
| `index.html` | Public landing page |
| `login.html`, `register.html` | Authentication forms |
| `dashboard.html` | Student overview |
| `explore.html` | Skill search, filters and request dialog |
| `post-skill.html` | Skill post creation and management |
| `requests.html` | Exchange request inbox and status actions |
| `profile.html` | Student profile and profile editor |
| `about.html` | Project information and contact form |
| `css/style.css` | Shared components, landing page, footer and responsive base styles |
| `css/auth.css` | Login and registration styles |
| `css/dashboard.css` | Private app pages, forms, cards, requests and responsive layouts |
| `js/app.js` | Shared storage, demo data, escaping, session, navigation and notifications |
| `js/auth.js` | Registration, login and password visibility toggle |
| `js/dashboard.js` | Dashboard statistics, recommendations and activity |
| `js/explore.js` | Search, filters and skill exchange request creation |
| `js/skills.js` | Skill post create, edit and delete |
| `js/requests.js` | Request filtering and status transitions |
| `js/profile.js` | Profile editing, completed exchanges and contact submissions |
| `assets/images/.gitkeep` | Keeps the requested image-assets folder in the project; the UI uses CSS illustrations and no local image dependency |
