import React from 'react';

export const CodeBlock = ({ file, code }) => (
  <div className="bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden my-6">
    <div className="bg-white/5 px-4 py-3 text-xs font-medium text-white/50 border-b border-white/10 flex gap-2 items-center">
      {file}
    </div>
    <pre className="p-4 text-xs font-mono text-orange-400 overflow-auto whitespace-pre-wrap break-words">
      {code}
    </pre>
  </div>
);

export const frameworks = [
  {
    id: 'spring',
    title: 'Java Spring Boot',
    chapters: [
      {
        id: 'spring-init',
        title: '1. Initialize Project',
        content: (
          <div className="space-y-4">
            <p className="text-white/60 leading-relaxed">You can initialize a Spring Boot project using Spring Initializr, or manually via CLI using Maven or Gradle.</p>
            <CodeBlock file="Terminal (Maven)" code={`curl https://start.spring.io/starter.zip -d dependencies=web -d name=forge-demo -o forge-demo.zip\nunzip forge-demo.zip\ncd forge-demo`} />
          </div>
        ),
      },
      {
        id: 'spring-connect',
        title: '2. Connect DB',
        content: (
          <div className="space-y-4">
            <p className="text-white/60 leading-relaxed">Configure the ForgeQL connection URL in your properties or YAML file.</p>
            <CodeBlock file="src/main/resources/application.properties" code="forgeql.url=http://localhost:8080" />
            <CodeBlock file="pom.xml (Maven)" code={`<dependency>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-starter-web</artifactId>\n</dependency>`} />
          </div>
        ),
      },
      {
        id: 'spring-hello',
        title: '3. Hello World',
        content: (
          <div className="space-y-4">
            <p className="text-white/60 leading-relaxed">Create a REST Controller that connects to ForgeQL and returns a Hello World record.</p>
            <CodeBlock file="HelloController.java" code={`import org.springframework.beans.value.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

@RestController
public class HelloController {
    @Value("\${forgeql.url}")
    private String dbUrl;

    @GetMapping("/hello")
    public String helloWorld() {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String payload = """
            {
                "action": "insert",
                "table": "greetings",
                "data": { "id": 1, "message": "Hello World from Spring Boot!" }
            }
        """;

        HttpEntity<String> request = new HttpEntity<>(payload, headers);
        return restTemplate.postForObject(dbUrl + "/query", request, String.class);
    }
}`} />
          </div>
        ),
      },
    ],
  },
  {
    id: 'django',
    title: 'Python Django',
    chapters: [
      {
        id: 'django-init',
        title: '1. Initialize Project',
        content: (
          <div className="space-y-4">
            <p className="text-white/60 leading-relaxed">Create a new Django project and app using the Django admin CLI.</p>
            <CodeBlock file="Terminal" code={`pip install django requests\ndjango-admin startproject myproject\ncd myproject\npython manage.py startapp myapp`} />
          </div>
        ),
      },
      {
        id: 'django-connect',
        title: '2. Connect DB',
        content: (
          <div className="space-y-4">
            <p className="text-white/60 leading-relaxed">Configure your ForgeQL URL inside the Django settings file.</p>
            <CodeBlock file="myproject/settings.py" code={`# Add your app to INSTALLED_APPS
INSTALLED_APPS = [
    # ...
    'myapp',
]

# ForgeQL Configuration
FORGEQL_URL = 'http://localhost:8080'`} />
          </div>
        ),
      },
      {
        id: 'django-hello',
        title: '3. Hello World',
        content: (
          <div className="space-y-4">
            <p className="text-white/60 leading-relaxed">Create a view that queries ForgeQL, and wire it up in your URLs.</p>
            <CodeBlock file="myapp/views.py" code={`import requests
from django.conf import settings
from django.http import JsonResponse

def hello_world(request):
    payload = {
        "action": "insert",
        "table": "greetings",
        "data": { "id": 1, "message": "Hello World from Django!" }
    }
    
    response = requests.post(f"{settings.FORGEQL_URL}/query", json=payload)
    return JsonResponse(response.json())`} />
          </div>
        ),
      },
    ],
  },
  {
    id: 'flask',
    title: 'Python Flask',
    chapters: [
      {
        id: 'flask-hello',
        title: 'Hello World',
        content: (
          <div className="space-y-4">
            <p className="text-white/60 leading-relaxed">Flask is incredibly lightweight. A single file is all you need to interact with ForgeQL.</p>
            <CodeBlock file="app.py" code={`from flask import Flask, jsonify
import requests

app = Flask(__name__)
DB_URL = "http://localhost:8080"

@app.route('/hello')
def hello():
    payload = {
        "action": "insert",
        "table": "greetings",
        "data": { "id": 1, "message": "Hello from Flask!" }
    }
    res = requests.post(f"{DB_URL}/query", json=payload)
    return jsonify(res.json())

if __name__ == '__main__':
    app.run(port=5000)`} />
          </div>
        ),
      },
    ],
  },
  {
    id: 'fastapi',
    title: 'Python FastAPI',
    chapters: [
      {
        id: 'fastapi-hello',
        title: 'Async Querying',
        content: (
          <div className="space-y-4">
            <p className="text-white/60 leading-relaxed">FastAPI allows for lightning-fast asynchronous requests. We use httpx for non-blocking IO to ForgeQL.</p>
            <CodeBlock file="Terminal" code={`pip install fastapi uvicorn httpx`} />
            <CodeBlock file="main.py" code={`from fastapi import FastAPI
import httpx

app = FastAPI()
DB_URL = "http://localhost:8080"

@app.get("/hello")
async def hello():
    payload = {
        "action": "insert",
        "table": "greetings",
        "data": { "id": 1, "message": "Hello Async World!" }
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{DB_URL}/query", json=payload)
        return res.json()`} />
          </div>
        ),
      },
    ],
  },
  {
    id: 'express',
    title: 'Node Express',
    chapters: [
      {
        id: 'express-init',
        title: '1. Initialize Project',
        content: (
          <div className="space-y-4">
            <p className="text-white/60 leading-relaxed">Initialize a Node.js project and install Express and Axios.</p>
            <CodeBlock file="Terminal" code={`mkdir express-forge && cd express-forge\nnpm init -y\nnpm install express axios`} />
          </div>
        ),
      },
      {
        id: 'express-hello',
        title: '2. Hello World',
        content: (
          <div className="space-y-4">
            <p className="text-white/60 leading-relaxed">Create your server file and define a route.</p>
            <CodeBlock file="index.js" code={`const express = require('express');
const axios = require('axios');
const app = express();

const DB_URL = process.env.FORGEQL_URL || 'http://localhost:8080';

app.get('/hello', async (req, res) => {
  try {
    const response = await axios.post(\`\${DB_URL}/query\`, {
      action: "insert",
      table: "greetings",
      data: { id: 1, message: "Hello World from Express!" }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running'));`} />
          </div>
        ),
      },
    ],
  },
  {
    id: 'php',
    title: 'PHP',
    chapters: [
      {
        id: 'php-hello',
        title: 'Native cURL or file_get_contents',
        content: (
          <div className="space-y-4">
            <p className="text-white/60 leading-relaxed">PHP can natively connect to ForgeQL without any heavy dependencies.</p>
            <CodeBlock file="index.php" code={`<?php
$url = 'http://localhost:8080/query';
$data = array(
    'action' => 'insert',
    'table' => 'greetings',
    'data' => array('id' => 1, 'message' => 'Hello from PHP!')
);

$options = array(
    'http' => array(
        'header'  => "Content-type: application/json\\r\\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    )
);
$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

header('Content-Type: application/json');
echo $result;
?>`} />
          </div>
        ),
      },
    ],
  },
  {
    id: 'go',
    title: 'Go (Fiber)',
    chapters: [
      {
        id: 'go-hello',
        title: 'Connect & Hello World',
        content: (
          <div className="space-y-4">
            <p className="text-white/60 leading-relaxed">Go is perfect for ForgeQL. Fast, compiled, and highly concurrent.</p>
            <CodeBlock file="Terminal" code={`go mod init go-forge\ngo get github.com/gofiber/fiber/v2`} />
            <CodeBlock file="main.go" code={`package main

import (
    "bytes"
    "encoding/json"
    "net/http"
    "io/ioutil"
    "github.com/gofiber/fiber/v2"
)

func main() {
    app := fiber.New()

    app.Get("/hello", func(c *fiber.Ctx) error {
        payload := map[string]interface{}{
            "action": "insert",
            "table": "greetings",
            "data": map[string]interface{}{
                "id": 1, "message": "Hello World from Go!",
            },
        }
        
        jsonValue, _ := json.Marshal(payload)
        resp, err := http.Post("http://localhost:8080/query", "application/json", bytes.NewBuffer(jsonValue))
        if err != nil { return c.Status(500).SendString(err.Error()) }
        defer resp.Body.Close()
        
        body, _ := ioutil.ReadAll(resp.Body)
        c.Set("Content-Type", "application/json")
        return c.Send(body)
    })

    app.Listen(":3000")
}`} />
          </div>
        ),
      },
    ],
  },
  {
    id: 'rust',
    title: 'Rust (Actix)',
    chapters: [
      {
        id: 'rust-hello',
        title: 'Reqwest & Actix',
        content: (
          <div className="space-y-4">
            <p className="text-white/60 leading-relaxed">Rust provides memory safety and incredible speed, pairing perfectly with ForgeQL.</p>
            <CodeBlock file="Cargo.toml" code={`[dependencies]
actix-web = "4"
reqwest = { version = "0.11", features = ["json"] }
serde_json = "1.0"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }`} />
            <CodeBlock file="src/main.rs" code={`use actix_web::{get, App, HttpResponse, HttpServer, Responder};
use serde_json::json;

#[get("/hello")]
async fn hello() -> impl Responder {
    let client = reqwest::Client::new();
    let payload = json!({
        "action": "insert",
        "table": "greetings",
        "data": { "id": 1, "message": "Hello from Rust!" }
    });

    let res = client.post("http://localhost:8080/query")
        .json(&payload)
        .send()
        .await.unwrap()
        .text()
        .await.unwrap();

    HttpResponse::Ok().content_type("application/json").body(res)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(hello))
        .bind(("127.0.0.1", 3000))?
        .run()
        .await
}`} />
          </div>
        ),
      },
    ],
  },
];
