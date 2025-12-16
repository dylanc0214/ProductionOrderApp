# Production Order Management App (SuDu AI Pre-Task)

A mobile application built with React Native (Expo) to manage Production Orders, featuring local SQLite storage and an AI assistant simulation.

## 1. Setup Instructions
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
3. Run the program:
   ```bash
   npx expo start

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

### Challenges & Assumptions
- Faced Error about "Render Error"

## 3. AI Usage Log
| Prompt | AI Response Summary | How I Applied It |
|------|---------------------|------------------|
| Best folder structure for React Native Expo app with TypeScript | Suggested using a `src` directory with separation between screens, components, services, and types | Adopted a `src`-based structure to keep UI, logic, and data management clean and scalable |
| Give me the command for install the whole dependencies to setup the environment: I will use React Native, Expo SQLite, React Context, React Native Paper, React Navigation | Provided a combined install command covering navigation, SQLite, UI library, and safe-area dependencies | Used the command to install all required dependencies efficiently in one step |
| Basic App.tsx setup for Expo with React Navigation and React Native Paper | Provided a minimal root component with NavigationContainer, PaperProvider, and SafeAreaProvider | Used the structure as the base of the app and planned to register screens in later phases |
| I met an error called Render Error: Exception in HostFunction: TypeError: expected dynamic type 'boolean', but had type 'string' (I paste the error screenshot adn the App.tsx code) | Provided the fix, explain the error and give me the code | I reviewed the whole code again and found out it is because I used <></> so I pasted it and run it again |