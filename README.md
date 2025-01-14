# hackathon-team-5
Web Error Handling and Prioritisation 

# Flow:
# Frontend
On the landing page, our application accepts the website link to inspect. It passes this url to NextJs API routes where Puppeteer can take an action over that.

# Backend
Puppeteer runs a separate instance of the browser with that website and it has full control over that instance.
Puppeteer is automating the flow of operations and meanwhile in this flow, it can also record various errors occurring in the website.
At the end of the flow, Puppeteer sends the error logs to Ollama by categorizing them by the webpage Puppeteer has visited.
After receiving the response containing solutions of the errors from Ollama, NextJs calls a ROR API to save the data in DB for further use cases.
It returns the webpage wise data containing the errors along with their solutions.

# LLM
Responsible for giving the solutions of the errors passed to it.

#Setup

## System Requirements

### Frontend (Next.js)
- Node.js 18+
- npm or yarn
- [Ollama]([https://ollama.ai/](https://ollama.com/)) installed locally

### Backend (Rails)
- Ruby 3.0.0
- PostgreSQL
- Docker (optional)

## Setup Instructions

### Backend Setup (Rails)

1. For backed we have a docker setup, run docker-compose up --build
  once it is successfully you can access rails server on localhost:3005

### Frontend setup ( nextjs and ollama )

1. Install ollama following 

- https://hub.docker.com/r/ollama/ollama
- we are using `llama3.2:1b` in your code base 

2. For nextjs 

- Make sure you have nodejs installed on your system with latest lts tag
- Install dependencies for nextjs using `npm install`
- Once Installed start nextjs server using `npm run dev`
