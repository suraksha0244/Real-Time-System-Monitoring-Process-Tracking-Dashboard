# Git Collaboration Workflow – From Both Perspectives  
(Suraksha as the main owner, you and Shreyas as collaborators)  

---

## 🔹 Perspective 1: Suraksha (Main Owner)  

### 1️⃣ Initial Setup: Create & Upload Project to GitHub  
*(She has already done this)*  
- Initialized a Git repository  
- Added project files  
- Pushed to GitHub  

### 2️⃣ Add Collaborators  
Suraksha needs to add you and Shreyas as collaborators:  

1. Go to **GitHub → Repository → Settings → Collaborators**  
2. Click **"Manage Access" → "Invite Collaborator"**  
3. Enter your **GitHub usernames** and invite  

Now, both of you can push changes directly.  

---

## 🔹 Perspective 2: You & Shreyas (Collaborators)  

### 1️⃣ Clone the Repository (First Time Setup)  
You and Shreyas need to **clone** the repo to your local system:  

```sh
git clone https://github.com/Suraksha/RepoName.git
```

Move into the directory:  

```sh
cd RepoName
```

### 2️⃣ Create a New Branch for Your Changes  
Each collaborator should work on a separate branch to avoid conflicts:  

```sh
git checkout -b feature-branch
```

Example:  

```sh
git checkout -b add-login-functionality
```

### 3️⃣ Make Changes & Push Your Work  
After making code changes:  

```sh
git add .
git commit -m "Added login functionality"
git push origin feature-branch
```

### 4️⃣ Create a Pull Request (PR)  
1. Go to **GitHub → Repository → Pull Requests**  
2. Click **"New Pull Request"**  
3. Select **base branch** (usually `main`) and **compare branch** (`feature-branch`)  
4. Add a **description** and click **"Create Pull Request"**  

---

## 🔹 Perspective 3: Suraksha (Main Owner Reviewing PRs)  

### 1️⃣ Review & Merge Pull Requests  
Suraksha will:  
1. Go to **GitHub → Pull Requests**  
2. Click on the PR  
3. Review changes, comment if needed  
4. Click **"Merge Pull Request"** if everything is fine  
5. Delete the merged branch (optional)  

---

## 🔹 Final Step: Keep Local Repositories Updated  

After merging, **all collaborators** (including Suraksha) should update their local repo:  

```sh
git checkout main
git pull origin main
```

If you're working on a branch:  

```sh
git checkout feature-branch
git merge main
```

Now everyone has the latest changes! 🎉  

---

## 🔹 Summary of the Flow  

1️⃣ **Suraksha** creates the repo and adds collaborators  
2️⃣ **Collaborators (You & Shreyas) clone the repo and create a branch**  
3️⃣ **Make changes → Commit → Push to GitHub**  
4️⃣ **Create a Pull Request for review**  
5️⃣ **Suraksha reviews & merges the PR**  
6️⃣ **All collaborators pull the latest updates**  

🚀 **This ensures smooth collaboration without conflicts!** 🚀  
