# Built-in sites and the Test Page

The Browser app can show built-in sites: pages stored inside proton and opened at addresses that start with proton://. There is one, the Test Page, listed in the Browser's "Built-in websites…" menu.

## The Test Page

The Test Page, at proton://test-page, is the smoke test for a proton build. It runs automated checks that prove the Browser's frame really runs scripts, timers, canvas drawing, fetch requests and storage, and that the page can talk to the desktop. Its buttons talk back to the desktop too: Run checks again, Click me, Echo it, Save and Clear, Go to Browser home, and buttons that open apps. Open it from the Browser's menu of built-in sites, from the Browser's start page, or by typing its address in the address bar.

## The Browser's own pages

Besides the Test Page, the Browser has its start page (home), search results (search), a reader that shows any file of proton with your search words marked (read), and the Bookmarks and History pages. HTML pages from the file system open at file:/// addresses, and ordinary web addresses load the real page in a sandboxed frame.

## No adding sites

Everything on proton is part of the same static site. There is no way to add a site or make an app from a web address inside proton, although the Browser can still visit any address you type, without saving it.
