var SITE_DATA = {
  projects: [
    {
      id: 'storyline-templates',
      category: 'articulate-storyline',
      categoryLabel: 'Articulate Storyline',
      title: 'Storyline Design Templates',
      description: 'Reusable templates built for varied course types, with clean interactions and flexible visual structure.',
      image: 'assets/images/Cool Morning Layout-01.png',
      links: [
        { label: 'View Templates', chatAction: 'templates', primary: true }
      ]
    },
    {
      id: 'amazon-s3',
      category: 'articulate-rise',
      categoryLabel: 'Articulate Rise',
      title: 'Amazon S3 Foundations',
      description: 'Mock course on what Amazon S3 is, with custom visuals and self-produced support media.',
      image: 'assets/images/AmazonS3.png',
      links: [
        { label: 'Open Course', url: 'https://portfolio-mishler.s3.us-east-1.amazonaws.com/amazon-simple-storage-service-s-3-scorm12-dlGyxMXv+(1)/scormcontent/index.html#/', primary: true, external: true },
        { label: 'View ADDIE Deck', url: 'assets/docs/aws-interview-presentation.pdf', external: true }
      ]
    },
    {
      id: 'prompt-engineering',
      category: 'video',
      categoryLabel: 'Video',
      title: 'Prompt Engineering: Motion Graphics',
      description: 'Opener sequence for a prompt engineering foundations course, produced in Premiere Pro and After Effects.',
      image: 'https://img.youtube.com/vi/z3SW13BI75I/hqdefault.jpg',
      links: [
        { label: 'Watch Video', url: 'https://www.youtube.com/watch?v=z3SW13BI75I', primary: true, external: true }
      ]
    },
    {
      id: 'amazon-neptune',
      category: 'video',
      categoryLabel: 'Video',
      title: 'Amazon Neptune: Benefits Overview',
      description: 'Course intro video emphasizing graph database value, performance, and AWS integration.',
      image: 'https://img.youtube.com/vi/3wmJUfle6EI/hqdefault.jpg',
      links: [
        { label: 'Watch Video', url: 'https://www.youtube.com/watch?v=3wmJUfle6EI', primary: true, external: true }
      ]
    },
    {
      id: 'filmmaking',
      category: 'video',
      categoryLabel: 'Video',
      title: 'Filmmaking and Motion Graphics',
      description: 'End-to-end personal production demonstrating filming, edit flow, and branded motion graphics.',
      image: 'https://img.youtube.com/vi/i701lCj4bB8/hqdefault.jpg',
      links: [
        { label: 'Watch Video', url: 'https://www.youtube.com/watch?v=i701lCj4bB8', primary: true, external: true }
      ]
    },
    {
      id: 'hybrid-cloud',
      category: 'video',
      categoryLabel: 'Video',
      title: 'Hybrid Cloud Adoption Essentials',
      description: 'Module opener on hybrid cloud concepts with fast-paced, high-clarity motion graphics.',
      image: 'https://img.youtube.com/vi/esGU4i85siY/hqdefault.jpg',
      links: [
        { label: 'Watch Video', url: 'https://www.youtube.com/watch?v=esGU4i85siY', primary: true, external: true }
      ]
    },
    {
      id: 'addie-method',
      category: 'pdf',
      categoryLabel: 'PDF',
      title: 'ADDIE Method Presentation',
      description: 'A structured walkthrough of analysis, design, development, implementation, and evaluation decisions.',
      image: 'assets/images/ADDIE.png',
      links: [
        { label: 'Open PDF', url: 'assets/docs/aws-interview-presentation.pdf', primary: true, external: true },
        { label: 'Open S3 Course', url: 'https://portfolio-mishler.s3.us-east-1.amazonaws.com/amazon-simple-storage-service-s-3-scorm12-dlGyxMXv+(1)/scormcontent/index.html#/', external: true }
      ]
    }
  ],

  blog: {
    featured: {
      title: 'Designing Better AI-Assisted Learning Experiences',
      date: 'February 2026',
      summary: 'How to blend instructional design fundamentals with modern AI tools while keeping learner outcomes at the center.',
      quote: 'The goal is not to add AI everywhere. The goal is to remove friction for learners and strengthen transfer.'
    },
    upcoming: [
      {
        title: 'When to Use Video in Technical Training',
        summary: 'A framework for deciding where motion design clarifies, and where it distracts.'
      },
      {
        title: 'Cloud Concepts Without the Jargon',
        summary: 'Tactics for teaching cloud foundations to mixed technical and non-technical audiences.'
      },
      {
        title: 'Prompting Workflows for L&D Teams',
        summary: 'Reusable prompt patterns for faster design drafts, storyboard ideation, and quality checks.'
      }
    ]
  },

  about: {
    intro: 'For 13+ years, Evan has translated technical complexity into clear, useful learning experiences. Today that work focuses heavily on cloud technologies and generative AI.',
    kpis: [
      { value: '13+', label: 'Years in L&D' },
      { value: 'AWS', label: 'Certified' },
      { value: 'MBA', label: 'Business Lens' }
    ],
    approach: {
      heading: 'Start with the human, not the tech',
      text: 'Evan\'s work bridges the gap between "What does this even do?" and "Now I get it, and I can use it." He designs learning paths around learner context, practical examples, and clear language.',
      quote: 'Great training is empathy in action: understand the learner\'s starting line, then design a path to confident performance.'
    },
    focusAreas: [
      'Instructional Design',
      'Generative AI',
      'Cloud Foundations',
      'Storyline & Rise',
      'Video Production',
      'Learning Strategy'
    ],
    toolkit: [
      {
        title: 'Generative AI',
        tags: ['Workflow Integration', 'Brainstorming', 'Content Creation', 'Automation']
      },
      {
        title: 'eLearning Authoring',
        tags: ['Articulate Storyline 360', 'Articulate Rise', 'SCORM', 'xAPI']
      },
      {
        title: 'Adobe Creative Suite',
        tags: ['Premiere Pro', 'Audition', 'Photoshop', 'Illustrator']
      },
      {
        title: 'Cloud Technologies',
        tags: ['AWS Compute', 'AWS Storage', 'AWS Serverless', 'AWS AI/ML']
      }
    ],
    certifications: [
      { title: 'Google Cloud Generative AI Leader', issuer: 'Google Cloud', year: '2025' },
      { title: 'AWS Certified AI Practitioner', issuer: 'AWS', year: '2024' },
      { title: 'AWS Certified Cloud Practitioner', issuer: 'AWS', year: '2023' }
    ],
    education: [
      { degree: 'Master of Business Administration', school: 'Virginia Commonwealth University, Richmond, VA', year: '2013' },
      { degree: 'Bachelor of Arts, Economics', school: 'West Virginia University, Morgantown, WV', year: '2009', note: 'Business Minor' }
    ]
  },

  contact: {
    email: 'mishler.evan@gmail.com',
    linkedin: 'https://www.linkedin.com/in/evan-mishler-32699651/',
    linkedinLabel: '/in/evan-mishler',
    engagementTypes: [
      'Instructional Design',
      'eLearning Development',
      'Course Media Production',
      'AI Workflow Integration',
      'Cloud Learning Content'
    ]
  },

  templates: {
    intro: 'Custom visual frameworks designed to improve engagement, trust, and clarity across digital learning experiences.',
    approach: 'Evan enjoys building design systems that make learning feel professional, approachable, and easy to navigate. Each template is crafted to support instructional goals, not just aesthetics.',
    approachQuote: 'Learners form trust in seconds. A strong visual framework helps them feel oriented and ready to learn.',
    items: [
      { title: 'City Life', theme: 'Urban, modern, dynamic', desc: 'Best for workplace scenarios, operational training, and practical corporate modules.', image: 'assets/images/City Life Layout-01.png' },
      { title: 'Cool Morning', theme: 'Professional, calm, sophisticated', desc: 'Strong fit for leadership content, executive communication, and strategic learning.', image: 'assets/images/Cool Morning Layout-01.png' },
      { title: 'Gradient', theme: 'Modern, tech-forward, innovative', desc: 'Designed for technical onboarding, software training, and innovation-focused programs.', image: 'assets/images/Gradient Layout-01.png' },
      { title: 'Minimalist', theme: 'Clean, focused, distraction-free', desc: 'Ideal for policy, compliance, and content where precision and clarity matter most.', image: 'assets/images/Minimalist Layout-01.png' },
      { title: 'Pop', theme: 'Vibrant, energetic, engaging', desc: 'Useful for product education, launches, and training that benefits from high energy.', image: 'assets/images/Pop Layout-01.png' },
      { title: 'Watercolor', theme: 'Creative, warm, approachable', desc: 'Well-suited for soft skills, culture, and people-first development programs.', image: 'assets/images/Watercolor Layout-01.png' }
    ],
    principles: [
      { title: 'Visual Hierarchy', desc: 'Clear structure guides learners through content naturally and reduces cognitive noise.' },
      { title: 'Purposeful Design', desc: 'Every element earns its place by supporting comprehension and retention.' },
      { title: 'Learner-Centered', desc: 'Templates are adaptable so content can match audience needs and context.' }
    ]
  }
};
