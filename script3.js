class GitHubDarkTerminal {
    constructor() {
        this.files = [
            { name: "src/components/Header.jsx", status: "M", staged: false },
            { name: "src/styles/dark.css", status: "A", staged: false },
            { name: "package.json", status: "M", staged: false },
            { name: "README.md", status: "D", staged: false }
        ];
        this.commits = [
            { hash: "a1b2c3d", msg: "Initial commit" },
            { hash: "e4f5g6h", msg: "Add components" },
            { hash: "i7j8k9l", msg: "Fix styling" },
            { hash: "m0n1o2p", msg: "Update deps" }
        ];
        this.selectedFiles = new Set();
        this.render();
        this.attachEvents();
    }

    render() {
        this.renderFileTree();
        this.renderStaged();
        this.updateCounts();
        document.getElementById("commitTotal").innerText = this.commits.length;
    }

    renderFileTree() {
        const container = document.getElementById("fileTree");
        container.innerHTML = "";
        this.files.forEach(file => {
            const div = document.createElement("div");
            div.className = `file-item unstaged ${this.selectedFiles.has(file.name) ? 'selected' : ''}`;
            div.innerHTML = `
        <i class="fas fa-file-code"></i>
        <span>${file.name}</span>
        <span class="status-icon">${file.status}</span>
      `;
            div.onclick = () => {
                if (this.selectedFiles.has(file.name)) this.selectedFiles.delete(file.name);
                else this.selectedFiles.add(file.name);
                this.render();
            };
            container.appendChild(div);
        });
    }

    renderStaged() {
        const container = document.getElementById("stagedList");
        const stagedFiles = this.files.filter(f => f.staged);
        if (stagedFiles.length === 0) {
            container.innerHTML = '<div class="empty-staged">~ No files staged yet</div>';
        } else {
            container.innerHTML = stagedFiles.map(f => `
        <div class="staged-file">
          <i class="fas fa-check-circle" style="color:#2da44e"></i>
          <span>${f.name}</span>
        </div>
      `).join('');
        }
        document.getElementById("stagedCount").innerText = stagedFiles.length;
    }

    updateCounts() {
        const unstagedCount = this.files.filter(f => !f.staged).length;
        document.getElementById("changeCount").innerText = unstagedCount;
    }

    stageSelected() {
        let stagedAny = false;
        for (let name of this.selectedFiles) {
            const file = this.files.find(f => f.name === name);
            if (file && !file.staged) {
                file.staged = true;
                stagedAny = true;
            }
        }
        this.selectedFiles.clear();
        if (stagedAny) this.addToTerminal("✔ Staged selected files");
        this.render();
    }

    stageAll() {
        this.files.forEach(f => { if (!f.staged) f.staged = true; });
        this.addToTerminal("✔ Staged all changes");
        this.render();
    }

    commit() {
        const msgInput = document.getElementById("commitMsgInput");
        const message = msgInput.value.trim();
        const stagedFiles = this.files.filter(f => f.staged);
        if (stagedFiles.length === 0) {
            this.addToTerminal("✘ No files staged for commit", true);
            return;
        }
        const newHash = Math.random().toString(36).substring(2, 9);
        const commitMsg = message || `Update ${stagedFiles.length} files`;
        this.commits.push({ hash: newHash, msg: commitMsg });
        this.files = this.files.filter(f => !f.staged);
        msgInput.value = "";
        this.addToTerminal(`✔ [${newHash}] ${commitMsg}`);
        this.render();
    }

    push() {
        const localCount = this.commits.length;
        this.addToTerminal(`🚀 Pushing ${localCount} commits to origin/main...`);
        setTimeout(() => {
            document.getElementById("pushStatus").innerHTML = `Pushed ${new Date().toLocaleTimeString()}`;
            this.addToTerminal("✅ Push successful! origin/main updated");
        }, 800);
    }

    addToTerminal(msg, isError = false) {
        const output = document.getElementById("terminalOutput");
        const line = document.createElement("div");
        line.className = "output-line";
        line.innerHTML = `<span class="prompt">$</span> ${msg}`;
        if (isError) line.style.color = "#f85149";
        output.appendChild(line);
        line.scrollIntoView({ behavior: "smooth" });
    }

    attachEvents() {
        document.getElementById("stageSelectedBtn").onclick = () => this.stageSelected();
        document.getElementById("stageAllBtn").onclick = () => this.stageAll();
        document.getElementById("commitBtnTerm").onclick = () => this.commit();
        document.getElementById("pushBtnTerm").onclick = () => this.push();
    }
}

new GitHubDarkTerminal();