import { Question } from '@/contexts/QuizContext';

// Mock questions with placeholder images for demonstration
// In a real application, these would be loaded from your database
export const mockQuestions: Question[] = [
  {
    id: 'q1',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop',
    choices: {
      A: 'Binary Search Tree',
      B: 'Linked List',
      C: 'Array',
      D: 'Hash Table'
    },
    correctChoice: 'A'
  },
  {
    id: 'q2',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
    choices: {
      A: 'O(1)',
      B: 'O(log n)',
      C: 'O(n)',
      D: 'O(n²)'
    },
    correctChoice: 'B'
  },
  {
    id: 'q3',
    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=400&fit=crop',
    choices: {
      A: 'TCP',
      B: 'UDP',
      C: 'HTTP',
      D: 'FTP'
    },
    correctChoice: 'A'
  },
  {
    id: 'q4',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
    choices: {
      A: 'Machine Learning',
      B: 'Database Design',
      C: 'Web Development',
      D: 'Mobile Development'
    },
    correctChoice: 'A'
  },
  {
    id: 'q5',
    image: 'https://images.unsplash.com/photo-1526378800651-c32d170fe6f8?w=600&h=400&fit=crop',
    choices: {
      A: 'SQL',
      B: 'NoSQL',
      C: 'GraphQL',
      D: 'REST API'
    },
    correctChoice: 'A'
  },
  {
    id: 'q6',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&h=400&fit=crop',
    choices: {
      A: 'React',
      B: 'Angular',
      C: 'Vue.js',
      D: 'Svelte'
    },
    correctChoice: 'A'
  },
  {
    id: 'q7',
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&h=400&fit=crop',
    choices: {
      A: 'Python',
      B: 'JavaScript',
      C: 'Java',
      D: 'C++'
    },
    correctChoice: 'B'
  },
  {
    id: 'q8',
    image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop',
    choices: {
      A: 'Git',
      B: 'SVN',
      C: 'Mercurial',
      D: 'CVS'
    },
    correctChoice: 'A'
  },
  {
    id: 'q9',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    choices: {
      A: 'Docker',
      B: 'Kubernetes',
      C: 'Jenkins',
      D: 'AWS'
    },
    correctChoice: 'A'
  },
  {
    id: 'q10',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop',
    choices: {
      A: 'Encryption',
      B: 'Authentication',
      C: 'Authorization',
      D: 'Validation'
    },
    correctChoice: 'A'
  },
  {
    id: 'q11',
    image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&h=400&fit=crop',
    choices: {
      A: 'Agile',
      B: 'Waterfall',
      C: 'Scrum',
      D: 'DevOps'
    },
    correctChoice: 'A'
  },
  {
    id: 'q12',
    image: 'https://images.unsplash.com/photo-1555952494-efd681c7e3f9?w=600&h=400&fit=crop',
    choices: {
      A: 'API Gateway',
      B: 'Load Balancer',
      C: 'Cache',
      D: 'CDN'
    },
    correctChoice: 'B'
  },
  {
    id: 'q13',
    image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&h=400&fit=crop',
    choices: {
      A: 'Mobile-First',
      B: 'Desktop-First',
      C: 'Progressive Enhancement',
      D: 'Graceful Degradation'
    },
    correctChoice: 'A'
  },
  {
    id: 'q14',
    image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=600&h=400&fit=crop',
    choices: {
      A: 'Unit Testing',
      B: 'Integration Testing',
      C: 'End-to-End Testing',
      D: 'Performance Testing'
    },
    correctChoice: 'C'
  },
  {
    id: 'q15',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
    choices: {
      A: 'Microservices',
      B: 'Monolith',
      C: 'Serverless',
      D: 'Container'
    },
    correctChoice: 'A'
  },
  {
    id: 'q16',
    image: 'https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?w=600&h=400&fit=crop',
    choices: {
      A: 'Redis',
      B: 'MongoDB',
      C: 'PostgreSQL',
      D: 'MySQL'
    },
    correctChoice: 'A'
  },
  {
    id: 'q17',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop',
    choices: {
      A: 'OAuth 2.0',
      B: 'JWT',
      C: 'SAML',
      D: 'OpenID Connect'
    },
    correctChoice: 'B'
  },
  {
    id: 'q18',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop',
    choices: {
      A: 'Webpack',
      B: 'Rollup',
      C: 'Parcel',
      D: 'Vite'
    },
    correctChoice: 'D'
  },
  {
    id: 'q19',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    choices: {
      A: 'TensorFlow',
      B: 'PyTorch',
      C: 'Scikit-learn',
      D: 'Keras'
    },
    correctChoice: 'A'
  },
  {
    id: 'q20',
    image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=600&h=400&fit=crop',
    choices: {
      A: 'REST',
      B: 'GraphQL',
      C: 'gRPC',
      D: 'WebSocket'
    },
    correctChoice: 'B'
  }
];