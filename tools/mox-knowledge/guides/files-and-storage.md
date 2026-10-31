# Files, folders and the two file systems

proton has a real file system with folders and files, managed by the Files app. Every Open and Save on proton can use either of two file systems.

## The two file systems on proton

- **proton Files** (the proton file system): folders and files kept inside this browser, in your account. This is what the Files app shows.
- **Your Files** (this computer): the real files on your device, through the browser's normal file picker and downloads.

Whenever an app opens or saves something, it asks which one to use. The Text Editor, Files, Image Viewer, VLC, PDF Viewer, Settings backups, Customize icon uploads and Web Retro's ROM picker all work with both.

## Your home folder

Your own files live in your home folder, /home/ followed by your username. A new account's home folder has the folders Desktop, Documents, Pictures and Downloads, plus the files Documents/Welcome.txt, Documents/Ideas.txt and README.txt. You can create, rename, move, copy and delete anything in your home folder. Paint saves its pictures into Pictures.

## The read-only proton system tree

Everything outside your home folder, starting at /, is the proton system: every file of this website itself (the apps, the games, the code and the documentation). You can browse, open, read and download these files, but you cannot change them. Opening one in the Text Editor gives an editable draft, and "Save a copy…" stores it in your home folder.

## Importing files and downloading them

- **To import files** from your computer into proton, open Files and press Import, then pick the files: Import copies them into the folder Files is showing. Text files stay editable as text; anything else (pictures, music, video, PDFs, ROMs) is stored as its exact bytes, up to 2 MB per file.
- **Download** in Files saves a file back to your computer. Several files, or a whole folder, download as one ZIP file.

## Which app opens which file

Double-clicking a file opens it in the app made for it: web pages (.html) in the Browser, PDFs in PDF Viewer, pictures (PNG, JPG, GIF, WebP, AVIF, BMP, ICO, SVG) in Image Viewer, audio and video (MP3, WAV, OGG, MP4, WebM, MKV, AVI and many more) in VLC, and other text files (.txt, .md, .js, .css, .json and so on) in the Text Editor. Anything no app claims, such as a .zip, opens in Files with the file selected, so you can still inspect or download it.

## Where your files are saved

Your proton Files are saved inside this browser, in its local storage, as part of your account. They are not saved on a server and never uploaded anywhere. They stay when you sign out or refresh, but clearing the browser's site data deletes them. Settings > Backup exports your whole account, files included, as one .json file, and imports it again on any browser. If the browser's storage fills up, proton shows "Storage is full — some changes could not be saved".

## Other ways to reach your files

The Terminal app works on the same files with commands such as ls, cd, cat, mkdir, cp, mv and rm. Desktop shortcuts can point at any file or folder, and the Browser opens HTML pages from the file system at file:/// addresses.
