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

# Agent-S: AI-Powered Web Analysis Tool

A full-stack application that analyzes websites for potential issues using AI. The project consists of a Next.js frontend and a Ruby on Rails API backend.



## System Requirements

### Frontend (Next.js)
Node.js 18+
npm or yarn
[Ollama](https://ollama.ai/) installed locally

### Backend (Rails)
Ruby 3.0.0
PostgreSQL
Docker (optional)

## Setup Instructions

### Backend Setup (Rails)

1. Navigate to the Rails project directory:
        cd ruby/Hackathon
2. Install dependencies:
        bash
        bundle install
        bash
        rails db:generate db:migrate
4. Start the Rails server:
        rails s
        
   Alternatively, using Docker:
            using docker
