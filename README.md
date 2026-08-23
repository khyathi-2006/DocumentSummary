# Document Summary

A modern web application that allows users to upload documents and generate concise summaries from their content.

## Features

* 📄 Upload documents through an easy-to-use interface
* 📝 Extract text from supported documents
* 🤖 Generate concise document summaries
* 📊 Display extracted content and summaries clearly
* 🎨 Responsive and modern user interface
* ⚡ Fast development and production build using Vite
* 🔒 Client-side environment configuration support

## Tech Stack

* **Frontend:** React, TypeScript
* **Framework:** TanStack Start
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui
* **Package Manager:** Bun
* **Document Processing:** JavaScript/TypeScript utilities

## Project Structure

```text
DoumentSummary/
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── routes/
├── .gitignore
├── bun.lock
├── bunfig.toml
├── components.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* Bun

### Installation

Clone the repository:

```bash
git clone https://github.com/khyathi-2006/DoumentSummary.git
```

Move into the project directory:

```bash
cd DoumentSummary
```

Install dependencies:

```bash
bun install
```

### Run the Development Server

```bash
bun run dev
```

The application will be available at the local URL shown in the terminal.

## Build for Production

To create a production build:

```bash
bun run build
```

## Preview Production Build

```bash
bun run start
```

## Environment Variables

If the application requires environment variables, create a `.env` file in the project root and add the required configuration.

Do not commit sensitive credentials or API keys to GitHub.

## GitHub Repository

[DoumentSummary](https://github.com/khyathi-2006/DoumentSummary)

## License

This project is created for educational and development purposes.
