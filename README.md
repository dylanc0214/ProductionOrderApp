# Production Order Management App (SuDu AI Pre-Task)

A mobile application built with React Native (Expo) to manage Production Orders, featuring local SQLite storage and an AI assistant simulation.

## 1. Setup Instructions
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install

## 2. Technical Notes
### Architecture
- **screens/**  
  Contains all main UI screens such as Dashboard and Create PO.

- **components/**  
  Reusable UI components like cards and buttons.

- **database/**  
  Handles SQLite initialization and database operations.

- **context/**  
  Manages global state using React Context for Production Orders.

- **types/**  
  Centralized TypeScript type definitions to ensure type safety.

## 3. AI Usage Log
| Prompt | AI Response Summary | How I Applied It |
|------|---------------------|------------------|
| Best folder structure for React Native Expo app with TypeScript | Suggested using a `src` directory with separation between screens, components, services, and types | Adopted a `src`-based structure to keep UI, logic, and data management clean and scalable |
| Give me the command for install the whole dependencies to setup the environment: I will use React Native, Expo SQLite, React Context, React Native Paper, React Navigation | Provided a combined install command covering navigation, SQLite, UI library, and safe-area dependencies | Used the command to install all required dependencies efficiently in one step |