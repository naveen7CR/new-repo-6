// Git Push Simulation Engine — moderate + higher complexity with reactive state

class GitSimulator {
    constructor() {
        // Core state
        this.commits = [
            { hash: "a1b2c3d", message: "Initial project scaffold", timestamp: new Date(Date.now() - 120000) },
            { hash: "e4f5g6h", message: "Add responsive layout", timestamp: new Date(Date.now() - 60000) }
        ];
        this.unstagedFiles = [
            { name: "src/app.js", type: "js", staged: false },
            { name: "styles/main.css", type: "css", staged: false },
            { name: "README.md", type: "md", staged: false }
        ];
        this.stagedFiles = [];
        this.remoteAhead = 0;         // simulate remote commits divergence
        this.lastPushHash = null;
        this.pushCount = 0;

        // DOM elements
        this.commitHistoryEl = document.getElementById("commitHistory");
        this.unstagedFilesContainer = document.getElementById("unstagedFiles");
        this.stagedFilesList = document.getElementById("stagedFilesList");
        this.terminalOutput = document.getElementById("terminalOutput");
        this.commitBtn = document.getElementById("commitBtn");
        this.stageAllBtn = document.getElementById("stageAllBtn");
        this.pushBtn = document.getElementById("pushBtn");
        this.commitMessageInput = document.getElementById("commitMessage");
        this.commitCountSpan = document.getElementById("commitCount");
        this.lastPushStatusSpan = document.getElementById("lastPushStatus");

        this.initEventListeners();
        this.renderAll();
        this.addLog("🚀 GitFlow initialized — ready for atomic pushes", "info");
    }

    addLog(message, type = "info") {
        const logDiv = document.createElement("div");
        logDiv.className = `log-line ${type}`;
        const prefix = type === "error" ? "❌ " : type === "success" ? "✔ " : "$ ";
        logDiv.innerHTML = `${prefix} ${message}`;
        this.terminalOutput.appendChild(logDiv);
        logDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
        // keep log tidy but not overloaded
        if (this.terminalOutput.children.length > 25) {
            this.terminalOutput.removeChild(this.terminalOutput.children[0]);
        }
    }

    renderCommitHistory() {
        this.commitHistoryEl.innerHTML = "";
        this.commits.slice().reverse().forEach(commit => {
            const div = document.createElement("div");
            div.className = "commit-item";
            div.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <div class="commit-detail">
          <strong>${commit.hash}</strong> - ${commit.message}
          <span class="commit-time">${this.formatTime(commit.timestamp)}</span>
        </div>
      `;
            this.commitHistoryEl.appendChild(div);
        });
        this.commitCountSpan.innerText = this.commits.length;
    }

    formatTime(date) {
        const diff = Date.now() - date;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins === 1) return "1 min ago";
        return `${mins} mins ago`;
    }

    renderUnstaged() {
        this.unstagedFilesContainer.innerHTML = "";
        this.unstagedFiles.forEach(file => {
            const chip = document.createElement("div");
            chip.className = "file-chip";
            chip.setAttribute("data-file", file.name);
            chip.innerHTML = this.getFileIcon(file.name) + " " + file.name;
            chip.addEventListener("click", (e) => {
                e.stopPropagation();
                this.stageSingleFile(file.name);
            });
            this.unstagedFilesContainer.appendChild(chip);
        });
    }

    getFileIcon(filename) {
        if (filename.endsWith(".js")) return "📜";
        if (filename.endsWith(".css")) return "🎨";
        if (filename.endsWith(".md")) return "📘";
        return "📄";
    }

    renderStaged() {
        this.stagedFilesList.innerHTML = "";
        if (this.stagedFiles.length === 0) {
            this.stagedFilesList.innerHTML = '<div class="empty-staged">✨ No staged files. Click "Stage All" or any file.</div>';
            this.commitBtn.disabled = true;
        } else {
            this.commitBtn.disabled = false;
            this.stagedFiles.forEach(file => {
                const chip = document.createElement("div");
                chip.className = "staged-file-chip";
                chip.innerHTML = `${this.getFileIcon(file.name)} ${file.name}`;
                this.stagedFilesList.appendChild(chip);
            });
        }
    }

    stageSingleFile(filename) {
        const fileIndex = this.unstagedFiles.findIndex(f => f.name === filename);
        if (fileIndex !== -1) {
            const [file] = this.unstagedFiles.splice(fileIndex, 1);
            this.stagedFiles.push({ ...file, staged: true });
            this.addLog(`Staged: ${filename}`, "success");
            this.renderAll();
        }
    }

    stageAllChanges() {
        if (this.unstagedFiles.length === 0) {
            this.addLog("No unstaged changes to stage.", "info");
            return;
        }
        const moved = [...this.unstagedFiles];
        this.stagedFiles.push(...moved.map(f => ({ ...f, staged: true })));
        this.unstagedFiles = [];
        this.addLog(`Staged ${moved.length} file(s) successfully.`, "success");
        this.renderAll();
    }

    createCommit() {
        if (this.stagedFiles.length === 0) {
            this.addLog("Nothing to commit — stage changes first.", "error");
            return false;
        }
        let message = this.commitMessageInput.value.trim();
        if (!message) {
            message = "Update: " + this.stagedFiles.map(f => f.name).join(", ");
        }
        const newHash = Math.random().toString(36).substring(2, 9);
        const newCommit = {
            hash: newHash,
            message: message,
            timestamp: new Date()
        };
        this.commits.push(newCommit);
        // clear staged files after commit (simulate real git)
        this.stagedFiles = [];
        this.commitMessageInput.value = "";
        this.addLog(`[${newHash}] committed: "${message}" (${this.commits.length} total commits)`, "success");
        this.renderAll();
        return true;
    }

    async pushToRemote() {
        if (this.commits.length === 0) {
            this.addLog("No commits to push. Please make a commit first.", "error");
            return;
        }

        // simulate remote divergence (if user pushes twice, we add fake remote commits for advanced scenario)
        const localCommitCount = this.commits.length;
        let lastPushCommitHash = this.lastPushHash ? this.lastPushHash : null;

        if (lastPushCommitHash && this.commits[this.commits.length - 1].hash === lastPushCommitHash) {
            this.addLog("Everything up-to-date, no new commits to push.", "info");
            return;
        }

        // advanced: check if remote would reject? we simulate a force-with-lease style: reject if remote advanced
        if (this.pushCount > 0 && this.remoteAhead > 0 && !window.confirmSim) {
            this.addLog("⚠️ Remote has newer commits! Use --force-with-lease? (Simulating safe push)", "error");
            this.addLog("🔄 Trying force-with-lease: rebasing mentally... success", "success");
            // simulate force-with-lease acceptance
        }

        this.addLog(`Pushing ${this.commits.length - (this.lastPushHash ? this.commits.findIndex(c => c.hash === this.lastPushHash) + 1 : 0)} commits to origin/main...`, "info");

        // simulate network delay
        await this.delay(600);
        this.pushCount++;
        this.lastPushHash = this.commits[this.commits.length - 1].hash;
        this.remoteAhead = 0;  // after push, remote is in sync
        this.lastPushStatusSpan.innerText = `Pushed at ${new Date().toLocaleTimeString()}`;
        this.addLog(`✅ Successfully pushed commits to origin/main (${this.commits.length} total commits on remote).`, "success");

        // after push, reset unstaged demo if any, but we keep existing
        this.renderAll();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    renderAll() {
        this.renderCommitHistory();
        this.renderUnstaged();
        this.renderStaged();
    }

    initEventListeners() {
        this.stageAllBtn.addEventListener("click", () => this.stageAllChanges());
        this.commitBtn.addEventListener("click", () => this.createCommit());
        this.pushBtn.addEventListener("click", () => this.pushToRemote());

        // double-click on log to clear (nice easter egg)
        this.terminalOutput.addEventListener("dblclick", () => {
            this.terminalOutput.innerHTML = '<div class="log-line welcome">$ git status — terminal cleared ✨</div>';
            this.addLog("Terminal cleared. Ready for next commands.", "info");
        });
    }
}

// initialize the whole simulation after DOM ready
document.addEventListener("DOMContentLoaded", () => {
    window.gitSim = new GitSimulator();

    // Optional: extra UI effect - tooltip on push button
    const pushBtn = document.getElementById("pushBtn");
    pushBtn.addEventListener("mouseenter", () => {
        if (gitSim.commits.length === 0) pushBtn.style.opacity = "0.7";
    });
    pushBtn.addEventListener("mouseleave", () => pushBtn.style.opacity = "1");
});