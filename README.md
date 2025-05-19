# GraphQL Profile SPA

## Description

This project is a Single Page Application (SPA) designed to showcase a user's profile data fetched from a GraphQL API. It provides a dynamic and interactive dashboard with key statistics and visualizations, offering insights into the user's progress and achievements. The application is built with modern web technologies, including JavaScript, Tailwind CSS, and SVG-based graphs, to deliver a responsive and engaging user experience.

## Features

*   **User Authentication:** Secure login using JWT (JSON Web Tokens) to protect user data.
*   **Profile Dashboard:** Displays essential user information, such as user ID, total XP, and audit pass ratio.
*   **Data Visualization:** Utilizes SVG graphs to present data in an intuitive and visually appealing manner.
    *   XP Distribution: A horizontally scrollable bar graph showing XP earned across different projects.
    *   XP Progress: A line chart displaying XP progress over time.
*   **Responsive Design:** Adapts seamlessly to different screen sizes and devices.
*   **Modular Architecture:** Well-organized codebase with clear separation of concerns for maintainability and scalability.

## Architecture

The application follows a modular architecture with distinct components:

*   **API Layer (`api.js`):** Handles communication with the GraphQL API, including authentication and data fetching.
*   **Data Management (`queries.js`):** Defines GraphQL queries and manages the retrieval and processing of user data.
*   **UI Components (`profile.js`, `graph.js`):** Implements the user interface and data visualizations.
*   **Routing (`router.js`, `app.js`):** Manages client-side navigation and renders the appropriate components.

## Technologies Used

*   HTML
*   CSS
*   JavaScript
*   GraphQL
*   Tailwind CSS
*   Vite

## GraphQL API

The application interacts with a GraphQL API to fetch user data. The API provides access to various tables, including:

*   `user`: Contains basic user information (ID, login).
*   `transaction`: Provides access to XP transactions.
*   `result`: Contains audit results and grades.
*   `object`: Provides information about exercises and projects.

The application uses GraphQL queries to fetch specific data points and display them in the profile dashboard.

## File Structure

*   `index.html`: The main HTML file that serves as the entry point for the application.
*   `js/`: Contains the JavaScript files.
    *   `api.js`: Handles API communication.
    *   `app.js`: Initializes the application and manages routing.
    *   `auth.js`: Implements the authentication logic.
    *   `graph.js`: Contains graph components.
    *   `profile.js`: Manages the profile page and renders the UI.
    *   `queries.js`: Defines GraphQL queries used to fetch data.
    *   `router.js`: Handles client-side routing.
*   `assets/`: Contains CSS and other assets.
    *   `style.css`: Contains custom CSS styles.
*   `tailwind.config.js`: Configuration file for Tailwind CSS.
*   `package.json`: Lists project dependencies and scripts.
*   `README.md`: Project documentation.

## Running Locally

To run the project locally, follow these steps:

1. Clone the repository
    ```bash
    git clone https://github.com/Philip38-hub/graphql.git
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Run the development server:

    ```bash
    npm run dev
    ```
    - Access the app in the browser through `localhost:5173`

4. The application should be running on the live server's address or `localhost:5173`.

## Live Link

[graphql-profile](https://zo1profile.netlify.app/)

## Author

[Philip Ochieng]{https://github.com/Philip38-hub}