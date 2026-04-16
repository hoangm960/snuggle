# Snuggle - System Specification

Version 1.3

## Table of Contents

1. [Use Cases](#1-use-cases)
    - [1.1 Use-case Model](#11-use-case-model)
    - [1.2 Use-case Specifications](#12-use-case-specifications)
        - [1.2.1 Shared Use Cases](#121-shared-use-cases)
        - [1.2.2 Visitors (Potential Adopters)](#122-visitors-potential-adopters)
        - [1.2.3 Admin](#123-admin)
2. [Database Schema](#2-database-schema)
3. [API Reference](#3-api-reference)
4. [Testing](#4-testing)

---

## 1. Use Cases

### 1.1 Use-case Model

There are two main views for 2 different users for this website: the Admin managing the website, database, .etc, and the visitors (potential adopters and animal shelters) who browse the web and use its services.

---

### 1.2 Use-case Specifications

#### 1.2.1 Shared Use Cases

##### 1.2.1.1 Sign Up

| Use case Name     | Register New Account                                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brief description | This use case outlines how a first-time user (either a Visitor or an Admin) creates a new account on the platform using either an email/password combination or a third-party SSO provider (Google/Facebook). |
| Actors            | Unregistered Visitor, Admin                                                                                                                                                                                   |
| Basic Flow        | See below                                                                                                                                                                                                     |
| Alternative Flows | See below                                                                                                                                                                                                     |
| Pre-conditions    | The user is on the platform but does not currently have an active session or account.                                                                                                                         |
| Post-conditions   | A new user profile is successfully created in the database, and the user is ready to verify their email.                                                                                                      |

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

##### 1.2.1.2 Log In

| Use case Name     | Authenticate Existing Account (Log In)                                                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brief description | This use case describes how an existing user securely accesses their account and gets routed to the correct dashboard based on their Role-Based Access Control (RBAC) permissions. |
| Actors            | Registered Visitor (Potential Owner), Admin                                                                                                                                        |
| Basic Flow        | See below                                                                                                                                                                          |
| Alternative Flows | See below                                                                                                                                                                          |
| Pre-conditions    | The user has already completed the Registration use case                                                                                                                           |
| Post-conditions   | The user is actively logged into a secure session and lands on the correct, role-specific view.                                                                                    |

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

##### 1.2.1.3 Log Out

| Use case Name     | Terminate Secure Session (Log Out)                                                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brief description | This use case describes how an authenticated user (Admin or Visitor) securely ends their current session, invalidates their access tokens, and is redirected back to the public landing page. |
| Actors            | Registered Visitor (Potential Owner), Admin                                                                                                                                                   |
| Basic Flow        | See below                                                                                                                                                                                     |
| Alternative Flows | See below                                                                                                                                                                                     |
| Pre-conditions    | The user must be successfully authenticated and have an active session token.                                                                                                                 |
| Post-conditions   | The session token is no longer valid; the user can no longer access protected "Admin" or "Visitor" routes without re-authenticating.                                                          |

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

### 1.2.2 Visitors (Potential Adopters)

#### Search & Discovery

##### 1.2.2.1 View match recommendations

| Use case Name     | View match recommendations                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| Brief description | This use case describes how the Potential Adopter views pets suggested by the matching engine.              |
| Actors            | Potential Owner                                                                                             |
| Basic Flow        | See below                                                                                                   |
| Alternative Flows | See below                                                                                                   |
| Pre-conditions    | User is logged in and has completed the compatibility questionnaires                                        |
| Post-conditions   | User has viewed recommended pet profiles and the system records user interaction for future recommendations |

**Basic Flow:**

1. User navigates to the "Matches" tab.
2. System retrieves pet profiles that score > 70% compatibility.
3. User views a list of recommended pets.
4. User clicks a pet to see the full profile (health, vaccination status, etc.)

**Alternative Flows:**

- **Alternative flow 1: No matches found** At step 2, the system finds no pets meeting the compatibility threshold. The system displays a message: "No suitable matches found." The user may update preferences or questionnaire. Return to step 2.
- **Alternative flow 2: User not eligible for matching** At step 1, the system detects the user has not completed the questionnaire. The system prompts the user to complete the questionnaire. After completion, return to step 1.

---

##### 1.2.2.2 Smart Search Filter

| Use case Name     | Filter & Discover Pets                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| Brief description | Visitors refine their search using specific parameters and location data to find the most compatible pets nearby. |
| Actors            | Visitor                                                                                                           |
| Basic Flow        | See below                                                                                                         |
| Alternative Flows | See below                                                                                                         |
| Pre-conditions    | System has access to the pet database and user's location.                                                        |
| Post-conditions   | Visitor views a curated list of relevant pet profiles.                                                            |

**Basic Flow:**

1. Visitor enters the "Discover" feed.
2. Visitor selects filters: Breed, Age Range, Size, and Vaccination Status.
3. Visitor enables GPS location access.
4. System calculates distance between Visitor and Shelter using the Haversine formula or a Map API.
5. System returns a sorted list of pets meeting all criteria within the selected radius.

**Alternative Flows:**

- **Alternative Flow: No results found**: System suggests broadening the search radius or notifies the user to save the search for future alerts.

---

##### 1.2.2.3 Utility Map

| Use case Name     | Locate Nearby Pet Resources                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| Brief description | Users find essential pet services (vers, parks, shops) on an interactive map. |
| Actors            | Visitor                                                                       |
| Basic Flow        | See below                                                                     |
| Alternative Flows |                                                                               |
| Pre-conditions    |                                                                               |
| Post-conditions   | Visitor can navigate to the chosen facility via external map apps.            |

**Basic Flow:**

1. Visitor toggles to "Map View" in the Utility section.
2. System fetches points of interest (POIs) based on the user's coordinates.
3. Visitor filters by category (e.g., "Emergency Vets").
4. Visitor clicks a pin to see hours, ratings, and contact info.

---

##### 1.2.2.4 Push Notification System

| Use case Name     | Receive Real-time Alerts                                                |
| ----------------- | ----------------------------------------------------------------------- |
| Brief description | The system proactively alerts users about status updates or new matches |
| Actors            | Visitor, Admin                                                          |
| Basic Flow        | See below                                                               |
| Alternative Flows |                                                                         |
| Pre-conditions    |                                                                         |
| Post-conditions   | User engagement increases through timely updates.                       |

**Basic Flow:**

1. System detects a "Trigger Event" (e.g., a new pet matches a user's saved search).
2. System generates a notification payload.
3. System pushes the alert to the user's device (mobile or web).
4. User clicks the notification and is routed directly to the relevant page.

---

#### Trust & Security

##### 1.2.2.5 Verify Identity (eKYC)

| Use case Name     | Complete Identity Verification                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brief description | To prevent animal abuse or fraud, the Visitor must verify their identity using a government ID and a "liveness" check before they can apply for adoption. |
| Actors            | Visitor, External KYC Provider (API)                                                                                                                      |
| Basic Flow        | See below                                                                                                                                                 |
| Alternative Flows | See below                                                                                                                                                 |
| Pre-conditions    | Visitor is logged in                                                                                                                                      |
| Post-conditions   | Visitor is granted the "Verified Adopter" status, unlocking the "Apply for Adoption" feature                                                              |

**Basic Flow:**

1. Visitor navigates to "Profile Settings" and clicks "Verify Identity."
2. System prompts the user to upload a photo of a valid Government ID (Passport/ID Card).
3. System initiates a "liveness check" (the user takes a real-time selfie/video).
4. System sends data to the KYC provider for OCR and face-matching.
5. System receives a "Verified" status and updates the user's profile with a "Verified Badge."

**Alternative Flows:**

- **Failed Verification**: If the ID is expired or the face doesn't match, the system notifies the user and allows two more attempts before locking the feature.

---

##### 1.2.2.6 Electronic Health Records (EHR)

| Use case Name     | Access Pet Medical History                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Brief description | Provides a transparent look at a pet's health journey, including vaccinations and past treatments. |
| Actors            | Visitor, Admin                                                                                     |
| Basic Flow        | See below                                                                                          |
| Alternative Flows |                                                                                                    |
| Pre-conditions    |                                                                                                    |
| Post-conditions   | Adopter has full transparency regarding the pet's physical condition.                              |

**Basic Flow:**

1. Visitor clicks "Health Records" on a Pet Profile.
2. System retrieves a chronological log of medical events.
3. Visitor views specific details (e.g., vaccine batch numbers, vet names).
4. Visitor downloads a PDF summary for personal records.

---

##### 1.2.2.7 Digital Adoption Contract

| Use case Name     | Sign Legal Adoption Agreement                                                   |
| ----------------- | ------------------------------------------------------------------------------- |
| Brief description | A secure, digital-first way to handle the legal transfer of pet ownership.      |
| Actors            | Visitor, Admin                                                                  |
| Basic Flow        | See below                                                                       |
| Alternative Flows |                                                                                 |
| Pre-conditions    |                                                                                 |
| Post-conditions   | The adoption is legally binding, and the pet's status is archived as "Adopted." |

**Basic Flow:**

1. Admin triggers "Generate Contract" for an approved application.
2. System populates a template with the Adopter's and Pet's data.
3. Both parties sign the document electronically.
4. System stores a hash of the contract on the server (or blockchain for immutability) and sends copies to both parties.

---

##### 1.2.2.8 Rating & Review System

| Use case Name     | Rate Shelter Credibility                                                 |
| ----------------- | ------------------------------------------------------------------------ |
| Brief description | Users leave feedback to ensure accountability and build community trust. |
| Actors            | Visitor                                                                  |
| Basic Flow        | See below                                                                |
| Alternative Flows |                                                                          |
| Pre-conditions    |                                                                          |
| Post-conditions   | The rating becomes public, helping other adopters make informed choices. |

**Basic Flow:**

1. After a finalized interaction, the Visitor is prompted to "Rate your Experience."
2. Visitor submits a star rating and written review.
3. System aggregates the score and updates the Shelter's "Trust Index."

---

#### Communication & Support

##### 1.2.2.9 Real-time chat system

| Use case Name     | Message caregivers                                                    |
| ----------------- | --------------------------------------------------------------------- |
| Brief description | Instant communication to bridge the gap between interest and adoption |
| Actors            | Visitor, Admin                                                        |
| Basic Flow        | See below                                                             |
| Alternative Flows |                                                                       |
| Pre-conditions    | Visitor logged in                                                     |
| Post-conditions   | Questions are answered quickly, speeding up the adoption funnel.      |

**Basic Flow:**

1. Visitor clicks "Chat" on a Pet Profile.
2. System opens a real-time WebSocket connection.
3. Visitor and Admin exchange messages and media.
4. System saves the transcript for Admin audit logs.

---

##### 1.2.2.10 Expert Advice/ AI chatbot

| Use case Name     | Consult AI Care Assistant                                                |
| ----------------- | ------------------------------------------------------------------------ |
| Brief description | An AI-powered bot provides instant answers to common pet care questions. |
| Actors            | Visitor                                                                  |
| Basic Flow        | See below                                                                |
| Alternative Flows |                                                                          |
| Pre-conditions    |                                                                          |
| Post-conditions   | Visitor receives instant support without waiting for an Admin.           |

**Basic Flow:**

1. Visitor opens the "Help" bot.
2. Visitor asks a question (e.g., "What's the adopting process?").
3. System uses RAG (Retrieval-Augmented Generation) to pull from a verified knowledge base.
4. System provides a concise, expert-backed answer and links to relevant medical records if applicable.

---

#### Community & Sustenance

##### 1.2.2.11 Post-Adoption Journal

| Use case Name     | Share Life Updates                                                             |
| ----------------- | ------------------------------------------------------------------------------ |
| Brief description | New owners post updates to show the shelter that the pet is happy and healthy. |
| Actors            | Visitor (New Owner), Admin                                                     |
| Basic Flow        | See below                                                                      |
| Alternative Flows |                                                                                |
| Pre-conditions    |                                                                                |
| Post-conditions   | Continuous welfare monitoring and community engagement.                        |

**Basic Flow:**

1. Owner navigates to "My Pets" -> "Journal."
2. Owner uploads a photo and a short update (e.g., "Luna's first week home!").
3. System posts the update to the pet's public/private timeline.
4. System notifies the original shelter.

---

### 1.2.3 Admin

#### 1.2.3.1 Dashboard

| Use case Name     | Access Admin Command Center (Dashboard)                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Brief description | The Admin logs in to view a high-level analytical overview of the platform's health, including adoption conversion rates, shelter capacity, and urgent alerts (e.g., medical emergencies or pending eKYC reviews). |
| Actors            | Admin                                                                                                                                                                                                              |
| Basic Flow        | See below                                                                                                                                                                                                          |
| Alternative Flows | See below                                                                                                                                                                                                          |
| Pre-conditions    | Admin is authenticated and logged into the Admin dashboard. The system has an active connection to the analytics engine/database.                                                                                  |
| Post-conditions   | The system logs the dashboard access for security auditing.                                                                                                                                                        |

**Basic Flow:**

1. Admin logs into the system.
2. System authenticates the Admin and redirects to the Dashboard.
3. System fetches real-time data from Cloud Firestore (e.g., total pets, pending eKYC requests, adoption success rates).
4. Admin views data visualizations (charts/graphs) of platform activity.

**Alternative Flows:**

- **Alternative Flow 1: Low-Data State (New System)** If the database has fewer than 10 entries, the system hides complex charts. System displays a "Getting Started" checklist instead (e.g., "Add your first pet," "Verify a partner").
- **Alternative Flow 2: Critical Alert Trigger** System detects a "Critical" status (e.g., a pet marked with "Emergency Medical Need"). The system highlights the Dashboard in red and pins the emergency profile at the top of the "Urgent Tasks" rail.

---

#### 1.2.3.2 Manage Pet Profiles

| Use case Name     | Manage Pet Profiles                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Brief description | The Admin creates, updates, archives, or deletes pet profiles in the database so visitors see accurate, up-to-date availability |
| Actors            | Admin                                                                                                                           |
| Basic Flow        | See below                                                                                                                       |
| Alternative Flows | See below                                                                                                                       |
| Pre-conditions    | Admin is authenticated and logged into the Admin dashboard.                                                                     |
| Post-conditions   | The database reflects the most current pet inventory and updates the front-end dynamically.                                     |

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

#### 1.2.3.3 User Management

| Use case Name     | Manage User Accounts                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brief description | This use case describes how the Admin monitors, edits, or deactivates user accounts (both Potential Owners and other Admins) to maintain platform integrity and security. |
| Actors            | Admin                                                                                                                                                                     |
| Basic Flow        | See below                                                                                                                                                                 |
| Alternative Flows | See below                                                                                                                                                                 |
| Pre-conditions    | User is logged in and has completed the compatibility questionnaires                                                                                                      |
| Post-conditions   | User has viewed recommended pet profiles and the system records user interaction for future recommendations                                                               |

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

#### 1.2.3.4 Moderate Identity Verifications (eKYC)

| Use case Name     | Review & Approve Adopter Identity                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Brief description | Admin manually reviews flagged or pending eKYC submissions to ensure the platform remains a "safe zone" from bad actors. |
| Actors            | Admin                                                                                                                    |
| Basic Flow        | See below                                                                                                                |
| Alternative Flows | See below                                                                                                                |
| Pre-conditions    | User has completed the initial eKYC submission                                                                           |
| Post-conditions   | User is either granted adoption privileges or blocked from the platform.                                                 |

**Basic Flow:**

1. Admin navigates to the "Verification Queue" on the Dashboard.
2. System displays a list of users who have uploaded their ID and completed the liveness check.
3. Admin reviews the side-by-side comparison (ID photo vs. Selfie).
4. Admin clicks "Approve" (granting the Verified badge) or "Reject" (requesting better lighting/clearer ID).
5. System logs the decision and triggers a Push Notification to the user.

**Alternative Flows:**

- **Fraud Detection**: If the Admin suspects a fake ID, they click "Blacklist User." The system permanently bans the hardware ID/IP of that device.

---

#### 1.2.3.5 Real-time Chat System

| Use case Name     | Audit AI & Real-time Chat                                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brief description | Admin monitors AI chatbot performance and audits real-time chat transcripts between shelters and adopters to ensure professional conduct and safety. |
| Actors            | Admin                                                                                                                                                |
| Basic Flow        | See below                                                                                                                                            |
| Alternative Flows | See below                                                                                                                                            |
| Pre-conditions    | Chat/AI interactions are being logged in Firestore.                                                                                                  |
| Post-conditions   | Communication quality and safety standards are maintained                                                                                            |

**Basic Flow:**

1. Admin accesses the "Communication Logs" section.
2. Admin views transcripts of AI bot interactions to check for accuracy in "Expert Advice".
3. Admin reviews flagged chat messages between users for potential abuse or policy violations.
4. Admin updates the AI bot's knowledge base or intervenes in a chat if necessary.

**Alternative Flows:**

- **Bot Error**: Admin identifies the AI is giving incorrect medical advice and manually overrides the response.

---

#### 1.2.3.6 Digital Adoption Contract

| Use case Name     | Review & Execute Adoption Contracts                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Brief description | Admin manages the generation and storage of legally binding adoption agreements to ensure accountability for the pet's welfare. |
| Actors            | Admin                                                                                                                           |
| Basic Flow        | See below                                                                                                                       |
| Alternative Flows |                                                                                                                                 |
| Pre-conditions    | Both parties (Shelter and Adopter) have agreed to the adoption terms                                                            |
| Post-conditions   | A legally binding document is secured, ensuring long-term animal welfare                                                        |

**Basic Flow:**

1. Admin navigates to "Adoption Contracts."
2. Admin selects a pending adoption case.
3. Admin triggers the "Digital Contract Service" to generate a PDF based on the user's verified identity and pet data.
4. Admin reviews the contract and sends it to the adopter for an electronic signature.
5. System stores the signed PDF in Firebase Storage and logs the completion.

---

#### 1.2.3.7 Post Management

| Use case Name     | Moderate Post-Adoption Journal                                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brief description | The Admin monitors updates shared by new owners in the Post-Adoption Journal to ensure content is appropriate and to track the ongoing welfare of adopted pets. |
| Actors            | Admin                                                                                                                                                           |
| Basic Flow        | See below                                                                                                                                                       |
| Alternative Flows | See below                                                                                                                                                       |
| Pre-conditions    | Admin is authenticated and logged into the Admin dashboard.                                                                                                     |
| Post-conditions   | The public journal feed reflects the moderated entries, and inappropriate content is removed.                                                                   |

**Basic Flow:**

1. Admin navigates to the "Post Management" section of the dashboard.
2. System retrieves a feed of recent journal updates (photos, text, and pet IDs).
3. Admin reviews the content for community guideline compliance.
4. Admin selects a post to "Approve," "Highlight" (for the public feed), or "Delete."
5. System updates the post status in the database and logs the administrative action

**Alternative Flows:**

- **Inappropriate Content**: If a post contains prohibited material, the Admin deletes it and the system sends a notification to the user explaining the removal.

---

#### 1.2.3.8 Health Record Management

| Use case Name     | Manage Pet Medical Histories                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Brief description | Admin creates and updates Electronic Health Records (EHR) for pets to provide transparent medical backgrounds for potential adopters. |
| Actors            | Admin                                                                                                                                 |
| Basic Flow        | See below                                                                                                                             |
| Alternative Flows | See below                                                                                                                             |
| Pre-conditions    | Admin is authenticated; pet profile already exists in the database.                                                                   |
| Post-conditions   | The pet's public profile is updated with the latest medical transparency for visitors.                                                |

**Basic Flow:**

1. Admin navigates to the "Health Record Management" module.
2. Admin selects a specific pet profile to update.
3. Admin clicks "Add Health Record" and inputs data (e.g., vaccine type, date, vet name, batch number).
4. Admin uploads supporting documentation (scanned PDFs) to the record.
5. Admin clicks "Save Changes."
6. System validates the input and updates the pet's chronological medical log.

**Alternative Flows:**

---

#### 1.2.3.9 Rate & Review Management

| Use case Name     | Moderate Shelter Ratings & Reviews                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Brief description | Admin reviews user-submitted feedback to maintain the integrity of the "Trust Index" and prevent spam or fraudulent reviews. |
| Actors            | Admin                                                                                                                        |
| Basic Flow        | See below                                                                                                                    |
| Alternative Flows | See below                                                                                                                    |
| Pre-conditions    | Admin is authenticated and logged in.                                                                                        |
| Post-conditions   | The public rating for the shelter is updated, ensuring informed choices for other adopters.                                  |

**Basic Flow:**

1. Admin navigates to the "Rate & Review Management" section.
2. System displays a list of recent reviews, including star ratings and written feedback.
3. Admin reviews flagged reports or low-star ratings.
4. Admin performs an action: "Confirm Review," "Remove Review," or "Request Clarification."
5. System recalculates the Shelter's aggregate "Trust Index" score based on the moderated data.

**Alternative Flows:**

- **Spam Detection**: If multiple reviews originate from the same IP/Device for the same shelter, the Admin can blacklist the hardware ID.
- **Missing Critical Data**: If mandatory fields like vaccination status are missing, the system blocks submission and highlights the required fields.

---

## 2. Database Schema

This section documents the Firestore database schema for the Snuggle platform.

### Collections Overview

| Collection           | Description                   |
| -------------------- | ----------------------------- |
| users                | User accounts                 |
| savedSearches        | User saved pet searches       |
| kycVerifications     | Identity verification records |
| adopterProfiles      | Adopter preferences           |
| shelters             | Shelter organizations         |
| reviews              | Shelter reviews               |
| pets                 | Pet listings                  |
| healthRecords        | Pet medical history           |
| adoptionApplications | Adoption requests             |
| adoptionContracts    | Legal adoption agreements     |
| chats                | Chat conversations            |
| messages             | Chat messages                 |
| journalPosts         | Post-adoption journal         |
| notifications        | User notifications            |

### Field Definitions

#### users

| Field         | Type      | Required | Description                                  |
| ------------- | --------- | -------- | -------------------------------------------- |
| id            | string    | Auto     | Document ID (Firebase UID)                   |
| email         | string    | Yes      | User email                                   |
| displayName   | string    | Yes      | Display name                                 |
| photoURL      | string    | No       | Profile photo URL                            |
| role          | enum      | Yes      | `visitor` \| `admin`                         |
| accountStatus | enum      | Yes      | `active` \| `suspended`                      |
| authProvider  | enum      | Yes      | `email` \| `google` \| `apple` \| `facebook` |
| emailVerified | boolean   | Yes      | Email verified flag                          |
| isKycVerified | boolean   | Yes      | KYC verified flag                            |
| shelterId     | string    | No       | Linked shelter (if admin)                    |
| fcmTokens     | string[]  | No       | FCM push tokens                              |
| loginCount    | number    | No       | Login count                                  |
| lastLoginAt   | timestamp | No       | Last login time                              |
| createdAt     | timestamp | Yes      | Creation time                                |
| updatedAt     | timestamp | No       | Last update time                             |

#### savedSearches

| Field         | Type      | Required | Description           |
| ------------- | --------- | -------- | --------------------- |
| id            | string    | Auto     | Document ID           |
| userId        | string    | Yes      | Owner user ID         |
| species       | string    | No       | Filter: species       |
| breed         | string    | No       | Filter: breed         |
| size          | string    | No       | Filter: size          |
| maxDistanceKm | number    | No       | Filter: max distance  |
| notifyOnMatch | boolean   | Yes      | Notify on new matches |
| createdAt     | timestamp | Yes      | Creation time         |

#### kycVerifications

| Field           | Type      | Required | Description                           |
| --------------- | --------- | -------- | ------------------------------------- |
| id              | string    | Auto     | Document ID                           |
| userId          | string    | Yes      | User ID                               |
| status          | enum      | Yes      | `pending` \| `approved` \| `rejected` |
| idDocumentURL   | string    | No       | ID document URL                       |
| selfieURL       | string    | No       | Selfie URL                            |
| kycProvider     | string    | No       | KYC provider name                     |
| rejectionReason | string    | No       | Rejection reason                      |
| attemptCount    | number    | Yes      | Attempt count                         |
| reviewedBy      | string    | No       | Admin who reviewed                    |
| submittedAt     | timestamp | Yes      | Submission time                       |
| reviewedAt      | timestamp | No       | Review time                           |

#### adopterProfiles

| Field            | Type      | Required | Description                                                           |
| ---------------- | --------- | -------- | --------------------------------------------------------------------- |
| id               | string    | Auto     | Document ID                                                           |
| userId           | string    | Yes      | User ID                                                               |
| homeType         | enum      | Yes      | `apartment` \| `house` \| `townhouse` \| `condo` \| `farm` \| `other` |
| hasChildren      | boolean   | Yes      | Children in home                                                      |
| hasOtherPets     | boolean   | Yes      | Other pets in home                                                    |
| activityLevel    | enum      | Yes      | `low` \| `medium` \| `high`                                           |
| preferredPetSize | string[]  | No       | Preferred pet sizes                                                   |
| preferredSpecies | string[]  | No       | Preferred species                                                     |
| locationName     | string    | No       | Location name                                                         |
| geoPoint         | GeoPoint  | No       | Location coords                                                       |
| lifestyleAnswers | map       | No       | Questionnaire answers                                                 |
| completedAt      | timestamp | No       | Completion time                                                       |
| updatedAt        | timestamp | Yes      | Last update time                                                      |

#### shelters

| Field        | Type      | Required | Description             |
| ------------ | --------- | -------- | ----------------------- |
| id           | string    | Auto     | Document ID             |
| name         | string    | Yes      | Shelter name            |
| adminUserId  | string    | Yes      | Admin user ID           |
| address      | string    | Yes      | Full address            |
| geoPoint     | GeoPoint  | No       | Location coords         |
| contactEmail | string    | Yes      | Contact email           |
| phone        | string    | No       | Contact phone           |
| description  | string    | No       | Description             |
| photoURLs    | string[]  | No       | Photo URLs              |
| trustScore   | number    | Yes      | Trust score (0-5)       |
| totalReviews | number    | Yes      | Review count            |
| status       | enum      | Yes      | `active` \| `suspended` |
| createdAt    | timestamp | Yes      | Creation time           |
| updatedAt    | timestamp | No       | Last update time        |

#### reviews

| Field      | Type      | Required | Description                          |
| ---------- | --------- | -------- | ------------------------------------ |
| id         | string    | Auto     | Document ID                          |
| shelterId  | string    | Yes      | Shelter ID                           |
| reviewerId | string    | Yes      | Reviewer user ID                     |
| rating     | number    | Yes      | Rating (1-5)                         |
| comment    | string    | No       | Review text                          |
| status     | enum      | Yes      | `pending` \| `approved` \| `removed` |
| createdAt  | timestamp | Yes      | Creation time                        |

#### pets

| Field        | Type      | Required | Description                           |
| ------------ | --------- | -------- | ------------------------------------- |
| id           | string    | Auto     | Document ID                           |
| name         | string    | Yes      | Pet name                              |
| species      | string    | Yes      | Species (dog/cat/etc)                 |
| breed        | string    | Yes      | Breed                                 |
| ageMonths    | number    | Yes      | Age in months                         |
| size         | enum      | Yes      | `small` \| `medium` \| `large`        |
| gender       | enum      | Yes      | `male` \| `female`                    |
| status       | enum      | Yes      | `available` \| `pending` \| `adopted` |
| shelterId    | string    | Yes      | Shelter ID                            |
| shelterName  | string    | No       | Shelter name                          |
| postedBy     | string    | No       | Posted by user ID                     |
| description  | string    | No       | Description                           |
| photoURLs    | string[]  | No       | Photo URLs                            |
| isVaccinated | boolean   | Yes      | Vaccination status                    |
| isNeutered   | boolean   | Yes      | Neutered status                       |
| geoPoint     | GeoPoint  | No       | Location coords                       |
| contractId   | string    | No       | Linked contract                       |
| createdAt    | timestamp | Yes      | Creation time                         |
| updatedAt    | timestamp | Yes      | Last update time                      |

#### healthRecords

| Field       | Type      | Required | Description                           |
| ----------- | --------- | -------- | ------------------------------------- |
| id          | string    | Auto     | Document ID                           |
| petId       | string    | Yes      | Pet ID                                |
| type        | enum      | Yes      | `vaccine` \| `checkup` \| `treatment` |
| description | string    | Yes      | Record description                    |
| vetName     | string    | No       | Veterinarian name                     |
| batchNumber | string    | No       | Vaccine batch #                       |
| documentURL | string    | No       | Document URL                          |
| addedBy     | string    | No       | Admin user ID                         |
| recordDate  | timestamp | Yes      | Record date                           |
| createdAt   | timestamp | Yes      | Creation time                         |

#### adoptionApplications

| Field       | Type      | Required | Description                                          |
| ----------- | --------- | -------- | ---------------------------------------------------- |
| id          | string    | Auto     | Document ID                                          |
| petId       | string    | Yes      | Pet ID                                               |
| petName     | string    | Yes      | Pet name                                             |
| adopterId   | string    | Yes      | Adopter user ID                                      |
| adopterName | string    | Yes      | Adopter name                                         |
| shelterId   | string    | Yes      | Shelter ID                                           |
| status      | enum      | Yes      | `pending` \| `approved` \| `rejected` \| `completed` |
| message     | string    | No       | Application message                                  |
| adminNote   | string    | No       | Admin note                                           |
| chatId      | string    | No       | Linked chat                                          |
| reviewedBy  | string    | No       | Reviewing admin                                      |
| appliedAt   | timestamp | Yes      | Application time                                     |
| reviewedAt  | timestamp | No       | Review time                                          |

#### adoptionContracts

| Field           | Type      | Required | Description                       |
| --------------- | --------- | -------- | --------------------------------- |
| id              | string    | Auto     | Document ID                       |
| applicationId   | string    | Yes      | Application ID                    |
| petId           | string    | Yes      | Pet ID                            |
| adopterId       | string    | Yes      | Adopter user ID                   |
| contractFileURL | string    | No       | PDF URL                           |
| contractHash    | string    | No       | Contract hash                     |
| adopterSignedAt | timestamp | No       | Adopter sign time                 |
| shelterSignedAt | timestamp | No       | Shelter sign time                 |
| status          | enum      | Yes      | `draft` \| `signed` \| `archived` |
| createdAt       | timestamp | Yes      | Creation time                     |

#### chats

| Field          | Type      | Required | Description          |
| -------------- | --------- | -------- | -------------------- |
| id             | string    | Auto     | Document ID          |
| applicationId  | string    | Yes      | Application ID       |
| participantIds | string[]  | Yes      | Participant user IDs |
| lastMessage    | string    | No       | Last message preview |
| lastMessageAt  | timestamp | No       | Last message time    |
| createdAt      | timestamp | Yes      | Creation time        |

#### messages

| Field    | Type      | Required | Description                   |
| -------- | --------- | -------- | ----------------------------- |
| id       | string    | Auto     | Document ID                   |
| chatId   | string    | Yes      | Chat ID                       |
| senderId | string    | Yes      | Sender user ID                |
| content  | string    | Yes      | Message content               |
| type     | enum      | Yes      | `text` \| `image` \| `system` |
| isRead   | boolean   | Yes      | Read flag                     |
| sentAt   | timestamp | Yes      | Sent time                     |

#### journalPosts

| Field      | Type      | Required | Description                                           |
| ---------- | --------- | -------- | ----------------------------------------------------- |
| id         | string    | Auto     | Document ID                                           |
| petId      | string    | Yes      | Pet ID                                                |
| authorId   | string    | Yes      | Author user ID                                        |
| contractId | string    | No       | Contract ID                                           |
| content    | string    | Yes      | Post content                                          |
| photoURLs  | string[]  | No       | Photo URLs                                            |
| status     | enum      | Yes      | `pending` \| `approved` \| `highlighted` \| `deleted` |
| createdAt  | timestamp | Yes      | Creation time                                         |

#### notifications

| Field      | Type      | Required | Description        |
| ---------- | --------- | -------- | ------------------ |
| id         | string    | Auto     | Document ID        |
| userId     | string    | Yes      | Target user ID     |
| type       | string    | Yes      | Notification type  |
| title      | string    | Yes      | Title              |
| body       | string    | Yes      | Body text          |
| linkId     | string    | No       | Linked entity ID   |
| linkedType | string    | No       | Linked entity type |
| isRead     | boolean   | Yes      | Read flag          |
| createdAt  | timestamp | Yes      | Creation time      |

### Indexes Required

Compound indexes for common queries:

- `pets`: `[shelterId, status]`, `[status, species]`, `[geoPoint]` (geospatial)
- `reviews`: `[shelterId, status]`, `[createdAt]`
- `adoptionApplications`: `[adopterId, status]`, `[shelterId, status]`
- `chats`: `[participantIds]`, `[applicationId]`
- `messages`: `[chatId, sentAt]`

### Security Rules

Firestore rules summary:

- `users`: read self + admin; write self + admin
- `pets`: read all; write shelter owner + admin
- `adoptionApplications`: read applicant + shelter + admin; write applicant + admin
- `adoptionContracts`: read parties + admin; write admin
- `reviews`: read all; write after adoption + admin
- `notifications`: read targeting user; write system + admin

---

## 3. API Reference

This section documents the REST API endpoints, request/response formats, and error codes.

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Token is obtained from `/api/auth/login` or `/api/auth/google` endpoints.

### Error Codes

| Code | Name                  | Description                        |
| ---- | --------------------- | ---------------------------------- |
| 400  | Bad Request           | Invalid request body or parameters |
| 401  | Unauthorized          | Missing or invalid JWT token       |
| 403  | Forbidden             | Insufficient permissions           |
| 404  | Not Found             | Resource not found                 |
| 409  | Conflict              | Resource already exists            |
| 429  | Too Many Requests     | Rate limit exceeded                |
| 500  | Internal Server Error | Server error                       |
| 503  | Service Unavailable   | Server temporarily unavailable     |

#### Error Response Format

```json
{
    "success": false,
    "error": "Error message",
    "code": "BAD_REQUEST"
}
```

### Endpoints

#### Health Check

| Method | Endpoint  | Description          | Auth |
| ------ | --------- | -------------------- | ---- |
| GET    | `/health` | Server health status | No   |

**Response:**

```json
{
    "success": true,
    "data": {
        "status": "ok",
        "timestamp": "2026-04-11T00:00:00.000Z"
    }
}
```

---

#### Pets

| Method | Endpoint        | Description    | Auth     |
| ------ | --------------- | -------------- | -------- |
| GET    | `/api/pets`     | List all pets  | No       |
| GET    | `/api/pets/:id` | Get single pet | No       |
| POST   | `/api/pets`     | Create pet     | Required |
| PUT    | `/api/pets/:id` | Update pet     | Required |
| DELETE | `/api/pets/:id` | Delete pet     | Required |

**Query Parameters (GET /api/pets):**
| Parameter | Type | Description |
|-----------|------|-------------|
| species | string | Filter by species (dog/cat/bird/rabbit/other) |
| status | string | Filter by status (available/pending/adopted) |
| shelterId | string | Filter by shelter |
| search | string | Search in name/description |

**Request Body (POST /api/pets):**

```json
{
    "name": "Max",
    "species": "dog",
    "breed": "Golden Retriever",
    "ageMonths": 24,
    "size": "large",
    "gender": "male",
    "description": "Friendly and trained",
    "photoURLs": ["https://example.com/dog.jpg"],
    "isVaccinated": true,
    "isNeutered": true,
    "shelterId": "shelter_123"
}
```

**Response (GET /api/pets/:id):**

```json
{
    "success": true,
    "data": {
        "id": "pet_abc123",
        "name": "Max",
        "species": "dog",
        "breed": "Golden Retriever",
        "ageMonths": 24,
        "size": "large",
        "gender": "male",
        "status": "available",
        "shelterId": "shelter_123",
        "description": "Friendly and trained",
        "photoURLs": ["https://example.com/dog.jpg"],
        "isVaccinated": true,
        "isNeutered": true,
        "createdAt": "2026-04-01T00:00:00.000Z",
        "updatedAt": "2026-04-01T00:00:00.000Z"
    }
}
```

**Error Responses:**

- 400: Invalid request body
- 401: Authentication required
- 403: Not shelter owner or admin
- 404: Pet not found

---

#### Health Records

| Method | Endpoint                              | Description          | Auth     |
| ------ | ------------------------------------- | -------------------- | -------- |
| GET    | `/api/pets/:petId/health-records`     | List health records  | No       |
| POST   | `/api/pets/:petId/health-records`     | Create health record | Required |
| DELETE | `/api/pets/:petId/health-records/:id` | Delete health record | Required |

**Request Body (POST):**

```json
{
    "type": "vaccine",
    "description": "Rabies vaccination",
    "vetName": "Dr. Smith",
    "batchNumber": "RV-2026-001",
    "recordDate": "2026-04-01T00:00:00.000Z"
}
```

---

#### Auth

| Method | Endpoint                        | Description               | Auth     |
| ------ | ------------------------------- | ------------------------- | -------- |
| POST   | `/api/auth/register`            | Register new user         | No       |
| POST   | `/api/auth/login`               | Login user                | No       |
| POST   | `/api/auth/google`              | Google sign-in            | No       |
| POST   | `/api/auth/facebook`            | Facebook sign-in          | No       |
| POST   | `/api/auth/resend-verification` | Resend verification email | No       |
| POST   | `/api/auth/verify-email`        | Verify email              | No       |
| GET    | `/api/auth/me`                  | Verify JWT token          | Required |
| GET    | `/api/auth/profile`             | Get user profile          | Required |
| PUT    | `/api/auth/profile`             | Update user profile       | Required |
| DELETE | `/api/auth/account`             | Delete user account       | Required |

**Request Body (POST /api/auth/login):**

```json
{
    "email": "user@example.com",
    "password": "securepassword"
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "user": {
            "uid": "user_abc123",
            "email": "user@example.com",
            "displayName": "John Doe",
            "emailVerified": true,
            "role": "visitor"
        },
        "token": "eyJhbGciOiJSUzI1NiIs..."
    }
}
```

---

#### Profile

| Method | Endpoint                        | Description            | Auth     |
| ------ | ------------------------------- | ---------------------- | -------- |
| GET    | `/api/users/me/adopter-profile` | Get adopter profile    | Required |
| POST   | `/api/users/me/adopter-profile` | Create adopter profile | Required |
| PUT    | `/api/users/me/adopter-profile` | Update adopter profile | Required |

**Request Body (POST):**

```json
{
    "homeType": "house",
    "hasChildren": true,
    "hasOtherPets": false,
    "activityLevel": "high",
    "preferredPetSize": ["medium", "large"],
    "preferredSpecies": ["dog"],
    "locationName": "Ho Chi Minh City",
    "lifestyleAnswers": {
        "hoursAlone": "4-6 hours",
        "exerciseFreq": "daily"
    }
}
```

---

#### Saved Searches

| Method | Endpoint                           | Description         | Auth     |
| ------ | ---------------------------------- | ------------------- | -------- |
| GET    | `/api/users/me/saved-searches`     | List saved searches | Required |
| POST   | `/api/users/me/saved-searches`     | Create saved search | Required |
| DELETE | `/api/users/me/saved-searches/:id` | Delete saved search | Required |

**Request Body (POST):**

```json
{
    "species": "dog",
    "breed": "Golden Retriever",
    "size": "large",
    "maxDistanceKm": 50,
    "notifyOnMatch": true
}
```

---

#### Shelters

| Method | Endpoint            | Description        | Auth     |
| ------ | ------------------- | ------------------ | -------- |
| GET    | `/api/shelters`     | List all shelters  | No       |
| GET    | `/api/shelters/:id` | Get single shelter | No       |
| POST   | `/api/shelters`     | Create shelter     | Required |
| PUT    | `/api/shelters/:id` | Update shelter     | Required |
| DELETE | `/api/shelters/:id` | Delete shelter     | Required |

**Request Body (POST):**

```json
{
    "name": "Happy Paws Shelter",
    "address": "123 Pet Street, District 1, HCMC",
    "contactEmail": "contact@happypaws.org",
    "phone": "+84 123 456 789",
    "description": "No-kill shelter for dogs"
}
```

---

#### Reviews

| Method | Endpoint                             | Description          | Auth     |
| ------ | ------------------------------------ | -------------------- | -------- |
| GET    | `/api/reviews/:shelterId`            | Get shelter reviews  | No       |
| POST   | `/api/reviews/:shelterId`            | Create review        | Required |
| PUT    | `/api/reviews/:shelterId/:id/status` | Update review status | Required |

**Request Body (POST):**

```json
{
    "rating": 5,
    "comment": "Great shelter, highly recommend!"
}
```

---

#### Adoption Applications

| Method | Endpoint                       | Description               | Auth     |
| ------ | ------------------------------ | ------------------------- | -------- |
| GET    | `/api/applications`            | List all applications     | Required |
| GET    | `/api/applications/:id`        | Get single application    | Required |
| POST   | `/api/applications`            | Create application        | Required |
| PUT    | `/api/applications/:id/status` | Update application status | Required |
| DELETE | `/api/applications/:id`        | Delete application        | Required |

**Request Body (POST):**

```json
{
    "petId": "pet_abc123",
    "message": "I would love to adopt Max. I have a large house with a yard."
}
```

**Status Update (PUT):**

```json
{
    "status": "approved",
    "adminNote": "Approved after interview"
}
```

---

#### Adoption Contracts

| Method | Endpoint                     | Description         | Auth     |
| ------ | ---------------------------- | ------------------- | -------- |
| GET    | `/api/contracts`             | List all contracts  | Required |
| GET    | `/api/contracts/:id`         | Get single contract | No       |
| POST   | `/api/contracts`             | Create contract     | Required |
| PUT    | `/api/contracts/:id/sign`    | Sign contract       | Required |
| PUT    | `/api/contracts/:id/archive` | Archive contract    | Required |

---

#### Admin

| Method | Endpoint               | Description             | Auth  |
| ------ | ---------------------- | ----------------------- | ----- |
| GET    | `/api/admin/users`     | List all users          | Admin |
| GET    | `/api/admin/users/:id` | Get user + activity     | Admin |
| PUT    | `/api/admin/users/:id` | Update user role/status | Admin |

**Query Parameters (GET /api/admin/users):**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search by name/email |
| role | string | Filter by role |
| status | string | Filter by status |
| page | number | Page number |
| limit | number | Items per page |

**Request Body (PUT):**

```json
{
    "role": "admin",
    "accountStatus": "suspended"
}
```

---

## 4. Testing

### Test Files

| File                                     | Description                                                  |
| ---------------------------------------- | ------------------------------------------------------------ |
| `tests/unit/authValidator.test.ts`       | Zod schema validation for register, login, updateUserProfile |
| `tests/unit/petValidator.test.ts`        | Pet data validation schemas                                  |
| `tests/unit/validation.test.ts`          | General validation utilities                                 |
| `tests/integration/auth.test.ts`         | Auth routes: register, login, profile CRUD, account deletion |
| `tests/integration/pets.test.ts`         | Pet CRUD operations                                          |
| `tests/integration/shelters.test.ts`     | Shelter management                                           |
| `tests/integration/reviews.test.ts`      | Review system                                                |
| `tests/integration/admin.test.ts`        | Admin operations                                             |
| `tests/integration/applications.test.ts` | Adoption applications                                        |

### Coverage Areas

- **Validators**: Zod schema validation for all input types
- **Auth Routes**: Register, login, profile get/update, account deletion
- **API Routes**: All major endpoints with JWT authentication
- **Error Handling**: Proper error responses and status codes
