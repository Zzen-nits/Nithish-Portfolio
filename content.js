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
    // words that type out after "Right now I'm building ..." on the home screen
    builds: ['campaigns', 'AI agents', 'brand stories', 'promo videos', 'waitlists'],
    // plain summary used at the top of the generated CV (Contact > Save my CV as PDF)
    cvSummary: 'VIT Vellore graduate working as HR at RoundU, an on-demand home services startup. Also handles brand and social media, and builds AI agents and campaigns with AI tools. Looking for an AI-first, remote role.',
    resumeUrl: '' // paste a link to your resume PDF here
  },

  links: [
    { label: 'Email', value: '', url: '' },
    { label: 'LinkedIn', value: '', url: '' },
    { label: 'GitHub', value: '', url: '' },
    { label: 'Instagram', value: '@zzen_nits', url: 'https://instagram.com/zzen_nits' }
  ],

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

  // category: 'AI' | 'Marketing' | 'Startup'. Fill the empty fields when you have them.
  projects: [
    {
      id: 'rag', title: 'University RAG helper bot', category: ['AI'],
      summary: 'A college project: an AI agent that answers university questions from documents.',
      tools: ['AI tools', 'RAG'], role: 'Built it', problem: 'Students dig through long documents to find simple answers.',
      did: 'Built an agent that reads the university documents and answers questions from them.', outcome: '', link: ''
    },
    {
      id: 'campaign', title: 'RoundU pre-launch campaign', category: ['Marketing', 'Startup', 'AI'],
      summary: 'A live waitlist, a 70-second no-person promo video and scene-by-scene AI video prompts in a Tamil-English tone.',
      tools: ['Veo', 'Gemini', 'Meta tools', 'Canva', 'Figma'], role: 'Ran it end to end',
      problem: 'A new home services app needs people waiting for it before it launches.',
      did: 'Set up the waitlist, scripted the promo, wrote the AI video prompts and planned the social content.', outcome: '', link: ''
    },
    {
      id: 'brand', title: 'RoundU brand and social setup', category: ['Marketing', 'Startup'],
      summary: 'Instagram and Facebook pages, the brand palette and a content plan.',
      tools: ['Meta Business Suite', 'Figma', 'Canva'], role: 'Brand and social lead',
      problem: 'A startup with no presence needs one that looks consistent.',
      did: 'Created the pages, defined the palette and planned the content.', outcome: '', link: ''
    },
    {
      id: 'agents', title: 'AI agents and vibe-coded builds', category: ['AI'],
      summary: 'Agents and small apps built with AI coding tools, including this site.',
      tools: ['AI tools'], role: 'Builder', problem: '', did: '', outcome: '', link: ''
    }
  ],

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

  workWithMe: 'Give me the goal and the deadline. I will bring a first draft quickly and ask when something is unclear.'
};
