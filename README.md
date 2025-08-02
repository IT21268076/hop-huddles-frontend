# HOP Huddles Frontend

AI-powered micro-education platform for healthcare compliance training.

## Features

- **Agency Management**: Create and manage healthcare agencies with multi-tenant isolation
- **User Management**: Role-based user assignments with discipline-specific targeting
- **Huddle Sequences**: AI-generated micro-learning content with personalized delivery
- **Progress Tracking**: Real-time learning progress and completion analytics
- **Scheduling**: Automated huddle release with customizable frequency
- **Multi-format Learning**: PDF + audio voiceover for flexible learning experiences
- **Analytics Dashboard**: Comprehensive insights and performance metrics

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context + Custom Hooks
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see backend documentation)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hop-huddles-frontend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Update environment variables in `.env`

5. Start development server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements (Button, Input, etc.)
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   └── common/         # Common components (DataTable, etc.)
├── contexts/           # React Context providers
├── pages/              # Page components
│   ├── dashboard/      # Dashboard and home
│   ├── agencies/       # Agency management
│   ├── users/          # User management
│   ├── sequences/      # Huddle sequence management
│   ├── my-huddles/     # Learning experience
│   ├── progress/       # Progress tracking
│   ├── analytics/      # Analytics and reporting
│   ├── scheduling/     # Release scheduling
│   └── settings/       # Application settings
├── services/           # API client and external services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
└── App.tsx            # Main application component
```

## Key Features Implementation

### Multi-Tenant Architecture
- Agency-based data isolation
- Role-based access control
- Branch and team organization

### AI-Powered Content Generation
- RAG-based content retrieval
- LLM-generated micro-learning
- Personalized targeting by role/discipline

### Progressive Learning Experience
- Step-by-step huddle progression
- Real-time progress tracking
- Interactive assessments
- Multi-format content delivery

### Comprehensive Analytics
- User engagement metrics
- Completion rate tracking
- Performance insights
- Exportable reports

## User Roles & Permissions

- **Admin**: Full agency management and user administration
- **Educator**: Content creation and sequence management
- **Branch Manager**: Branch-level management and oversight
- **Field Clinician**: Learning experience and huddle completion
- **Preceptor**: Mentoring and progress monitoring
- **Scheduler**: Release scheduling and automation

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Write meaningful commit messages

### Component Guidelines
- Keep components focused and reusable
- Use composition over inheritance
- Implement proper prop validation
- Handle loading and error states
- Follow accessibility best practices

### State Management
- Use React Context for global state
- Implement custom hooks for reusable logic
- Use local state for component-specific data
- Implement proper state initialization

## API Integration

The frontend integrates with the HOP Huddles backend API for:
- Agency and user management
- Content creation and delivery
- Progress tracking and analytics
- File upload and management
- Real-time notifications

See the backend API documentation for detailed endpoint information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.