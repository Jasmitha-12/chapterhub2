import type { Domain } from '../types';

export const DOMAINS: Domain[] = [
  {
    id: 'documentation',
    name: 'Documentation',
    description: 'Meeting minutes, chapter reports, project wikis, post-event summaries and archives.',
    color: '#34A853', // Google Green
    icon: 'FileText',
  },
  {
    id: 'sponsorship',
    name: 'Sponsorship',
    description: 'Outreach, corporate partnerships, budgeting, proposals and community grants.',
    color: '#34A853', // Google Green
    icon: 'Handshake',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Audience growth, campaign strategies, cross-campus announcements and buzz.',
    color: '#4285F4', // Google Blue
    icon: 'Megaphone',
  },
  {
    id: 'logistics',
    name: 'Logistics',
    description: 'Hardware, swags, catering, attendee registration, audio-visual and ground support.',
    color: '#FBBC05', // Google Yellow
    icon: 'Boxes',
  },
  {
    id: 'social_media',
    name: 'Social Media',
    description: 'Instagram, LinkedIn, X/Twitter content, reels, stories and live coverage.',
    color: '#EA4335', // Google Red
    icon: 'Share2',
  },
  {
    id: 'event_management',
    name: 'Event Management',
    description: 'Planning, scheduling, speaker coordination, venue management and stage execution.',
    color: '#FBBC05', // Google Yellow
    icon: 'CalendarDays',
  },
  {
    id: 'tech_team',
    name: 'Tech Team',
    description: 'Code, cloud architecture, open source projects, workshops & hackathons.',
    color: '#4285F4', // Google Blue
    subTracks: ['Fullstack Development', 'AI/ML'],
    icon: 'Code2',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Visual storytelling, UI/UX design, brand graphics, illustrations and club artistry.',
    color: '#EA4335', // Google Red
    subTracks: ['Design', 'Arts'],
    icon: 'Palette',
  },
  {
    id: 'core_team',
    name: 'Core Team',
    description: 'Executive leadership, chapter strategy, operations management, cross-domain coordination and community guidance.',
    color: '#A142F4', // Google Purple
    icon: 'Users',
  },
];

export const getDomainById = (id: string): Domain | undefined => {
  return DOMAINS.find((d) => d.id === id);
};
