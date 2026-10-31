# Mox

Mox is one of the apps in the Productivity section of the start menu. Its menu description: "Ask a private AI that runs in your browser - a bundled language model, a cited knowledge library, a code workspace and a calculator."

Mox is the desktop's AI: a private AI workspace whose language model runs inside your browser. Mox is made by Math-halper, the maker of this website (github.com/Math-halper/mox). The Mox app shows Mox's page in a window, with Reload and Open in new tab in its bar. The AI button in the panel (or Alt+C) shows the same Mox in a pane docked on the right; the two share chats.

Inside Mox:

- **Chat**: type in the "Ask anything" box and press Enter. Mox finds matching passages in its knowledge library and answers with numbered citations like [1], shown as source chips under the answer. Copy and Regenerate sit under each answer. The library has topics for maths, reading and writing, science, technology, humanities, life skills, and "proton desktop" about proton itself.
- **Sidebar**: New chat (Ctrl+K), Search the library, Workspace (Ctrl+Shift+E), Calculator (Ctrl+J), your saved chats, the knowledge library switch with its topic chips, and your own files.
- **Workspace**: a small code editor with a live preview. Mox can write and change files there when you ask it to make something.
- **Drawing**: ask Mox to draw something and it makes a real SVG picture.
- **Calculator**: exact arithmetic. Questions that are just a sum are answered by the calculator, not the model.
- **Your files**: add documents (text, Markdown, PDF and more) and Mox searches them too. They stay in this browser.
- **Models**: the bundled model is SmolLM2 135M Instruct (94 MB). Choose a model offers larger optional models to download and lets you upload your own .gguf file.

Questions about proton itself are answered from the "proton desktop" pages of the library; while the small bundled model runs, Mox shows the matching part of the page word for word, and Regenerate asks the model instead. The model downloads the first time Mox opens, then runs on your own processor; nothing you type leaves the browser. It is a small model, so check important details against the cited sources. If the model cannot start, Mox works in search-only mode and shows the matching passages instead.

Where Mox comes from: Mox ships with this app, from Math-halper/mox, and its library knows every part of this desktop. Its model runs on this device: the first launch reads 94 MB from this site, and nothing you type leaves the browser.

To open Mox, click the menu button with the atom logo at the left end of the panel and choose Mox under Productivity, or type its name into the menu's search box.
