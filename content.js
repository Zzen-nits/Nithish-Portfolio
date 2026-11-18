/*
  EDIT THIS FILE to change anything on the site. No other file needs touching.
  - Leave a url as '' and the site shows it as "to add".
  - Skill levels are drafts: change them to what is honest for you.
  - Languages: check the Tamil and Hindi spellings before you publish.
*/
window.CONTENT = {
  profile: {
    name: 'Nithish',
    headline: 'AI-first builder and operator.',
    pitch: "I turn ideas into working products, campaigns and agents, and I'm still sneezing out new skills every month.",
    bio: [
      "Hi, I'm Nithish. I'm a VIT Vellore graduate and I work as HR at RoundU, an on-demand home services startup.",
      "Alongside HR, I handle brand and social media, and I build AI agents, including a university RAG helper bot, using vibe coding and AI tools. I speak Tamil, English, Hindi and Nepali.",
      "I'm looking for an AI-first, remote role where I can build with people who care about doing things well."
    ],
    availability: 'Open to remote, AI-first roles',
    location: 'Coimbatore', // shown next to the live clock; the day/night sky follows this city's time
    timezone: 'Asia/Kolkata',
    // words that type out after "Right now I'm building ..." on the home screen
    builds: ['campaigns', 'AI agents', 'brand stories', 'promo videos', 'waitlists'],
    // plain summary used at the top of the generated CV (Contact > Save my CV as PDF)
    cvSummary: 'VIT Vellore graduate working as HR at RoundU, an on-demand home services startup. Also handles brand and social media, and builds AI agents and campaigns with AI tools. Looking for an AI-first, remote role.',
    resumeUrl: '', // paste a link to your resume PDF here
    // Contact form. Leave both empty and the form says it is not connected. To receive messages in your email, make a free
    // account at a form service (for example formspree.io or web3forms.com) and paste its address here; for Web3Forms also paste the key.
    formEndpoint: '', // e.g. 'https://formspree.io/f/xxxxxxx' or 'https://api.web3forms.com/submit'
    formKey: '',
    formNote: 'Your name, email and message are emailed to me and used only to reply.' // shown under the form once it is connected
  },

  links: [
    { label: 'Email', value: '', url: '' },
    { label: 'LinkedIn', value: '', url: '' },
    { label: 'GitHub', value: '', url: '' },
    { label: 'Instagram', value: '@zzen_nits', url: 'https://instagram.com/zzen_nits' }
  ],

  // "At a glance" tiles at the top of About. These only use facts already on this page.
  // Replace or add real numbers when you have them (reach, hires closed, followers, signups...).
  proof: [
    { value: '4', label: 'languages spoken' },
    { value: '1', label: 'university RAG agent built' },
    { value: '70 s', label: 'AI promo video scripted' },
    { value: '1', label: 'live startup waitlist run' }
  ],

  // The "Now" panel on the home screen. "Learning" is taken automatically from the learning list below (status 'now').
  now: { building: 'AI agents and campaigns', looking: 'An AI-first, remote role' },

  // Scene 03: how you work with AI. These steps are a draft: rewrite them in your own words.
  aiWorkflow: {
    lede: "I don't write much traditional code. I describe the goal clearly, let AI tools build the first version, then check it until it is right.",
    steps: [
      { t: 'Frame it', d: 'Write down the goal, who it is for and the deadline before touching a tool.' },
      { t: 'Prompt it', d: 'Describe it in plain words and let an AI tool produce a first version fast.' },
      { t: 'Check it', d: 'Read the output, test it with real inputs and fix what is off.' },
      { t: 'Ship it', d: 'Publish a working version, then improve it from what people say.' }
    ],
    tools: ['Gemini', 'Veo', 'AI coding tools', 'RAG', 'Figma', 'Canva', 'Meta Business Suite'],
    example: {
      title: 'Example: this portfolio',
      before: 'A written design brief and a lot of ideas.',
      after: 'A live, scroll-driven 3D site, built by describing it to AI and reviewing every change.'
    }
  },

  // Real quotes only. Leave empty until you have them; nothing shows on the site while this list is empty.
  // Add  ?edit  to the address to see where they will appear.
  testimonials: [
    // { quote: 'Write the real sentence here.', name: 'Their name', role: 'Their role, company' }
  ],

  // A short "hello" from you. Paste a link to a video (.mp4, .webm), an audio file (.mp3, .m4a) or a YouTube link.
  // Nothing shows while src is empty. Add  ?edit  to the address to see where it will appear.
  hello: { src: '', caption: "Hi, I'm Nithish. A 30-second hello." },

  education: [
    { school: 'VIT Vellore', degree: 'Graduate', years: '' } // add your branch and graduation year here if you want them shown
  ],

  experience: [
    {
      role: 'HR',
      org: 'RoundU',
      summary: 'On-demand home services app, pre-launch. Works as HR, and also handles brand and social media and runs the live waitlist and promo content.',
      when: 'Now'
    },
    {
      role: 'Social media and marketing',
      org: 'Tech Arnik',
      summary: 'Manages Facebook and Instagram pages for an agency portfolio in Meta Business Suite, as admin.',
      when: ''
    }
  ],

  funFacts: [
    'Tamil, English, Hindi and Nepali',
    'Builds with AI, light on traditional code',
    'Never seen without glasses'
  ],

  skillGroups: ['AI', 'Design and content', 'Marketing and operations', 'Code'],

  // level: 'Beginner' | 'Intermediate' | 'Strong'
  skills: [
    { name: 'AI agents and RAG', group: 'AI', level: 'Intermediate', proof: 'Built a university RAG helper bot that answers from documents.' },
    { name: 'Vibe coding', group: 'AI', level: 'Intermediate', proof: 'Ships small apps and agents with AI coding tools.' },
    { name: 'AI video prompts', group: 'AI', level: 'Strong', proof: 'Wrote scene-by-scene prompts for a 70-second RoundU promo.' },
    { name: 'Figma', group: 'Design and content', level: 'Intermediate', proof: 'Used for RoundU brand and layouts.' },
    { name: 'Canva', group: 'Design and content', level: 'Intermediate', proof: 'Quick social posts and promo assets. Beginner to intermediate.' },
    { name: 'Video scripting', group: 'Design and content', level: 'Intermediate', proof: 'Tamil-English tone for the RoundU promo.' },
    { name: 'Meta tools', group: 'Marketing and operations', level: 'Strong', proof: 'Business Suite, Facebook and Instagram pages, as admin.' },
    { name: 'Social media management', group: 'Marketing and operations', level: 'Strong', proof: 'Runs RoundU and agency pages.' },
    { name: 'Startup operations', group: 'Marketing and operations', level: 'Intermediate', proof: 'Waitlist, brand and content plan.' },
    { name: 'Traditional coding', group: 'Code', level: 'Beginner', proof: 'Very little. The strength is building with AI.' }
  ],

  // status: 'done' | 'now' | 'next'
  learning: [
    { title: 'Meta Business Suite and social media', what: 'Managing pages, content and audiences as an admin.', tools: 'Meta tools', status: 'done' },
    { title: 'Figma and Canva', what: 'Brand, layouts and quick social assets.', tools: 'Figma, Canva', status: 'done' },
    { title: 'AI video generation', what: 'Scene-by-scene prompts for a no-person promo video.', tools: 'Veo, Gemini', status: 'done' },
    { title: 'RAG and AI agents', what: 'A university helper bot that answers from documents.', tools: 'AI tools, RAG', status: 'done' },
    { title: 'Vibe coding', what: 'Building real apps and this portfolio with AI coding tools.', tools: 'AI tools', status: 'now' },
    { title: 'A first AI-first remote role', what: 'Building with a team that cares about quality.', tools: '', status: 'next' }
  ],

  // The filter buttons above the project cards (All is added for you).
  projectFilters: ['AI', 'Marketing', 'HR', 'Startup'],

  // category: any of the filters above. how = the "How I built it" steps on the back of the card (drafts: rewrite them).
  // Fill the empty fields when you have them.
  projects: [
    {
      id: 'rag', title: 'University RAG helper bot', category: ['AI'],
      summary: 'A college project: an AI agent that answers university questions from documents.',
      tools: ['AI tools', 'RAG'], role: 'Built it', problem: 'Students dig through long documents to find simple answers.',
      how: ['Start from the problem: long documents, simple questions.', 'Give the university documents to an AI agent (RAG).', 'Let it answer only from those documents.', 'Try it with real questions and fix the gaps.'],
      did: 'Built an agent that reads the university documents and answers questions from them.', outcome: '', link: ''
    },
    {
      id: 'campaign', title: 'RoundU pre-launch campaign', category: ['Marketing', 'Startup', 'AI'],
      summary: 'A live waitlist, a 70-second no-person promo video and scene-by-scene AI video prompts in a Tamil-English tone.',
      tools: ['Veo', 'Gemini', 'Meta tools', 'Canva', 'Figma'], role: 'Ran it end to end',
      problem: 'A new home services app needs people waiting for it before it launches.',
      how: ['Set up the live waitlist.', 'Script a 70-second promo with no people in it.', 'Write scene-by-scene prompts for AI video (Veo, Gemini) in a Tamil-English tone.', 'Plan the social posts around it in Meta tools, Canva and Figma.'],
      did: 'Set up the waitlist, scripted the promo, wrote the AI video prompts and planned the social content.', outcome: '', link: ''
    },
    {
      id: 'brand', title: 'RoundU brand and social setup', category: ['Marketing', 'Startup'],
      summary: 'Instagram and Facebook pages, the brand palette and a content plan.',
      tools: ['Meta Business Suite', 'Figma', 'Canva'], role: 'Brand and social lead',
      problem: 'A startup with no presence needs one that looks consistent.',
      how: ['Create the Instagram and Facebook pages.', 'Define the navy, orange and white palette in Figma.', 'Plan a content calendar and make posts in Canva.'],
      did: 'Created the pages, defined the palette and planned the content.', outcome: '', link: ''
    },
    {
      id: 'agents', title: 'AI agents and vibe-coded builds', category: ['AI'],
      summary: 'Agents and small apps built with AI coding tools, including this site.',
      tools: ['AI tools'], role: 'Builder', problem: '', did: '', outcome: '', link: '',
      how: ['Describe what I want in plain language.', 'Let AI coding tools build the first version.', 'Test it, fix it, ship it.']
    },
    {
      id: 'hr', title: 'HR at RoundU', category: ['HR', 'Startup'],
      summary: 'My day job: the people side of an on-demand home services startup.',
      tools: [], role: 'HR', problem: '', did: '', outcome: '', link: '', how: []
    }
  ],

  // The quick language quiz (Languages scene). Each word needs ta, hi and ne. Please check every spelling.
  quiz: {
    words: [
      { en: 'Hello', ta: 'வணக்கம்', hi: 'नमस्ते', ne: 'नमस्ते' },
      { en: 'Thank you', ta: 'நன்றி', hi: 'धन्यवाद', ne: 'धन्यवाद' },
      { en: 'Yes', ta: 'ஆம்', hi: 'हाँ', ne: 'हो' },
      { en: 'No', ta: 'இல்லை', hi: 'नहीं', ne: 'होइन' },
      { en: 'Please', ta: 'தயவுசெய்து', hi: 'कृपया', ne: 'कृपया' },
      { en: 'Water', ta: 'தண்ணீர்', hi: 'पानी', ne: 'पानी' },
      { en: 'Friend', ta: 'நண்பர்', hi: 'दोस्त', ne: 'साथी' },
      { en: 'Good morning', ta: 'காலை வணக்கம்', hi: 'सुप्रभात', ne: 'शुभ प्रभात' },
      { en: 'Welcome', ta: 'நல்வரவு', hi: 'स्वागत है', ne: 'स्वागत छ' },
      { en: 'Food', ta: 'சாப்பாடு', hi: 'खाना', ne: 'खाना' }
    ]
  },

  // The sneeze. One bubble per language. text is real text, not an image.
  languages: [
    { name: 'English', native: 'English', code: 'en', greeting: 'Hello', sneeze: 'Ah-choo!', sample: 'Nice to meet you.', style: 'burst' },
    { name: 'Tamil', native: 'தமிழ்', code: 'ta', greeting: 'வணக்கம்', sneeze: 'ஆச்சூ!', sample: 'உங்களை சந்தித்ததில் மகிழ்ச்சி.', style: 'speech' },
    { name: 'Hindi', native: 'हिन्दी', code: 'hi', greeting: 'नमस्ते', sneeze: 'आ-छीं!', sample: 'आपसे मिलकर खुशी हुई।', style: 'speech' },
    { name: 'Nepali', native: 'नेपाली', code: 'ne', greeting: 'नमस्ते', sneeze: 'आक्छी!', sample: 'तपाईंलाई भेटेर खुसी लाग्यो।', style: 'speech' }
  ],
  aside: 'Dust. Again.',

  traits: [
    { label: 'Ships things', text: 'Prefers a working first version to a perfect plan.' },
    { label: 'Learns fast', text: 'Picks up a new tool in days and uses it on a real job.' },
    { label: 'Plain talker', text: 'Says what is done, what is not and what is next.' },
    { label: 'Honest about gaps', text: 'Light on traditional code, and says so.' }
  ],
  // Your own answers for the "Ask me" box (Ctrl or Cmd + K). keys = words that should trigger it.
  faq: [
    // { q: 'What is your favourite tool?', keys: ['favourite', 'favorite'], a: 'Write your own answer here.' }
  ],

  // YOUR OWN VOICE. Record short clips (a phone voice memo is fine), save them as .mp3 or .m4a in a folder called "audio"
  // next to index.html, then write the file name here, for example 'audio/hello.mp3'.
  // Anything left as '' keeps working with a device voice or the built-in sound, so you can add clips one at a time.
  voice: {
    hello: '',                                       // a "Hear my hello" button on the home screen
    languages: { en: '', ta: '', hi: '', ne: '' },   // "Hear it" on each language card: you saying the greeting and sample sentence
    sneeze: { en: '', ta: '', hi: '', ne: '' },      // your own sneeze, used instead of the built-in one when sound is on
    bless: { en: '', ta: '', hi: '', ne: '' }        // your reply to "Say bless you" (for example "Thank you")
  },
  // Optional, per quiz word: add  voice: { ta: 'audio/hello-ta.mp3', hi: '', ne: '' }  to a word in quiz.words below.

  // Clues for the hidden secrets, shown one at a time (easiest first) when a visitor picks "Give me a hint" in the Ask box.
  // Keep them as riddles. Edit the wording freely; the order is the order they are given.
  secretHints: [
    { id: 'achoo', clue: 'He sniffles now and then. Something is tickling his nose.' },
    { id: 'bless', clue: 'After a sneeze, it is polite to say something.' },
    { id: 'specs', clue: 'His glasses look a little smudgy. Give them a wipe.' },
    { id: 'boing', clue: 'His hair has some spring in it. Try a poke.' },
    { id: 'wardrobe', clue: 'Fancy a new outfit? Try his chest.' },
    { id: 'sundial', clue: 'The sun and the moon are not just decoration.' },
    { id: 'orange', clue: 'Triple-click the word in the logo, top left, and watch the colours.' },
    { id: 'spark', clue: 'The little orange dot in the logo likes attention. Poke it quickly, a few times.' },
    { id: 'roundu', clue: 'Type the name of the place he works, anywhere on the page.' },
    { id: 'konami', clue: 'An old gamer code: four arrows, then left and right twice, then two letters.' },
    { id: 'nap', clue: 'Leave him alone for half a minute. He gets sleepy.' },
    { id: 'polyglot', clue: 'Get every answer right in the language quiz.' }
  ],

  workWithMe: 'Give me the goal and the deadline. I will bring a first draft quickly and ask when something is unclear.'
};
