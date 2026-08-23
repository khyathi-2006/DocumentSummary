# 📄 Document Summary Assistant

A modern, browser-based document summarization application that allows users to upload **PDF documents or scanned images**, extract their text, and generate concise summaries with important key points.

The application performs document processing directly in the browser using PDF parsing, OCR, and a custom extractive summarization algorithm — **no external AI API or API key is required**.

## 🚀 Live Demo

**Live Application:**  
[https://doument-summary.vercel.app/](https://doument-summary.vercel.app/)

**GitHub Repository:**  
https://github.com/khyathi-2006/DoumentSummary

---

## ✨ Features

- 📄 Upload PDF, JPG, and PNG documents
- 🖱️ Drag-and-drop file upload
- 📁 File picker support
- 🖼️ Image preview after upload
- 📊 Display file name and file size
- 📑 Extract text from PDF documents
- 🔍 OCR support for scanned images
- 🤖 Automatic document summarization
- 📝 Generate Short, Medium, or Long summaries
- 📌 Extract important key points
- ⚡ Instant summary regeneration when summary length changes
- 🔄 Clear processing and loading states
- ❌ User-friendly error handling
- 🔁 Retry processing when an error occurs
- 📱 Responsive interface for desktop and mobile
- 🔐 No API keys required
- 🌐 Runs entirely in the browser

---

## 🖥️ How It Works

The application follows a simple document-processing pipeline:

```text
        Upload Document
               │
               ▼
      ┌─────────────────┐
      │ File Validation │
      └────────┬────────┘
               │
        ┌──────┴───────┐
        │              │
       PDF         JPG / PNG
        │              │
        ▼              ▼
   PDF Parsing        OCR
   pdfjs-dist       Tesseract.js
        │              │
        └──────┬───────┘
               │
               ▼
        Extracted Text
               │
               ▼
       Text Processing
               │
               ▼
    Extractive Summarization
               │
        ┌──────┴───────┐
        │              │
     Summary       Key Points
        │              │
        └──────┬───────┘
               ▼
        Display Results
