# The AI button (proton's Copilot) and Mox, the desktop's AI

Mox is the AI assistant on this website: a private AI workspace that runs a small language model inside your browser. Mox was created by Math-halper, who also made this website. proton offers it in two places: the AI button in the panel, which works like the Copilot button on Windows, and the Mox app in the Productivity section of the proton menu.

## Opening the AI pane

Click the AI button, the sparkle at the right end of the panel after the clock, or press Alt+C anywhere on the desktop. Mox docks along the right edge of the screen, above the panel, 420 pixels wide at first. Press Alt+C again (it works while you type in Mox too), click the AI button again, or click × in the pane's header to close it. Win+C belongs to the operating system, so proton uses Alt+C. On a Mac, Option+C typed into a text box still types the letter ç.

## What the desktop does while the AI pane is open

On a wide screen the desktop makes room for the pane, as Windows does for its docked Copilot: maximized windows, the desktop icons, the date hint and pop-up messages move to the pane's left instead of hiding under it, and new windows open in the space that is left. On a screen narrower than 760 pixels the pane covers the desktop instead.

## Resizing the AI pane

Drag the pane's left edge to make it wider or narrower, or click the edge and use the left and right arrow keys (hold Shift for bigger steps). The pane stays between 320 and 960 pixels wide and always leaves the desktop at least 240 pixels. The width is saved with your account.

## The AI pane's buttons

The pane's header shows the sparkle, the name Mox and "AI on this device · Alt+C", then three buttons: Reload restarts Mox, Open in a window closes the pane and opens Mox as a normal app window, and × closes the pane.

## The AI pane keeps your conversation

Mox's model is a 94 MB file, so it is only downloaded the first time you open the pane or the Mox app; a visit that never opens Mox never downloads it. Closing the pane only hides it: the conversation and the loaded model are still there when you open it again. The pane and the Mox app share the same chats, which Mox saves in this browser.

## Hiding the AI button

Customize > Desktop parts > "AI button in the panel (Mox, Alt+C)" hides or shows the button. The button also disappears if Mox is removed from the proton menu in App Center or Customize, and comes back when Mox is added back. If you rename Mox in Customize, the pane and the button use the new name.

## What Mox can do

Mox answers questions from its knowledge library and cites the passages it used, like [1] and [2]. The library covers maths, reading and writing, science, technology, humanities and life skills, plus the "proton desktop" topic about proton itself. Mox also has a code workspace with a live preview, an SVG drawing engine (ask it to draw something) and an exact calculator. You can add your own files for it to read.

## How Mox answers questions about proton

Mox finds the answer in this "proton desktop" guide. While its small bundled model is running, it answers a question about proton with the matching part of the guide, word for word, under the guide's heading and marked "From the proton desktop guide". The answer appears at once, and Regenerate asks the model to write one instead. A larger model, chosen in Mox's model picker, writes its own answers from the same pages.

## Can Mox see my files or my screen?

No. Mox cannot see your screen, your open windows or your proton Files. It only reads its own knowledge library and the documents you add to it yourself with Add your files, and those stay in this browser.

## Mox is private

Mox runs SmolLM2 135M Instruct, a small model by Hugging Face, with llama.cpp compiled to WebAssembly (wllama). Everything happens on your device: no account, no API key and no server, and nothing you type leaves the browser. Because the model is small its reasoning is limited, so check important details against the cited sources.
