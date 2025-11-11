# LaTeX Formula Copy Assistant

English | [中文](README.md)

A browser extension that enables one-click copying of mathematical formulas from AI outputs to LaTeX format.

## Features

- Automatically detects mathematical formulas on web pages
- Shows copy button on hover
- One-click LaTeX source code copying to clipboard
- Supports dynamically loaded content
- Works with ChatGPT, Claude, Gemini, and other AI websites

## Installation

### Chrome/Edge Browser

1. Download or clone this project
2. Open your browser and navigate to the extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked extension"
5. Select the project folder

### Firefox Browser

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file from the project

## Usage

1. Visit a webpage containing mathematical formulas (e.g., ChatGPT, Deepseek)
2. Hover your mouse over a formula
3. Click the copy button that appears
4. LaTeX code is now copied to your clipboard!

## Supported Formats

- KaTeX rendered formulas
- MathJax rendered formulas
- Elements with `data-latex` attributes
- LaTeX code wrapped in `$$...$$` or `$...$`
