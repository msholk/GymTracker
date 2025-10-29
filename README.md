# Serverless Notes App

This project is a serverless application built with React and Firebase that allows users to manage their notes with user authentication. 

## Features

- User authentication with sign-in and sign-out options.
- Display of the application logo and logged-in user's information.
- CRUD operations for notes (Create, Read, Update, Delete).

## Project Structure

```
serverless-notes-app
├── public
│   └── index.html          # Main HTML file for the application
├── src
│   ├── components          # Contains React components
│   │   ├── Auth.tsx       # Handles user authentication
│   │   ├── Header.tsx     # Displays logo and user info
│   │   ├── Logo.tsx       # Renders the application logo
│   │   └── Notes.tsx      # Manages notes with CRUD operations
│   ├── firebase
│   │   └── config.ts      # Firebase configuration and initialization
│   ├── hooks
│   │   └── useAuth.ts     # Custom hook for authentication state
│   ├── types
│   │   └── index.ts       # TypeScript interfaces for User and Note
│   ├── App.tsx            # Main application component
│   ├── index.tsx          # Entry point of the React application
│   └── styles.css         # CSS styles for the application
├── package.json            # npm configuration file
├── tsconfig.json           # TypeScript configuration file
└── README.md               # Project documentation
```

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd serverless-notes-app
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Set up Firebase:
   - Create a Firebase project and enable authentication and Firestore.
   - Update the `src/firebase/config.ts` file with your Firebase configuration.

5. Start the application:
   ```
   npm start
   ```

## License

This project is licensed under the MIT License.