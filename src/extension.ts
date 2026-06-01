import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    const provider = new MissionPortProvider();

    // Status bar
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'missionport.injectContext';
    context.subscriptions.push(statusBarItem);
    updateStatusBar(provider);

    // Sidebar tree view
    vscode.window.registerTreeDataProvider('missionport.notebooks', provider);

    // Commands
    context.subscriptions.push(
        vscode.commands.registerCommand('missionport.injectContext', () => {
            provider.injectContext();
        }),
        vscode.commands.registerCommand('missionport.refresh', () => {
            provider.refresh();
            updateStatusBar(provider);
        })
    );

    // Watch .missionport/ folder for changes
    const watcher = vscode.workspace.createFileSystemWatcher('**/.missionport/*.md');
    watcher.onDidChange(() => { provider.refresh(); updateStatusBar(provider); });
    watcher.onDidCreate(() => { provider.refresh(); updateStatusBar(provider); });
    watcher.onDidDelete(() => { provider.refresh(); updateStatusBar(provider); });
    context.subscriptions.push(watcher);
}

function updateStatusBar(provider: MissionPortProvider) {
    const files = provider.getMissionFiles();
    if (files.length > 0) {
        statusBarItem.text = `$(rocket) MissionPort: ${files.length} context file${files.length > 1 ? 's' : ''} loaded`;
        statusBarItem.tooltip = 'Click to inject mission context';
        statusBarItem.backgroundColor = undefined;
    } else {
        statusBarItem.text = `$(warning) MissionPort: No context`;
        statusBarItem.tooltip = 'Add .md files to .missionport/ folder';
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }
    statusBarItem.show();
}

class MissionPortProvider implements vscode.TreeDataProvider<MissionItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<MissionItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }

    getMissionFolder(): string | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) { return undefined; }
        return path.join(workspaceFolders[0].uri.fsPath, '.missionport');
    }

    getMissionFiles(): string[] {
        const folder = this.getMissionFolder();
        if (!folder || !fs.existsSync(folder)) { return []; }
        return fs.readdirSync(folder)
            .filter(f => f.endsWith('.md'))
            .map(f => path.join(folder, f));
    }

    getTreeItem(element: MissionItem): vscode.TreeItem {
        return element;
    }

    getChildren(): MissionItem[] {
        const files = this.getMissionFiles();
        if (files.length === 0) {
            return [new MissionItem(
                'No context files found',
                '',
                vscode.TreeItemCollapsibleState.None,
                'info'
            )];
        }
        return files.map(f => {
            const name = path.basename(f, '.md');
            const stat = fs.statSync(f);
            const ageHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);
            const stale = ageHours > 24;
            return new MissionItem(name, f, vscode.TreeItemCollapsibleState.None, stale ? 'stale' : 'active');
        });
    }

    injectContext() {
        const files = this.getMissionFiles();
        if (files.length === 0) {
            vscode.window.showWarningMessage(
                'MissionPort: No context files found. Add .md files to the .missionport/ folder in your workspace.'
            );
            return;
        }

        // Check for stale critical context
        const staleFiles = files.filter(f => {
            const stat = fs.statSync(f);
            const ageHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);
            return ageHours > 24;
        });

        if (staleFiles.length > 0) {
            const names = staleFiles.map(f => path.basename(f, '.md')).join(', ');
            vscode.window.showWarningMessage(
                `MissionPort: Stale context detected (${names}). Update before injecting into a critical session.`
            );
        }

        // Build the four-layer context block
        let contextBlock = '--- MISSIONPORT CONTEXT ---\n';
        contextBlock += `Injected: ${new Date().toISOString()}\n`;
        contextBlock += `Files: ${files.map(f => path.basename(f, '.md')).join(', ')}\n`;

        for (const f of files) {
            const name = path.basename(f, '.md');
            const content = fs.readFileSync(f, 'utf8');
            contextBlock += `\n${'='.repeat(40)}\n## ${name.toUpperCase()}\n${'='.repeat(40)}\n${content}\n`;
        }
        contextBlock += '\n--- END MISSIONPORT CONTEXT ---';

        vscode.env.clipboard.writeText(contextBlock).then(() => {
            vscode.window.showInformationMessage(
                'MissionPort: Context copied to clipboard. Paste into your agent session to begin.'
            );
        });
    }
}

class MissionItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly filePath: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly status: 'active' | 'stale' | 'info'
    ) {
        super(label, collapsibleState);

        if (status === 'active') {
            this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
            this.description = 'ready';
            this.tooltip = 'Context is fresh — ready to inject';
        } else if (status === 'stale') {
            this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('problemsWarningIcon.foreground'));
            this.description = 'stale — update before session';
            this.tooltip = 'Context file is older than 24 hours. Update from NotebookLM before injecting.';
        } else {
            this.iconPath = new vscode.ThemeIcon('info');
            this.tooltip = 'Add .md files to the .missionport/ folder in your workspace root';
        }

        if (filePath) {
            this.command = {
                command: 'vscode.open',
                title: 'Open',
                arguments: [vscode.Uri.file(filePath)]
            };
        }
    }
}

export function deactivate() {
    statusBarItem?.dispose();
}
