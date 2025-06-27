# Zenith-AI

Zenith-AI is a modern web application that leverages advanced AI to condense lengthy text into digestible summaries, saving you time and enhancing comprehension. With a clean, intuitive interface and powerful summarization features, Zenith-AI helps you read faster, understand more, and keep your knowledge organized.

## Features

- **AI-Powered Summarization:** Instantly distill long texts into concise, actionable summaries.
- **Key Point Extraction:** Understand the most important concepts at a glance.
- **Effortless Organization:** Keep your summaries organized and accessible in your workspace.
- **User Authentication:** Secure login and registration to protect your data.
- **Responsive Design:** Beautiful, modern UI that works on any device.

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use Zenith-AI.

## Usage

1. **Register** for a new account or **log in** with your credentials.
2. **Paste** your text into the workspace.
3. Click **Summarize** to generate an AI-powered summary and key points.
4. **Review** and **organize** your summaries for future reference.

## Project Structure

- `src/app/page.tsx`: Landing page with authentication check and feature highlights.
- `src/app/workspace/page.tsx`: Main workspace for text summarization.
- `src/app/components/Loading.tsx`: Shared loading spinner component.
- `src/app/auth/`: Authentication pages (login, register).
- `src/app/ChatWorkspace.tsx`: Core chat and summarization UI logic.
- `src/lib/api.ts`: API helpers for authentication and user management.

## Technologies Used

- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with improvements or bug fixes.

## License

This project is open source.
