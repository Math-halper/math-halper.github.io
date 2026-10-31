# VLC

VLC is one of the apps in the Media section of the start menu. Its menu description: "VLC media player — the open-source libvlc engine compiled to WebAssembly; plays audio and video itself."

VLC is a port of the open-source VLC media player to proton: the real libvlc engine compiled to WebAssembly, so it plays audio and video formats the browser cannot play by itself, such as MKV, AVI, WMV and FLAC. It looks like desktop VLC 3, with the orange traffic-cone icon.

- **Menus**: Media (Open file…, Open folder…, Open URL…, Open in a new browser tab, Show in Files, Download / save copy…, Save playlist…, Quit VLC), Playback (Play / Pause, Stop, Previous, Next, Go to time…), Audio (Mute / unmute, Add audio track…), Video (Fullscreen, Take snapshot), Subtitle (Add subtitle file…), Tools (Start VLC engine, Enable VLC engine, Media information, Codec information, Messages), View (Playlist, Minimal interface, Fullscreen) and Help (Keyboard shortcuts, About this VLC port).
- **Controls**: a playlist sidebar, the video, a seek bar, play, pause, stop, previous, next, repeat, shuffle, speed, volume, fullscreen and track selection for audio and subtitles. Video > Take snapshot (Shift+S) saves a screenshot of the current frame.
- **Keyboard**: the desktop VLC hotkeys, including Space play or pause, S stop, N and P next and previous, F fullscreen, M mute, Ctrl+Up and Ctrl+Down volume, the arrow keys with Shift, Alt or Ctrl to seek, + and - for speed, B and V to switch audio and subtitle tracks, L repeat, R shuffle and Alt+Enter to open the file in a new browser tab. Help > Keyboard shortcuts lists them all.

**First use**: libvlc needs a special browser mode called cross-origin isolation. The first time, VLC shows an Enable VLC engine button; press it and proton reloads once, then VLC plays. Browsers only allow sound after a click, so VLC starts its sound on your first click and offers Enable audio if the browser still holds it back.

**New browser tab**: Media > Open in a new browser tab, the New tab button or Alt+Enter plays the current file in a tab of its own with the same player and shortcuts, continuing from the same moment. A file picked from your computer cannot move to a tab; save a copy into proton Files first.

To open VLC, click the menu button with the atom logo at the left end of the panel and choose VLC under Media, or type its name into the menu's search box.
