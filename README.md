# Social Polling

A real-time polling application built with Next.js, Supabase, and Tailwind CSS. Create polls, vote, and see results in real-time.

## Features

- 🔐 User Authentication
- 📊 Real-time Poll Results
- 📱 Responsive Design
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast Performance with Next.js
- 🔄 Real-time Updates with Supabase

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/social-polling.git
   cd social-polling
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Enable Email Auth in Authentication settings
   - Create the following tables:
     ```sql
     -- polls table
     create table polls (
       id uuid default uuid_generate_v4() primary key,
       title text not null,
       user_id uuid references auth.users not null,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null
     );

     -- poll_options table
     create table poll_options (
       id uuid default uuid_generate_v4() primary key,
       poll_id uuid references polls not null,
       text text not null,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null
     );

     -- votes table
     create table votes (
       id uuid default uuid_generate_v4() primary key,
       poll_id uuid references polls not null,
       option_id uuid references poll_options not null,
       user_id uuid references auth.users not null,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null,
       unique(poll_id, user_id)
     );
     ```

## Running the Application

1. **Development mode**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Production build**
   ```bash
   npm run build
   npm start
   # or
   yarn build
   yarn start
   ```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

or alternatively you can use vercel cli command to deploy a production build.

### Other Platforms

The application can be deployed to any platform that supports Next.js applications:

- Netlify
- AWS Amplify
- Digital Ocean
- Heroku

## Project Structure

```
social-polling/
├── src/
│   ├── components/     # Reusable components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and configurations
│   ├── pages/         # Next.js pages
│   └── styles/        # Global styles
├── public/            # Static assets
└── ...config files
```
