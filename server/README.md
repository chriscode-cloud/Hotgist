# HotGist Server

A lightweight Node.js-based file server designed to receive text and base64-encoded image data via HTTP requests and store them in JSON format on the filesystem. It serves as a simple backend for handling user-generated content, potentially for use in mobile or web applications requiring minimal persistence.

## Features

- **Anonymous Posting**: Completely anonymous social platform with no user authentication required
- **Campus-Specific Content**: Posts organized by campus communities
- **Trending Posts**: Algorithm to show popular content based on likes and comments
- **Commenting System**: Users can add comments to posts
- **RESTful API**: Clean and simple API endpoints for all operations
- **File-Based Storage**: JSON file storage for easy deployment without databases
- **Interactive Documentation**: Swagger UI for API testing and exploration

## Technology Stack

- **Backend**: Node.js + Express.js
- **Storage**: Filesystem (JSON files)
- **Documentation**: Swagger UI

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Clone or navigate to project root
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

- Start production mode:
  ```bash
  npm start
  ```
  Runs: `node server.js`

- Start development mode (auto-restarts on changes):
  ```bash
  npm run dev
  ```
  Runs: `nodemon server.js`

## API Documentation

For detailed information about the API endpoints, request/response formats, and usage examples, please see [API_DOCS.md](API_DOCS.md).

### Quick Links

- **API Endpoints**: http://localhost:3000/api/...
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

## Project Structure

```
.
├── data/
│   ├── posts/              # Campus-specific post files
│   └── campuses.json       # Campus information
├── server.js               # Main server application
├── swagger.js              # Swagger/OpenAPI specification
├── API_DOCS.md             # Detailed API documentation
├── README.md               # This file
└── package.json            # Project dependencies and scripts
```

## Data Storage

All data is persisted directly to the filesystem using JSON files:
- Posts are stored in `data/posts/` directory in campus-specific JSON files
- Campus information is stored in `data/campuses.json`

## Campuses

The server comes pre-configured with the following Ghanaian universities:
1. GCTU - Ghana Communication Technology University (Accra)
2. UG - University of Ghana (Accra)
3. KNUST - Kwame Nkrumah University of Science and Technology (Kumasi)
4. UCC - University of Cape Coast (Cape Coast)
5. UPSA - University of Professional Studies (Accra)
6. UENR - University of Energy and Natural Resources (Sunyani)
7. UMaT - University of Mines and Technology (Tarkwa)
8. UDS - University for Development Studies (Tamale)

## API Endpoints

### Posts
- `POST /api/posts` - Create a new post
- `GET /api/posts` - Get posts (with optional filtering and pagination)
- `GET /api/posts/{id}` - Get a specific post
- `POST /api/posts/{id}/like` - Like a post
- `POST /api/posts/{id}/comment` - Add a comment to a post

### Campuses
- `GET /api/campuses` - Get all campuses
- `GET /api/campus/{campus}/posts` - Get posts for a specific campus
- `GET /api/campus/{campus}/trending` - Get trending posts for a specific campus

### Health
- `GET /api/health` - Server health check

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the ISC License.