# Signing in and out of proton (log in, log out), accounts and locking

proton sits behind the Math Helper cover page. Every visit, and every refresh of the page, starts on that cover page, signed out.

## Signing in to proton for the first time

To sign in (log in) to proton, use the Sign in button in the Math Helper header. The first time on a device, type the desktop password into the header search bar right beside Sign in, then click Sign in. Pressing Enter in that search bar only searches maths skills and never opens the desktop, and a wrong password gets no visible response. With the right password the Create your account page appears.

## Creating your proton account

The Create your account page asks for a display name, a username (3 to 20 letters, numbers or underscores), an optional email that never leaves the device, and a password of at least 6 characters, typed twice. The button "Create account & enter desktop" opens your new desktop. Your avatar is your initials on a gray circle. Passwords are stored as salted SHA-256 hashes, never as plain text, and proton has no screen for changing an account's password later.

## Signing in again later

Once an account exists on a device, the password is not needed any more: click Sign in on the cover page and the account used last time reopens, with its desktop, files and settings just as you left them.

## The desktop password

The desktop password is set by whoever runs the site, in the file data/password.txt. It cannot be changed from Settings: the owner edits that file and reloads the site. Mox does not know the password and will not guess it; ask the site's owner. The password is a simple gate rather than real security, because the files of a static website can be read by anyone.

## Locking the desktop

Lock hides the desktop without signing out: the padlock button in the panel, Lock at the bottom of the proton menu, or Lock desktop in Settings. The lock screen shows your name and asks for the desktop password; type it and click Unlock, or choose Sign out instead.

## Signing out of proton

To sign out (log out) of proton, click Sign out at the bottom of the proton menu, or in Settings. Signing out, or refreshing the page, returns you to the Math Helper cover page. Your desktop, files and settings stay saved in this browser and come back the next time you sign in.

## More than one account

Each account has its own desktop, files and settings. Settings > Create another account adds another account on the same device, and Settings lists the accounts on this device. Settings > Delete my account & all its data removes the current account and everything it saved, for good.
