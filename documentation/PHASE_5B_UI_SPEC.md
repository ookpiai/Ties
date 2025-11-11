# Phase 5B: Exact UI Specification from Mock Workspace
## Replicating FunctionalStudioPage Workspace Features for Jobs

**Created:** November 11, 2025
**Purpose:** Ensure Phase 5B perfectly replicates the existing workspace mock UI

---

## 🎯 EXACT TAB STRUCTURE (Must Match)

### **Workspace Tabs (8 Total in 2 Rows)**

**Row 1:** (4 tabs)
1. **Overview** - Stats cards and summary
2. **Tasks** - Task management with full UI
3. **Files** - File upload/download with drag-and-drop
4. **Team** - Team member management

**Row 2:** (4 tabs)
5. **Messages** - Team communication with thread selector
6. **Budget** - Budget tracking with category breakdown + "Add Expense" button
7. **Client Access** - Client dashboard permissions
8. **Settings** - Workspace settings

---

## 📋 TAB-BY-TAB DETAILED SPECIFICATIONS

### 1. **OVERVIEW TAB**

**Current Mock UI:**
```jsx
<div className="space-y-4">
  <h3 className="text-xl font-semibold">{workspace.title}</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="profile-card">
      <div className="text-sm text-muted-foreground">Progress</div>
      <div className="text-2xl font-bold">{workspace.progress}%</div>
      <div className="w-full bg-muted rounded-full h-2 mt-2">
        <div className="bg-primary h-2 rounded-full" style={{ width: `${workspace.progress}%` }}></div>
      </div>
    </div>
    <div className="profile-card">
      <div className="text-sm text-muted-foreground">Budget Used</div>
      <div className="text-2xl font-bold">${workspace.spent.toLocaleString()}</div>
      <div className="text-sm text-muted-foreground">of ${workspace.budget.toLocaleString()}</div>
    </div>
    <div className="profile-card">
      <div className="text-sm text-muted-foreground">Team Size</div>
      <div className="text-2xl font-bold">{workspace.collaborators}</div>
      <div className="text-sm text-muted-foreground">collaborators</div>
    </div>
  </div>
</div>
```

**What Job Detail Already Has:**
- ✅ Title display
- ✅ Progress card (roles filled %)
- ✅ Budget card (total budget)
- ✅ Applications count card

**What Needs to Change:**
- 🔄 Add "Budget Used" stat (from job_expenses)
- 🔄 Add "Team Size" stat (from job_selections count)
- 🔄 Change "Applications" to "Team Size" after roles filled
- 🔄 Show progress bar for budget spent vs total

---

### 2. **TASKS TAB**

**Current Mock UI Components:**

```jsx
// TaskManagement Component (lines 293-409)
const TaskManagement = () => {
  // Features:
  // - "Add Task" button (top right)
  // - Filter by status dropdown
  // - Task list with cards showing:
  //   - Title
  //   - Assignee with avatar
  //   - Due date
  //   - Priority badge
  //   - Status dropdown (pending/in-progress/completed/cancelled)
  // - "Add Task" modal with:
  //   - Title input
  //   - Description textarea
  //   - Assign to dropdown (team members)
  //   - Due date picker
  //   - Priority select (low/medium/high/urgent)
  //   - Status select
}
```

**Exact UI Elements:**
- Header: "Task Management"
- Top right: "Add Task" button (+ icon)
- Filter dropdown: "All Tasks", "Pending", "In Progress", "Completed"
- Task cards in grid:
  - Circle avatar with initials
  - Task title (bold)
  - "Assigned to: Name" (small text)
  - "Due: Date" (small text)
  - Priority badge (colored: high=red, medium=yellow, low=blue)
  - Status dropdown (interactive)
- Modal for adding task:
  - Title input
  - Description textarea
  - Assign to: dropdown of team members
  - Due date: date picker
  - Priority: select (Low/Medium/High/Urgent)
  - Status: select (Pending/In Progress/Completed/Cancelled)
  - Add Task / Cancel buttons

**Phase 5B Implementation:**
✅ All specified in API plan - just needs exact UI replication

---

### 3. **FILES TAB**

**Current Mock UI Components:**

```jsx
// FileManagement Component (lines 412-491)
const FileManagement = () => {
  // Features:
  // - "Upload Files" button (top right)
  // - Drag-and-drop upload zone with dashed border
  // - File list showing:
  //   - File icon
  //   - File name
  //   - File size + uploaded by + date
  //   - Download button
  //   - Share button
}
```

**Exact UI Elements:**
- Header: "File Management"
- Top right: "Upload Files" button (Upload icon) + hidden file input
- Drag-drop zone:
  - Dashed border (gray normally, primary color when dragging)
  - Upload icon (large, centered)
  - Text: "Drag and drop files here or click to upload"
  - Turns primary/5 background on drag over
- File cards:
  - Gray background icon box with File icon
  - File name (bold)
  - Metadata line: "X.X MB • Uploaded by Name on Date"
  - Action buttons (right side):
    - Download button (Download icon)
    - Share button (Share2 icon)
  - Hover effect on buttons

**Phase 5B Implementation:**
✅ All specified in API plan with Supabase Storage
🔄 Need to replicate exact drag-drop UI

---

### 4. **TEAM TAB**

**Current Mock UI Components:**

```jsx
// TeamManagement Component (lines 695-817)
const TeamManagement = () => {
  // Features:
  // - "Invite Member" button (top right)
  // - Team member cards showing:
  //   - Avatar circle with initials
  //   - Name (bold)
  //   - Role subtitle
  //   - Permissions dropdown (admin/editor/viewer)
  //   - Status badge (active/inactive)
  // - "Invite Member" modal with:
  //   - Email input
  //   - Role input
  //   - Permissions select
}
```

**Exact UI Elements:**
- Header: "Team Management"
- Top right: "Invite Member" button (UserPlus icon)
- Team member cards:
  - Left side:
    - Circle avatar (10x10) with initials, primary/20 bg, primary text
    - Name (bold)
    - Role (small, muted text)
  - Right side:
    - Permissions dropdown: Admin/Editor/Viewer
    - Status badge: Active (green) / Inactive (gray)
- Modal for inviting:
  - Email input (placeholder: "Email address")
  - Role input (placeholder: "Role (e.g., Sound Engineer)")
  - Permissions select:
    - "Viewer - Can view project"
    - "Editor - Can edit and contribute"
    - "Admin - Full access"
  - Send Invite / Cancel buttons

**Phase 5B Implementation:**
🔄 For jobs, team is AUTO-POPULATED from job_selections
🔄 "Invite Member" becomes "Add Team Member" (search existing users or invite new)
🔄 Permissions per member (viewer can only see, editor can add tasks/files, admin full control)

---

### 5. **MESSAGES TAB**

**Current Mock UI Components:**

```jsx
// MessagingSystem Component (lines 493-561)
const MessagingSystem = () => {
  // Features:
  // - Thread selector dropdown (top right)
  // - Threads: General, Stage Setup, Catering, Security, Marketing
  // - Message feed (scrollable, max-h-96):
  //   - Sender name (bold, small)
  //   - Timestamp (right, small, muted)
  //   - Message content
  //   - Border between messages
  // - Message input area:
  //   - Text input (flex-1)
  //   - Send button (Send icon)
  //   - Enter key to send
}
```

**Exact UI Elements:**
- Header: "Team Communication"
- Top right: Thread dropdown
  - Options: General, Stage Setup, Catering, Security, Marketing
  - (For jobs: could be General + role-based threads)
- Message feed:
  - White card (profile-card class)
  - Max height: 96 (overflow-y-auto)
  - Message bubbles:
    - Top row: Sender name (bold, sm) | Timestamp (xs, muted, right)
    - Message text (sm)
    - Border-bottom except last message
- Input area:
  - Flex row with gap-2
  - Text input: flex-1, rounded-lg, focus ring
  - Placeholder: "Type your message..."
  - Send button: btn-primary, Send icon
  - Enter key triggers send

**Phase 5B Implementation:**
✅ Specified in API plan
🔄 Threads = "General" + one per role type (e.g., "DJ Team", "Venue Coordination")
🔄 Exact UI replication needed

---

### 6. **BUDGET TAB** ⭐ CRITICAL

**Current Mock UI Components:**

```jsx
// BudgetTracker Component (lines 563-693)
const BudgetTracker = () => {
  // Features:
  // - "Add Expense" button (top right) ⭐
  // - 3 stat cards:
  //   - Total Budget
  //   - Amount Spent (red text)
  //   - Remaining (green text)
  // - Category Breakdown section:
  //   - List of categories with:
  //     - Category name
  //     - "Spent / Budgeted" amounts
  //     - Progress bar (green if under, red if over)
  // - "Add Expense" modal:
  //   - Category dropdown (from existing categories)
  //   - Amount input (number)
  //   - Description input (text)
  //   - Add Expense / Cancel buttons
}
```

**Exact UI Elements:**
- Header: "Budget Tracking"
- **Top right: "Add Expense" button (Plus icon) ⭐ KEY FEATURE**
- **3 stat cards (grid-cols-3):**
  1. Total Budget: $25,000 (black text)
  2. Amount Spent: $18,500 (RED text, text-red-600)
  3. Remaining: $6,500 (GREEN text, text-green-600)
- **Category Breakdown card:**
  - Title: "Category Breakdown" (h4, bold)
  - Each category:
    - Row 1: Name | "$spent / $budgeted"
    - Row 2: Progress bar
      - Full width, bg-muted, rounded-full, h-2
      - Inner bar: green (under budget) or red (over budget)
      - Width: min(100%, spent/budgeted * 100%)
- **Add Expense Modal:**
  - Title: "Add Expense"
  - Close X button
  - Form fields (space-y-4):
    1. Category dropdown (full width)
       - Options from existing budget categories
    2. Amount input (number type)
       - Placeholder: "Amount"
    3. Description input (text)
       - Placeholder: "Description"
  - Buttons: Add Expense (primary) / Cancel (gray-200)

**Phase 5B Implementation:**
✅ API for expenses exists in plan
🔄 **MUST show both:**
  - **Planned budget (by role from job_roles)**
  - **Actual expenses (from job_expenses)**
🔄 Categories come from role types initially
🔄 Allow adding custom expense categories

**Example Budget Data:**
```javascript
{
  total: 25000,  // From job_postings.total_budget
  spent: 18500,  // Sum of job_expenses.amount
  categories: [
    { name: 'DJ (Freelancer)', budgeted: 5000, spent: 4500 },
    { name: 'Venue', budgeted: 10000, spent: 9500 },
    { name: 'Catering', budgeted: 7000, spent: 3500 },
    { name: 'Security', budgeted: 3000, spent: 1000 }
  ]
}
```

---

### 7. **CLIENT ACCESS TAB**

**Current Mock UI Components:**

```jsx
// ClientDashboard Component (lines 819-899)
const ClientDashboard = () => {
  // Features:
  // - Toggle button for enabling/disabling (top right)
  // - "Generate Shareable Link" button
  // - Client email display
  // - Permissions checkboxes:
  //   - View Progress Updates
  //   - Approve Milestones
  //   - View Budget Summary
  //   - Receive Notifications
  // - Preview section showing what client sees
}
```

**Exact UI Elements:**
- Header: "Client Dashboard Access"
- Top right: Toggle button
  - Green (enabled) or Gray (disabled)
  - Shows "Enabled" or "Disabled" text
- Info card:
  - Client email display
  - "Generate Shareable Link" button (copies to clipboard)
- Permissions section:
  - Checkboxes for:
    - View Progress Updates
    - Approve Milestones
    - View Budget Summary
    - Receive Notifications
- Client Preview section:
  - Shows what client would see:
    - Project progress card
    - Next milestone card
    - Budget summary card

**Phase 5B Implementation:**
⏸️ DEFER to Phase 5C (nice-to-have, not critical for MVP)
- Client access is advanced feature
- Focus on team collaboration first

---

### 8. **SETTINGS TAB**

**Current Mock UI Components:**

```jsx
// Settings section (lines 1382-1418)
{activeWorkspaceTab === 'settings' && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Workspace Settings</h3>
    <div className="profile-card">
      <div className="space-y-4">
        <div>
          <label>Workspace Name</label>
          <input value={workspace.title} readOnly />
        </div>
        <div>
          <label>Event Type</label>
          <input value={workspace.type} readOnly />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div>Archive Workspace</div>
            <div className="text-sm text-muted">Archive when event complete</div>
          </div>
          <button className="btn-secondary">Archive</button>
        </div>
      </div>
    </div>
  </div>
)}
```

**Exact UI Elements:**
- Header: "Workspace Settings"
- Settings card:
  - Workspace Name input (read-only or editable)
  - Event Type input (read-only or editable)
  - Archive section:
    - Label: "Archive Workspace"
    - Description: "Archive this workspace when the event is complete"
    - Button: "Archive" (btn-secondary)

**Phase 5B Implementation:**
✅ Already implemented in JobDetail Settings tab
🔄 Add "Archive Job" option
🔄 Allow editing job title, location, dates (if still open)

---

## 🎨 UPDATED JobDetail TAB MAPPING

### **Phase 5A (Current - Partial)**
Current JobDetail has these tabs but needs updates:

| Tab # | Current Name | Current Status | Phase 5B Change |
|-------|-------------|----------------|-----------------|
| 1 | Overview | ✅ Basic stats | 🔄 Add budget spent, team size |
| 2 | **Applicants** | ✅ For hiring | ✅ Keep as-is |
| 3 | Roles | ✅ Role breakdown | 🔄 Rename to **"Team"** + show members |
| 4 | Messages | ❌ Placeholder | ✅ Implement full messaging |
| 5 | Budget | ⚠️ Planned only | ✅ Add expense tracking + "Add Expense" button |
| 6 | Files | ❌ Placeholder | ✅ Implement file upload |
| 7 | Analytics | ❌ Placeholder | 🔄 Rename to **"Tasks"** + implement task management |
| 8 | Settings | ✅ Basic | 🔄 Add archive option |

### **Phase 5B (Target - Full Featured)**

**Row 1:**
1. ✅ **Overview** - Enhanced with budget spent + team size
2. ✅ **Applicants** - Keep for hiring phase (hide when all filled)
3. 🔄 **Team** (was "Roles") - Team members + roles
4. ✅ **Tasks** (was "Analytics") - Full task management

**Row 2:**
5. ✅ **Messages** - Team communication with threads
6. ✅ **Budget** - Budget tracking + "Add Expense" button ⭐
7. ✅ **Files** - File upload/download with drag-drop
8. ✅ **Settings** - Job settings + archive

---

## 🔑 CRITICAL UI FEATURES (Must Have)

### **1. Budget Tab - "Add Expense" Button** ⭐⭐⭐
**Why Critical:**
- Core feature users specifically asked about
- Visible in mock workspace prominently
- Enables tracking actual spending vs planned budget

**Implementation:**
```jsx
// Budget Tab Header
<div className="flex items-center justify-between">
  <h3 className="text-lg font-semibold">Budget Tracking</h3>
  <button
    onClick={() => setShowAddExpense(true)}
    className="btn-primary flex items-center gap-2"
  >
    <Plus size={16} />
    Add Expense
  </button>
</div>

// 3 Stat Cards
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div className="profile-card">
    <div className="text-sm text-muted-foreground">Total Budget</div>
    <div className="text-2xl font-bold">${job.total_budget.toLocaleString()}</div>
  </div>
  <div className="profile-card">
    <div className="text-sm text-muted-foreground">Amount Spent</div>
    <div className="text-2xl font-bold text-red-600">${totalSpent.toLocaleString()}</div>
  </div>
  <div className="profile-card">
    <div className="text-sm text-muted-foreground">Remaining</div>
    <div className="text-2xl font-bold text-green-600">${(job.total_budget - totalSpent).toLocaleString()}</div>
  </div>
</div>

// Category Breakdown with Progress Bars
<div className="profile-card">
  <h4 className="font-semibold mb-4">Category Breakdown</h4>
  <div className="space-y-3">
    {budgetCategories.map((category) => (
      <div key={category.name} className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{category.name}</span>
          <span>${category.spent.toLocaleString()} / ${category.budgeted.toLocaleString()}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              category.spent > category.budgeted ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((category.spent / category.budgeted) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    ))}
  </div>
</div>
```

### **2. Messages Tab - Thread System** ⭐⭐
**Why Critical:**
- Team communication is essential
- Thread system keeps conversations organized
- Specific to roles/departments

**Implementation:**
```jsx
<div className="flex items-center justify-between">
  <h3 className="text-lg font-semibold">Team Communication</h3>
  <select
    value={selectedThread}
    onChange={(e) => setSelectedThread(e.target.value)}
    className="px-3 py-1 border rounded"
  >
    <option>General</option>
    {job.roles.map(role => (
      <option key={role.id} value={role.id}>{role.role_title}</option>
    ))}
  </select>
</div>

<div className="profile-card max-h-96 overflow-y-auto">
  <div className="space-y-3">
    {filteredMessages.map(message => (
      <div key={message.id} className="border-b pb-3 last:border-b-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm">{message.sender.display_name}</span>
          <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
        </div>
        <p className="text-sm">{message.message}</p>
      </div>
    ))}
  </div>
</div>
```

### **3. Files Tab - Drag-and-Drop** ⭐⭐
**Why Critical:**
- File sharing is core workspace feature
- Drag-drop is intuitive UX
- Users expect it from mock UI

**Implementation:**
```jsx
<div
  className={`border-2 border-dashed rounded-lg p-8 text-center ${
    dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
  }`}
  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
  onDragLeave={() => setDragOver(false)}
  onDrop={handleFileDrop}
>
  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
  <p className="text-gray-600">Drag and drop files here or click to upload</p>
</div>
```

### **4. Tasks Tab - Full Task Management** ⭐⭐
**Why Critical:**
- Assign work to team members
- Track due dates and completion
- Core project management feature

**Implementation:**
```jsx
<div className="flex items-center justify-between">
  <h3 className="text-lg font-semibold">Task Management</h3>
  <button
    onClick={() => setShowAddTask(true)}
    className="btn-primary flex items-center gap-2"
  >
    <Plus size={16} />
    Add Task
  </button>
</div>

// Filter
<select value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)}>
  <option>All Tasks</option>
  <option>Pending</option>
  <option>In Progress</option>
  <option>Completed</option>
</select>

// Task cards with assignee, due date, priority, status dropdown
```

### **5. Team Tab - Auto-Populated Members** ⭐
**Why Critical:**
- Show all hired team members
- Manage permissions per member
- See who's on the project

**Implementation:**
```jsx
// Automatically pulls from job_selections
const teamMembers = [
  { ...organiser, role: 'Organizer', permissions: 'admin' },
  ...selectedApplicants.map(s => ({
    ...s.applicant,
    job_role: s.role.role_title,
    permissions: 'editor'
  }))
]
```

---

## 📦 MOCK DATA TO KEEP

Keep ONE workspace in FunctionalStudioPage.jsx as reference:

```javascript
const REFERENCE_WORKSPACE = {
  id: 'mock-reference-workspace',
  title: 'Summer Music Festival 2024 [REFERENCE DEMO]',
  type: 'Festival',
  date: '2024-08-15',
  location: 'Central Park',
  status: 'In Progress',
  collaborators: 12,
  tasksCompleted: 45,
  totalTasks: 67,
  budget: 25000,
  spent: 18500,
  progress: 67,
  description: 'This is a demo workspace showing all features. Use this as reference for what job workspaces will look like when fully featured.',
  isReference: true
}
```

Display this in Studio with:
- Badge: "DEMO" or "REFERENCE"
- Not editable
- Shows all tabs functioning
- Users can explore to see features

---

## ✅ PHASE 5B IMPLEMENTATION CHECKLIST (Updated)

### **Week 1: Database + API**
- [ ] Create 4 database tables (tasks, files, messages, expenses)
- [ ] Implement all 20+ API functions
- [ ] Set up Supabase Storage for files
- [ ] Test API layer completely

### **Week 2: UI Replication**

**Day 1-2: Budget Tab (PRIORITY)**
- [ ] Replicate exact Budget tab UI from mock
- [ ] 3 stat cards (Total/Spent/Remaining)
- [ ] Category breakdown with progress bars
- [ ] **"Add Expense" button and modal**
- [ ] Link to job_expenses table
- [ ] Categories from job_roles initially

**Day 3: Messages Tab**
- [ ] Replicate exact Messages tab UI from mock
- [ ] Thread selector dropdown
- [ ] Message feed with scrolling
- [ ] Send message input area
- [ ] Connect to job_messages table

**Day 4: Files Tab**
- [ ] Replicate exact Files tab UI from mock
- [ ] "Upload Files" button
- [ ] Drag-and-drop zone
- [ ] File list with download/share buttons
- [ ] Connect to Supabase Storage + job_files table

**Day 5: Tasks Tab**
- [ ] Replicate exact Tasks tab UI from mock
- [ ] "Add Task" button and modal
- [ ] Task filter dropdown
- [ ] Task cards with all fields
- [ ] Status dropdown per task
- [ ] Connect to job_tasks table

**Day 6: Team Tab**
- [ ] Rename "Roles" tab to "Team"
- [ ] Auto-populate from job_selections
- [ ] Show organizer + all selected applicants
- [ ] Permissions dropdown per member
- [ ] Status badges

**Day 7: Overview Tab Enhancement**
- [ ] Add "Budget Spent" stat card
- [ ] Add "Team Size" stat card
- [ ] Update progress calculation
- [ ] Show recent activity

### **Week 3: Polish + Testing**
- [ ] Settings tab: Add archive option
- [ ] Hide "Applicants" tab after all roles filled
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling
- [ ] Keep reference workspace with "DEMO" badge
- [ ] End-to-end testing
- [ ] Documentation

---

## 🎯 SUCCESS CRITERIA

Phase 5B is successful when:

1. ✅ JobDetail tabs **exactly match** WorkspaceDetail tabs (same UI, same features)
2. ✅ **"Add Expense" button** works and tracks budget
3. ✅ Budget tab shows planned vs actual with progress bars
4. ✅ Messages tab has thread system
5. ✅ Files tab has drag-and-drop upload
6. ✅ Tasks tab has full task management
7. ✅ Team tab shows all members with permissions
8. ✅ All features connected to database (no mock data except reference)
9. ✅ Reference workspace kept for demo
10. ✅ User can manage job from hiring to completion in one interface

---

**END OF UI SPECIFICATION**

*This document ensures Phase 5B perfectly replicates the existing workspace mock UI for jobs.*
