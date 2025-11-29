# Running Nebula ERP Locally

Follow these steps to get the application running on your local machine.

## Prerequisites

*   **Node.js**: Version 16 or higher.
*   **npm** or **yarn**.

## Installation

1.  **Clone the repository** (if applicable) or download the source code.

2.  **Install Dependencies**:
    ```bash
    npm install
    ```
    *Note: Since this is a specialized AI Studio template, dependencies are often loaded via ES Modules/Import Maps in `index.html`. If running in a standard local environment, ensure you have a `package.json` with `react`, `react-dom`, `lucide-react`, `recharts`, and `@google/genai`.*

## Configuration

1.  **API Key**:
    Get a Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
    
    *   **Option A (.env)**: Create a `.env` file and add `API_KEY=your_key`.
    *   **Option B (Code)**: For quick testing, you may export it in your terminal session or paste it (temporarily) into `services/geminiService.ts` (not recommended for sharing).

## Running the App

1.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    or
    ```bash
    npx vite
    ```

2.  **Access the App**:
    Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## First Time Login

The system initializes with a default Admin user to prevent lockout.

*   **Email**: `admin@nebula.com`
*   **Password**: `admin`

Once logged in, go to **User Roles** or **Settings** to create your own account and change credentials.
