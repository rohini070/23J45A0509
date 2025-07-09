# URL Shortener

A simple URL shortener application built with React. This application allows users to shorten long URLs and redirect to the original URLs when the shortened links are visited.

## Features

- Shorten long URLs to easy-to-share links
- Copy shortened URLs to clipboard
- Track click counts for shortened URLs
- Simple and responsive user interface
- No backend required (uses browser's localStorage)

## How It Works

1. Enter a long URL in the input field
2. Click "Shorten" to generate a short URL
3. Copy the shortened URL and share it
4. When someone visits the shortened URL, they'll be automatically redirected to the original URL

## Technologies Used

- React 18
- Create React App
- JavaScript (ES6+)
- HTML5 & CSS3

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rohini070/23J45A0509.git
   cd 23J45A0509/url-shortener
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Building for Production

To create a production build:

```bash
npm run build
```

This will create a `build` folder with optimized production files.

## Limitations

- URLs are stored in the browser's localStorage, so they're only accessible from the same browser on the same device
- No user accounts or authentication
- No custom short URLs (randomly generated codes only)

## Future Improvements

- Add user accounts and authentication
- Implement a backend service for persistent storage
- Add analytics and tracking
- Support for custom short URLs
- Set expiration dates for shortened URLs

## License

This project is licensed under the MIT License.
