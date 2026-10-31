# Terminal

Terminal is one of the apps in the Tools section of the start menu. Its menu description: "A small shell over your proton Files: ls, cd, cat, open."

Terminal is a small command-line shell over your proton Files, the same files the Files app shows. Type a command and press Enter; the up and down arrows bring back earlier commands. Commands:

- help: list the commands
- ls [folder], cd <folder> (cd .. goes up, cd alone goes home), pwd, tree [folder]
- cat <file>, echo <text>, nano <file> (a small editor: Ctrl+S saves, Ctrl+X exits)
- mkdir [-p] <folder>, touch <file>, rm [-r] <path>, cp <from> <to>, mv <from> <to>
- find <text>, stat <path>, open <app> (for example, open paint), date, whoami, clear

There are no pipes or redirection, and nothing in the terminal can touch your real computer: paths stay inside proton's file system, and proton's own read-only files refuse changes.

To open Terminal, click the menu button with the atom logo at the left end of the panel and choose Terminal under Tools, or type its name into the menu's search box.
