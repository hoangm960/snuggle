# Snuggle - Use-Case Specification

Version 1.1

---

## Revision History

| Date | Version | Description | Author |
|------|---------|--------------|--------|
| 20/03/2026 | 1.0 | Initial draft of use-case specification | Le Thi Que My, Hoang Nhat Minh, Huynh Nhat Huyen, Mai Le Khanh Trinh |
| 30/3/2026 | 1.1 | Add use-cases | Que My |

---

## Table of Contents

1. [Use-case Model](#1-use-case-model)
2. [Use-case Specifications](#2-use-case-specifications)
   - [2.1 Shared Use Cases](#21-shared-use-cases)
   - [2.2 Visitors (Potential Adopters)](#22-visitors-potential-adopters)
   - [2.3 Admin](#23-admin)

---

## 1. Use-case Model

There are two main views for 2 different users for this website: the Admin managing the website, database, .etc, and the visitors (potential adopters and animal shelters) who browse the web and use its services.

---

## 2. Use-case Specifications

### 2.1 Shared Use Cases

#### 2.1.1 Sign Up

| Use case Name | Register New Account |
|---|---|
| Brief description | This use case outlines how a first-time user (either a Visitor or an Admin) creates a new account on the platform using either an email/password combination or a third-party SSO provider (Google/Facebook). |
| Actors | Unregistered Visitor, Admin |
| Basic Flow | See below |
| Alternative Flows | See below |
| Pre-conditions | The user is on the platform but does not currently have an active session or account. |
| Post-conditions | A new user profile is successfully created in the database, and the user is ready to verify their email. |

**Basic Flow:**
1. User clicks the "Sign Up" button on the landing page.
2. System displays the registration modal with options: "Continue with Google," "Continue with Facebook," or "Sign up with Email."
3. User selects "Sign up with Email" and inputs their email and a secure password.
4. User agrees to the platform's Terms of Service and Privacy Policy.
5. User submits the form.
6. System validates the input data format and checks the database to ensure the email is not already registered.
7. System creates a new user record in the database with a default "Visitor" role (Admin roles must be manually elevated by a super-admin later).
8. System sends a verification link to the user's email.
9. System navigates the user to a "Check Your Email" confirmation view.

**Alternative Flows:**
- **Alternative flow 1: Email already exists.** At step 6, the system detects the email is already in the database. The system halts the process and displays a prompt: "An account with this email already exists. Would you like to log in instead?"
- **Alternative flow 2: User uses SSO (Google/Facebook).** At step 3, the user selects an SSO option. The system pings the third-party API, retrieves the user's authenticated email, and skips directly to step 7, bypassing password creation entirely.

---

#### 2.1.2 Log In

| Use case Name | Authenticate Existing Account (Log In) |
|---|---|
| Brief description | This use case describes how an existing user securely accesses their account and gets routed to the correct dashboard based on their Role-Based Access Control (RBAC) permissions. |
| Actors | Registered Visitor (Potential Owner), Admin |
| Basic Flow | See below |
| Alternative Flows | See below |
| Pre-conditions | The user has already completed the Registration use case |
| Post-conditions | The user is actively logged into a secure session and lands on the correct, role-specific view. |

**Basic Flow:**
1. User clicks the "Log In" button.
2. User enters their registered email and password (or selects their SSO provider).
3. User clicks "Submit."
4. System verifies the credentials against the database.
5. System generates a secure session token for the user.
6. System checks the user's assigned role (Admin vs. Visitor).
7. System automatically routes the user: Visitors go to the "Matchmaking Feed," and Admins go to the "Backend Dashboard."

**Alternative Flows:**
- **Alternative flow 1: Incorrect credentials.** At step 4, the system fails to verify the password. The system clears the password field and displays a red error message: "Incorrect email or password. Try again or click 'Forgot Password'."
- **Alternative flow 2: Account not verified.** At step 4, the credentials are correct, but the system flags the account as unverified. The system routes the user to a "Please verify your email" screen and offers a "Resend Link" button.

---

#### 2.1.3 Log Out

| Use case Name | Terminate Secure Session (Log Out) |
|---|---|
| Brief description | This use case describes how an authenticated user (Admin or Visitor) securely ends their current session, invalidates their access tokens, and is redirected back to the public landing page. |
| Actors | Registered Visitor (Potential Owner), Admin |
| Basic Flow | See below |
| Alternative Flows | See below |
| Pre-conditions | The user must be successfully authenticated and have an active session token. |
| Post-conditions | The session token is no longer valid; the user can no longer access protected "Admin" or "Visitor" routes without re-authenticating. |

**Basic Flow:**
1. User clicks the "Log Out" button (usually found in the Profile menu or Sidebar).
2. System prompts for confirmation or immediately initiates the teardown.
3. System sends a request to the server to invalidate the current session token/JWT.
4. System clears all local session data (Cookies, Local Storage, or Session Storage).
5. System redirects the user to the public "Landing Page" or "Login" screen.
6. System displays a brief success toast message: "Logged out successfully."

**Alternative Flows:**
- **Alternative: Session Timeout (Passive Log Out)** The user remains inactive for a pre-defined period (e.g., 30 minutes). The system automatically triggers the token invalidation. The system redirects the user to the Login page with a message: "Session expired for your security. Please log in again."

---

### 2.2 Visitors (Potential Adopters)

#### Group 1: Search & Discovery

##### 2.2.1.1 View match recommendations

| Use case Name | View match recommendations |
|---|---|
| Brief description | This use case describes how the Potential Adopter views pets suggested by the matching engine. |
| Actors | Potential Owner |
| Basic Flow | See below |
| Alternative Flows | See below |
| Pre-conditions | User is logged in and has completed the compatibility questionnaires |
| Post-conditions | User has viewed recommended pet profiles and the system records user interaction for future recommendations |

**Basic Flow:**
1. User navigates to the "Matches" tab.
2. System retrieves pet profiles that score > 70% compatibility.
3. User views a list of recommended pets.
4. User clicks a pet to see the full profile (health, vaccination status, etc.)

**Alternative Flows:**
- **Alternative flow 1: No matches found** At step 2, the system finds no pets meeting the compatibility threshold. The system displays a message: "No suitable matches found." The user may update preferences or questionnaire. Return to step 2.
- **Alternative flow 2: User not eligible for matching** At step 1, the system detects the user has not completed the questionnaire. The system prompts the user to complete the questionnaire. After completion, return to step 1.

---

##### 2.2.1.2 Smart Search Filter

| Use case Name | Filter & Discover Pets |
|---|---|
| Brief description | Visitors refine their search using specific parameters and location data to find the most compatible pets nearby. |
| Actors | Visitor |
| Basic Flow | See below |
| Alternative Flows | See below |
| Pre-conditions | System has access to the pet database and user's location. |
| Post-conditions | Visitor views a curated list of relevant pet profiles. |

**Basic Flow:**
1. Visitor enters the "Discover" feed.
2. Visitor selects filters: Breed, Age Range, Size, and Vaccination Status.
3. Visitor enables GPS location access.
4. System calculates distance between Visitor and Shelter using the Haversine formula or a Map API.
5. System returns a sorted list of pets meeting all criteria within the selected radius.

**Alternative Flows:**
- **Alternative Flow: No results found**: System suggests broadening the search radius or notifies the user to save the search for future alerts.

---

##### 2.2.1.3 Utility Map

| Use case Name | Locate Nearby Pet Resources |
|---|---|
| Brief description | Users find essential pet services (vers, parks, shops) on an interactive map. |
| Actors | Visitor |
| Basic Flow | See below |
| Alternative Flows | |
| Pre-conditions | |
| Post-conditions | Visitor can navigate to the chosen facility via external map apps. |

**Basic Flow:**
1. Visitor toggles to "Map View" in the Utility section.
2. System fetches points of interest (POIs) based on the user's coordinates.
3. Visitor filters by category (e.g., "Emergency Vets").
4. Visitor clicks a pin to see hours, ratings, and contact info.

---

##### 2.2.1.4 Push Notification System

| Use case Name | Receive Real-time Alerts |
|---|---|
| Brief description | The system proactively alerts users about status updates or new matches |
| Actors | Visitor, Admin |
| Basic Flow | See below |
| Alternative Flows | |
| Pre-conditions | |
| Post-conditions | User engagement increases through timely updates. |

**Basic Flow:**
1. System detects a "Trigger Event" (e.g., a new pet matches a user's saved search).
2. System generates a notification payload.
3. System pushes the alert to the user's device (mobile or web).
4. User clicks the notification and is routed directly to the relevant page.

---

#### Group 2: Trust & Security

##### 2.2.2.1 Verify Identity (eKYC)

| Use case Name | Complete Identity Verification |
|---|---|
| Brief description | To prevent animal abuse or fraud, the Visitor must verify their identity using a government ID and a "liveness" check before they can apply for adoption. |
| Actors | Visitor, External KYC Provider (API) |
| Basic Flow | See below |
| Alternative Flows | See below |
| Pre-conditions | Visitor is logged in |
| Post-conditions | Visitor is granted the "Verified Adopter" status, unlocking the "Apply for Adoption" feature |

**Basic Flow:**
1. Visitor navigates to "Profile Settings" and clicks "Verify Identity."
2. System prompts the user to upload a photo of a valid Government ID (Passport/ID Card).
3. System initiates a "liveness check" (the user takes a real-time selfie/video).
4. System sends data to the KYC provider for OCR and face-matching.
5. System receives a "Verified" status and updates the user's profile with a "Verified Badge."

**Alternative Flows:**
- **Failed Verification**: If the ID is expired or the face doesn't match, the system notifies the user and allows two more attempts before locking the feature.

---

##### 2.2.2.2 Electronic Health Records (EHR)

| Use case Name | Access Pet Medical History |
|---|---|
| Brief description | Provides a transparent look at a pet's health journey, including vaccinations and past treatments. |
| Actors | Visitor, Admin |
| Basic Flow | See below |
| Alternative Flows | |
| Pre-conditions | |
| Post-conditions | Adopter has full transparency regarding the pet's physical condition. |

**Basic Flow:**
1. Visitor clicks "Health Records" on a Pet Profile.
2. System retrieves a chronological log of medical events.
3. Visitor views specific details (e.g., vaccine batch numbers, vet names).
4. Visitor downloads a PDF summary for personal records.

---

##### 2.2.2.3 Digital Adoption Contract

| Use case Name | Sign Legal Adoption Agreement |
|---|---|
| Brief description | A secure, digital-first way to handle the legal transfer of pet ownership. |
| Actors | Visitor, Admin |
| Basic Flow | See below |
| Alternative Flows | |
| Pre-conditions | |
| Post-conditions | The adoption is legally binding, and the pet's status is archived as "Adopted." |

**Basic Flow:**
1. Admin triggers "Generate Contract" for an approved application.
2. System populates a template with the Adopter's and Pet's data.
3. Both parties sign the document electronically.
4. System stores a hash of the contract on the server (or blockchain for immutability) and sends copies to both parties.

---

##### 2.2.2.4 Rating & Review System

| Use case Name | Rate Shelter Credibility |
|---|---|
| Brief description | Users leave feedback to ensure accountability and build community trust. |
| Actors | Visitor |
| Basic Flow | See below |
| Alternative Flows | |
| Pre-conditions | |
| Post-conditions | The rating becomes public, helping other adopters make informed choices. |

**Basic Flow:**
1. After a finalized interaction, the Visitor is prompted to "Rate your Experience."
2. Visitor submits a star rating and written review.
3. System aggregates the score and updates the Shelter's "Trust Index."

---

#### Group 3: Communication & Support

##### 2.2.3.1 Real-time chat system

| Use case Name | Message caregivers |
|---|---|
| Brief description | Instant communication to bridge the gap between interest and adoption |
| Actors | Visitor, Admin |
| Basic Flow | See below |
| Alternative Flows | |
| Pre-conditions | Visitor logged in |
| Post-conditions | Questions are answered quickly, speeding up the adoption funnel. |

**Basic Flow:**
1. Visitor clicks "Chat" on a Pet Profile.
2. System opens a real-time WebSocket connection.
3. Visitor and Admin exchange messages and media.
4. System saves the transcript for Admin audit logs.

---

##### 2.2.3.2 Expert Advice/ AI chatbot

| Use case Name | Consult AI Care Assistant |
|---|---|
| Brief description | An AI-powered bot provides instant answers to common pet care questions. |
| Actors | Visitor |
| Basic Flow | See below |
| Alternative Flows | |
| Pre-conditions | |
| Post-conditions | Visitor receives instant support without waiting for an Admin. |

**Basic Flow:**
1. Visitor opens the "Help" bot.
2. Visitor asks a question (e.g., "What's the adopting process?").
3. System uses RAG (Retrieval-Augmented Generation) to pull from a verified knowledge base.
4. System provides a concise, expert-backed answer and links to relevant medical records if applicable.

---

#### Group 4: Community & Sustenance

##### 2.2.4.1 Post-Adoption Journal

| Use case Name | Share Life Updates |
|---|---|
| Brief description | New owners post updates to show the shelter that the pet is happy and healthy. |
| Actors | Visitor (New Owner), Admin |
| Basic Flow | See below |
| Alternative Flows | |
| Pre-conditions | |
| Post-conditions | Continuous welfare monitoring and community engagement. |

**Basic Flow:**
1. Owner navigates to "My Pets" -> "Journal."
2. Owner uploads a photo and a short update (e.g., "Luna's first week home!").
3. System posts the update to the pet's public/private timeline.
4. System notifies the original shelter.

---

### 2.3 Admin

#### 2.3.1 Dashboard

| Use case Name | Access Admin Command Center (Dashboard) |
|---|---|
| Brief description | The Admin logs in to view a high-level analytical overview of the platform's health, including adoption conversion rates, shelter capacity, and urgent alerts (e.g., medical emergencies or pending eKYC reviews). |
| Actors | Admin |
| Basic Flow | See below |
| Alternative Flows | See below |
| Pre-conditions | Admin is authenticated and logged into the Admin dashboard. The system has an active connection to the analytics engine/database. |
| Post-conditions | The system logs the dashboard access for security auditing. |

**Basic Flow:**
1. Admin logs into the system.
2. System authenticates the Admin and redirects to the Dashboard.
3. System fetches real-time data from Cloud Firestore (e.g., total pets, pending eKYC requests, adoption success rates).
4. Admin views data visualizations (charts/graphs) of platform activity.

**Alternative Flows:**
- **Alternative Flow 1: Low-Data State (New System)** If the database has fewer than 10 entries, the system hides complex charts. System displays a "Getting Started" checklist instead (e.g., "Add your first pet," "Verify a partner").
- **Alternative Flow 2: Critical Alert Trigger** System detects a "Critical" status (e.g., a pet marked with "Emergency Medical Need"). The system highlights the Dashboard in red and pins the emergency profile at the top of the "Urgent Tasks" rail.

---

#### 2.3.2 Manage Pet Profile Management

| Use case Name | Manage Pet Profiles |
|---|---|
| Brief description | The Admin creates, updates, archives, or deletes pet profiles in the database so visitors see accurate, up-to-date availability |
| Actors | Admin |
| Basic Flow | See below |
| Alternative Flows | See below |
| Pre-conditions | Admin is authenticated and logged into the Admin dashboard. |
| Post-conditions | The database reflects the most current pet inventory and updates the front-end dynamically. |

**Basic Flow:**
1. Admin navigates to the "Pet Management" dashboard.
2. Admin clicks "Add New Pet" or selects an existing pet profile to edit.
3. Admin inputs/updates data (photos, behavioral quirks, medical history, personality tags,...).
4. Admin submits the form.
5. System validates the inputs and updates the database.
6. System pushes the new/updated profile live to the matching engine.

**Alternative Flows:**
- **Alternative flow 1: Missing critical data.** The system detects missing mandatory fields (e.g., rabies vaccination status). The system blocks submission, highlights the missing fields in red, and the Admin must complete them before resubmitting.
- **Alternative flow 2: Pet gets adopted.** Admin changes status from "Available" to "Adopted." The system automatically hides the profile from the Visitor discovery feed.

---

#### 2.3.3 User Management

| Use case Name | Manage User Accounts |
|---|---|
| Brief description | This use case describes how the Admin monitors, edits, or deactivates user accounts (both Potential Owners and other Admins) to maintain platform integrity and security. |
| Actors | Admin |
| Basic Flow | See below |
| Alternative Flows | See below |
| Pre-conditions | User is logged in and has completed the compatibility questionnaires |
| Post-conditions | User has viewed recommended pet profiles and the system records user interaction for future recommendations |

**Basic Flow:**
1. Admin navigates to the "User Management" section of the Admin Dashboard.
2. System retrieves and displays a searchable list of all registered users (Name, Email, Role, Account Status).
3. Admin uses the search bar or filters to locate a specific user account.
4. Admin selects a user to view their full profile and activity history.
5. Admin performs an action: Updates user role (e.g., promoting a Visitor to Admin) or changes Account Status (e.g., Suspend/Activate).
6. Admin clicks "Save Changes."
7. System validates the changes and updates the database record.
8. System logs the administrative action for auditing purposes.

**Alternative Flows:**
- **Alternative flow 1: Search returns no results.** At step 3, if the Admin enters a keyword that doesn't match any user, the system displays: "No users found matching those criteria." Admin can reset filters or try a different search term.
- **Alternative flow 2: Self-Deactivation protection.** At step 5, if the Admin attempts to deactivate their account or remove their Admin privileges, the system displays the error: "Action Denied: You cannot modify your own administrative status."
- **Alternative flow 3: Account Suspension.** Admin sets status to "Suspended." The system immediately terminates any active sessions for that user and prevents them from logging in until the status is restored.

---

#### 2.3.4 Moderate Identity Verifications (eKYC)

| Use case Name | Review & Approve Adopter Identity |
|---|---|
| Brief description | Admin manually reviews flagged or pending eKYC submissions to ensure the platform remains a "safe zone" from bad actors. |
| Actors | Admin |
| Basic Flow | See below |
| Alternative Flows | See below |
| Pre-conditions | User has completed the initial eKYC submission |
| Post-conditions | User is either granted adoption privileges or blocked from the platform. |

**Basic Flow:**
1. Admin navigates to the "Verification Queue" on the Dashboard.
2. System displays a list of users who have uploaded their ID and completed the liveness check.
3. Admin reviews the side-by-side comparison (ID photo vs. Selfie).
4. Admin clicks "Approve" (granting the Verified badge) or "Reject" (requesting better lighting/clearer ID).
5. System logs the decision and triggers a Push Notification to the user.

**Alternative Flows:**
- **Fraud Detection**: If the Admin suspects a fake ID, they click "Blacklist User." The system permanently bans the hardware ID/IP of that device.

---

#### 2.3.5 Real-time Chat System

| Use case Name | Audit AI & Real-time Chat |
|---|---|
| Brief description | Admin monitors AI chatbot performance and audits real-time chat transcripts between shelters and adopters to ensure professional conduct and safety. |
| Actors | Admin |
| Basic Flow | See below |
| Alternative Flows | See below |
| Pre-conditions | Chat/AI interactions are being logged in Firestore. |
| Post-conditions | Communication quality and safety standards are maintained |

**Basic Flow:**
1. Admin accesses the "Communication Logs" section.
2. Admin views transcripts of AI bot interactions to check for accuracy in "Expert Advice".
3. Admin reviews flagged chat messages between users for potential abuse or policy violations.
4. Admin updates the AI bot's knowledge base or intervenes in a chat if necessary.

**Alternative Flows:**
- **Bot Error**: Admin identifies the AI is giving incorrect medical advice and manually overrides the response.

---

#### 2.3.6 Digital Adoption Contract

| Use case Name | Review & Execute Adoption Contracts |
|---|---|
| Brief description | Admin manages the generation and storage of legally binding adoption agreements to ensure accountability for the pet's welfare. |
| Actors | Admin |
| Basic Flow | See below |
| Alternative Flows | |
| Pre-conditions | Both parties (Shelter and Adopter) have agreed to the adoption terms |
| Post-conditions | A legally binding document is secured, ensuring long-term animal welfare |

**Basic Flow:**
1. Admin navigates to "Adoption Contracts."
2. Admin selects a pending adoption case.
3. Admin triggers the "Digital Contract Service" to generate a PDF based on the user's verified identity and pet data.
4. Admin reviews the contract and sends it to the adopter for an electronic signature.
5. System stores the signed PDF in Firebase Storage and logs the completion.

---

#### 2.3.7 Post Management

| Use case Name | Moderate Post-Adoption Journal |
|---|---|
| Brief description | The Admin monitors updates shared by new owners in the Post-Adoption Journal to ensure content is appropriate and to track the ongoing welfare of adopted pets. |
| Actors | Admin |
| Basic Flow | See below |
| Alternative Flows | See below |
| Pre-conditions | Admin is authenticated and logged into the Admin dashboard. |
| Post-conditions | The public journal feed reflects the moderated entries, and inappropriate content is removed. |

**Basic Flow:**
1. Admin navigates to the "Post Management" section of the dashboard.
2. System retrieves a feed of recent journal updates (photos, text, and pet IDs).
3. Admin reviews the content for community guideline compliance.
4. Admin selects a post to "Approve," "Highlight" (for the public feed), or "Delete."
5. System updates the post status in the database and logs the administrative action

**Alternative Flows:**
- **Inappropriate Content**: If a post contains prohibited material, the Admin deletes it and the system sends a notification to the user explaining the removal.

---

#### 2.3.8 Health Record Management

| Use case Name | Manage Pet Medical Histories |
|---|---|
| Brief description | Admin creates and updates Electronic Health Records (EHR) for pets to provide transparent medical backgrounds for potential adopters. |
| Actors | Admin |
| Basic Flow | See below |
| Alternative Flows | See below |
| Pre-conditions | Admin is authenticated; pet profile already exists in the database. |
| Post-conditions | The pet's public profile is updated with the latest medical transparency for visitors. |

**Basic Flow:**
1. Admin navigates to the "Health Record Management" module.
2. Admin selects a specific pet profile to update.
3. Admin clicks "Add Health Record" and inputs data (e.g., vaccine type, date, vet name, batch number).
4. Admin uploads supporting documentation (scanned PDFs) to the record.
5. Admin clicks "Save Changes."
6. System validates the input and updates the pet's chronological medical log.

**Alternative Flows:**
- **Missing Critical Data**: If mandatory fields like vaccination status are missing, the system blocks submission and highlights the required fields.

---

#### 2.3.9 Rate & Review Management

| Use case Name | Moderate Shelter Ratings & Reviews |
|---|---|
| Brief description | Admin reviews user-submitted feedback to maintain the integrity of the "Trust Index" and prevent spam or fraudulent reviews. |
| Actors | Admin |
| Basic Flow | See below |
| Alternative Flows | See below |
| Pre-conditions | Admin is authenticated and logged in. |
| Post-conditions | The public rating for the shelter is updated, ensuring informed choices for other adopters. |

**Basic Flow:**
1. Admin navigates to the "Rate & Review Management" section.
2. System displays a list of recent reviews, including star ratings and written feedback.
3. Admin reviews flagged reports or low-star ratings.
4. Admin performs an action: "Confirm Review," "Remove Review," or "Request Clarification."
5. System recalculates the Shelter's aggregate "Trust Index" score based on the moderated data.

**Alternative Flows:**
- **Spam Detection**: If multiple reviews originate from the same IP/Device for the same shelter, the Admin can blacklist the hardware ID.