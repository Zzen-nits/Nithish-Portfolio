Nithish portfolio (round 5)

HOW TO RUN IT
1. Save all of these files together in D:\Nithish-Portfolio\ :
   index.html, styles.css, app.js, content.js, avatar3d.js, favicon.png, og-image.png (plus an audio folder if you add voice clips)
2. Double-click index.html to open it. No internet is needed except for the Google fonts, which fall back to system fonts.
3. Edit ONLY content.js to change text, numbers, links and answers. No other file needs touching.
4. Add  ?edit  to the address (index.html?edit) to see the empty slots for the hello clip and the quotes.
5. Add  ?face=svg  to force the flat face instead of the 3D one.

WHAT IS NEW IN ROUND 3
Interactive
- The sky follows Coimbatore time: day before 18:30, night after (stars, moon, white headings). Click the sun or moon to flip it.
- The 3D face reacts to what you hover (desktop): he leans in on projects, nods on skills, looks toward language cards.
- Hidden wardrobe: click his tee. White tee, RoundU logo tee, navy hoodie, RoundU cap. It is remembered next visit.
- More hidden secrets (12 in total, the Ask box counts them): click the glasses, click his hair, click the sun, the Konami code,
  triple-click the word Nithish in the logo (all-orange RoundU mode), plus the earlier ones (nose, achoo, bless, nap, roundu, logo poke, polyglot).
- Projects: filter chips (AI, Marketing, HR, Startup) and a "How I built it" flip on every card.
- Language quiz: 5 questions such as "How do you say No in Tamil?", with a Hear-it button after each answer.
Not interactive
- Proof tiles at the top of About, a "Now" panel on the home screen, a "How I work with AI" scene,
  a testimonials slot, a 30-second hello slot, a favicon and a share image with the avatar.

ROUND 4 ADDITIONS
- Hands: the avatar now has a forearm, a palm and a thumb, and a bent-elbow wave.
- Hints for the secrets: after the first find a "Secrets n/12" chip appears (click it to open Ask me). In Ask me choose
  "Give me a hint" for one riddle at a time (easiest first). Hovering a hidden spot makes him look curious, and one gentle
  "Psst" message appears per visit if nothing is found after a minute. Edit the riddles in content.js (secretHints).
- YOUR OWN VOICE (content.js > voice): record short clips, save them in a folder called "audio" next to index.html and write the
  file names, for example 'audio/hello.mp3'. Slots: hello (a "Hear my hello" button on the home screen), languages (Hear it on each
  language card), sneeze (used instead of the built-in sneeze when sound is on), bless (your reply to "Say bless you"), and optional
  clips per quiz word. Anything left empty keeps the device voice or built-in sound. Upload the audio folder with the other files.
- CONTACT FORM: the form is not connected until you set profile.formEndpoint in content.js (and formKey for Web3Forms).
  Messages then arrive in your email and are kept in the form service's dashboard. The site itself stores nothing.

ROUND 5 CHANGES
- The numbered 01-08 dots at the bottom are gone. The top menu still links every section, and the small "01 / 08" counter stays.
- Click his glasses: he takes an orange cloth and wipes the right lens, then the left, and they sparkle at the end (about 4 seconds).

FILES
- content.js   all the words. Quiz words, proof numbers, "how I built it" steps and the AI workflow are DRAFTS: please check and rewrite.
- avatar3d.js  the 3D face, including the RoundU logo that is printed on the tee and the cap.
- favicon.png  the small tab icon (his face).
- og-image.png the picture shown when the link is shared. Before sharing, change "og-image.png" in index.html to the full web
               address of the file once the site is online, because chat apps need the full address.

THINGS TO FILL IN
- Email, LinkedIn, GitHub and resume link (empty ones show as "to add").
- Real numbers in "proof" when you have them (reach, hires, followers, signups).
- Real quotes in "testimonials". Nothing shows while the list is empty.
- hello.src: a link to your video, audio or YouTube hello. Nothing shows while it is empty.
- Outcome, problem and link fields on each project.
- Tamil, Hindi and Nepali spellings (languages and the quiz). Please have a native reader check them.

WHAT THE FLAT FACE CAN AND CANNOT DO
- If a device cannot run WebGL2, the flat face is used automatically. The wardrobe, glasses and hair eggs need the 3D face.
  Everything else works with the flat face.

OLDER FEATURES (unchanged)
- Intro wake-up animation, embers, sleepy after 30 seconds, typing line, time-of-day hello.
- Hidden nose easter egg: click his nose (or type  achoo ) and he sneezes in four languages. Sound is off by default.
- Ask me / command menu: Ctrl+K (Cmd+K) or "/". Prepared answers from content.js, not a live AI. Add your own in "faq".
- Contact > Save my CV as PDF builds a one-page CV from content.js.
- Reduced-motion setting turns off the intro, embers and animations.
