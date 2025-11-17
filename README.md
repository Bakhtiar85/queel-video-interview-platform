# Queel Video Interview Platform

A modern, full-stack video interview platform built with Next.js that enables recruiters to create jobs with custom interview questions and candidates to record video responses asynchronously.

## Features

### For Recruiters

- **Job Management**: Create and manage job postings with custom interview questions
- **Candidate Submissions**: Review video submissions from candidates
- **Dashboard**: Centralized view of all jobs and submissions
- **Secure Links**: Generate unique interview links for candidates

### For Candidates

- **Camera Setup**: Test camera and microphone before starting
- **Demo Recording**: Practice recording before the actual interview
- **Multi-Take System**: Record up to 3 attempts per question
- **Review & Select**: Review all attempts and choose the best one
- **Progress Tracking**: Visual feedback on upload progress

### General

- **Authentication**: Secure login and signup system
- **Theme Support**: Dark/light mode toggle
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with shadcn/ui components

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite with Prisma ORM
- **State Management**: Zustand
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Theme**: next-themes
- **TypeScript**: Full type safety

## Prerequisites

- Node.js 18+
- npm or yarn
- SQLite

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd queel-video-interview-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./prisma/dev.db"
```

### 4. Initialize the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
queel-video-interview-platform/
├── app/                          # Next.js app router
│   ├── (auth)/                  # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── candidate/          # Candidate endpoints
│   │   └── recruiter/          # Recruiter endpoints
│   ├── dashboard/              # Recruiter dashboard
│   │   └── jobs/              # Job management
│   └── interview/             # Candidate interview interface
├── components/                 # React components
│   └── ui/                    # UI components
│       ├── candidate/         # Candidate-specific components
│       └── ...               # shadcn/ui components
├── lib/                       # Utility functions
├── prisma/                    # Database schema and migrations
├── store/                     # Zustand stores
└── types/                     # TypeScript type definitions
```

## Key Components

### Video Recording System

- **CameraSetup.tsx**: Handles camera/microphone permissions and setup
- **VideoRecorder.tsx**: Core video recording functionality
- **QuestionRecorder.tsx**: Multi-take recording with review capabilities
- **UploadProgress.tsx**: Upload progress visualization

### Authentication

- **authStore.ts**: Zustand store for authentication state
- **API routes**: `/api/auth/login` and `/api/auth/signup`

### Database Schema

The Prisma schema includes:

- **User**: Recruiter accounts
- **Job**: Job postings with questions
- **Candidate**: Candidate information
- **CandidateAnswer**: Video responses to questions

## API Routes

### Authentication

- `POST /api/auth/signup` - Create new recruiter account
- `POST /api/auth/login` - Login to recruiter account

### Recruiter

- `GET /api/recruiter/jobs` - List all jobs
- `POST /api/recruiter/jobs` - Create new job
- `GET /api/recruiter/submissions` - List all submissions
- `GET /api/recruiter/submissions/[candidateId]` - Get specific submission

### Candidate

- `GET /api/candidate/job?linkId=xxx` - Get job details by link
- `POST /api/candidate/submit` - Submit video answer
- `POST /api/candidate/complete` - Complete interview

## Development

### Database Management

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Build for Production

```bash
npm run build
npm start
```

## Features in Detail

### Multi-Take Recording System

Candidates can:

1. Record up to 3 attempts per question
2. Review all recorded attempts
3. Select the best attempt to submit
4. Re-record if not satisfied (within the 3-attempt limit)

### Demo Recording

Before starting the actual interview, candidates can:

- Practice with a demo question
- Test their camera and microphone
- Get familiar with the recording interface

### Theme Support

The platform includes a universal theme toggle that allows users to switch between light and dark modes, with preferences saved locally.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please contact [your-email@example.com] or open an issue in the repository.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
