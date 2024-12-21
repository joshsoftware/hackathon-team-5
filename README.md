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
