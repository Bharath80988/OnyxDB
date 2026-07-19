import React from 'react';
import { Terminal, Code2, FileJson } from 'lucide-react';

export interface Chapter {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface FrameworkDoc {
  id: string;
  title: string;
  chapters: Chapter[];
}

export const CodeBlock = ({ file, code, language = 'bash' }: { file: string, code: string, language?: string }) => (
  <div className="bg-gray-100 dark:bg-onyx-900 border border-gray-200 dark:border-onyx-600/50 rounded-xl overflow-hidden my-6">
    <div className="bg-gray-200 dark:bg-onyx-800 px-4 py-3 text-xs font-bold text-gray-600 dark:text-onyx-100/70 border-b border-gray-300 dark:border-onyx-600/50 flex gap-2 items-center">
      {file.includes('.') ? (file.endsWith('.json') || file.endsWith('.xml') ? <FileJson className="w-4 h-4"/> : <Code2 className="w-4 h-4"/>) : <Terminal className="w-4 h-4"/>}
      {file}
    </div>
    <pre className="p-4 text-sm font-mono text-green-700 dark:text-green-400 overflow-auto whitespace-pre-wrap break-words">
      {code}
    </pre>
  </div>
);

export const frameworks: FrameworkDoc[] = [
  {
    id: 'spring',
    title: 'Java Spring Boot',
    chapters: [
      {
        id: 'spring-init',
        title: '1. Initialize Project',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">You can initialize a Spring Boot project using Spring Initializr, or manually via CLI using Maven or Gradle. This provides the foundation for your REST API to talk with OnyxDB.</p>
            <CodeBlock file="Terminal (Maven)" code="curl https://start.spring.io/starter.zip -d dependencies=web -d name=onyx-demo -o onyx-demo.zip&#10;unzip onyx-demo.zip&#10;cd onyx-demo" />
          </div>
        )
      },
      {
        id: 'spring-connect',
        title: '2. Connect DB',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">Configure the OnyxDB connection URL in your properties or YAML file. Spring's auto-configuration will pick this up automatically.</p>
            <CodeBlock file="src/main/resources/application.properties" code="onyxdb.url=http://localhost:8080" />
            <CodeBlock file="pom.xml (Maven)" code={`<dependency>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-starter-web</artifactId>\n</dependency>`} />
          </div>
        )
      },
      {
        id: 'spring-hello',
        title: '3. Hello World',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">Create a REST Controller that connects to OnyxDB and returns a Hello World record. We use Spring's <code>RestTemplate</code> or <code>WebClient</code> to send standard JSON payloads to the database.</p>
            <CodeBlock file="src/main/java/com/example/demo/HelloController.java" code={`import org.springframework.beans.factory.annotation.Value;\nimport org.springframework.web.bind.annotation.GetMapping;\nimport org.springframework.web.bind.annotation.RestController;\nimport org.springframework.web.client.RestTemplate;\nimport org.springframework.http.*;\n\n@RestController\npublic class HelloController {\n    @Value("\${onyxdb.url}")\n    private String dbUrl;\n\n    @GetMapping("/hello")\n    public String helloWorld() {\n        RestTemplate restTemplate = new RestTemplate();\n        HttpHeaders headers = new HttpHeaders();\n        headers.setContentType(MediaType.APPLICATION_JSON);\n\n        String payload = """\n            {\n                "action": "insert",\n                "table": "greetings",\n                "data": { "id": 1, "message": "Hello World from Spring Boot!" }\n            }\n        """;\n\n        HttpEntity<String> request = new HttpEntity<>(payload, headers);\n        return restTemplate.postForObject(dbUrl + "/query", request, String.class);\n    }\n}`} />
          </div>
        )
      }
    ]
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
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">Create a new Django project and app using the Django admin CLI. We'll use the ubiquitous <code>requests</code> library to speak to OnyxDB.</p>
            <CodeBlock file="Terminal" code={`pip install django requests\ndjango-admin startproject myproject\ncd myproject\npython manage.py startapp myapp`} />
          </div>
        )
      },
      {
        id: 'django-connect',
        title: '2. Connect DB',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">Configure your OnyxDB URL inside the Django settings file. This keeps your environment clean and centralized.</p>
            <CodeBlock file="myproject/settings.py" code={`# Add your app to INSTALLED_APPS\nINSTALLED_APPS = [\n    # ...\n    'myapp',\n]\n\n# OnyxDB Configuration\nONYXDB_URL = 'http://localhost:8080'`} />
          </div>
        )
      },
      {
        id: 'django-hello',
        title: '3. Hello World',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">Create a view that queries OnyxDB, and wire it up in your URLs.</p>
            <CodeBlock file="myapp/views.py" code={`import requests\nfrom django.conf import settings\nfrom django.http import JsonResponse\n\ndef hello_world(request):\n    payload = {\n        "action": "insert",\n        "table": "greetings",\n        "data": { "id": 1, "message": "Hello World from Django!" }\n    }\n    \n    response = requests.post(f"{settings.ONYXDB_URL}/query", json=payload)\n    return JsonResponse(response.json())`} />
          </div>
        )
      }
    ]
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
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">Flask is incredibly lightweight. A single file is all you need to interact with OnyxDB.</p>
            <CodeBlock file="app.py" code={`from flask import Flask, jsonify\nimport requests\n\napp = Flask(__name__)\nDB_URL = "http://localhost:8080"\n\n@app.route('/hello')\ndef hello():\n    payload = {\n        "action": "insert",\n        "table": "greetings",\n        "data": { "id": 1, "message": "Hello from Flask!" }\n    }\n    res = requests.post(f"{DB_URL}/query", json=payload)\n    return jsonify(res.json())\n\nif __name__ == '__main__':\n    app.run(port=5000)`} />
          </div>
        )
      }
    ]
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
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">FastAPI allows for lightning-fast asynchronous requests. We use <code>httpx</code> for non-blocking IO to OnyxDB.</p>
            <CodeBlock file="Terminal" code={`pip install fastapi uvicorn httpx`} />
            <CodeBlock file="main.py" code={`from fastapi import FastAPI\nimport httpx\n\napp = FastAPI()\nDB_URL = "http://localhost:8080"\n\n@app.get("/hello")\nasync def hello():\n    payload = {\n        "action": "insert",\n        "table": "greetings",\n        "data": { "id": 1, "message": "Hello Async World!" }\n    }\n    async with httpx.AsyncClient() as client:\n        res = await client.post(f"{DB_URL}/query", json=payload)\n        return res.json()`} />
          </div>
        )
      }
    ]
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
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">Initialize a Node.js project and install Express and Axios.</p>
            <CodeBlock file="Terminal" code={`mkdir express-onyx && cd express-onyx\nnpm init -y\nnpm install express axios`} />
          </div>
        )
      },
      {
        id: 'express-hello',
        title: '2. Hello World',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">Create your server file and define a route.</p>
            <CodeBlock file="index.js" code={`const express = require('express');\nconst axios = require('axios');\nconst app = express();\n\nconst DB_URL = process.env.ONYXDB_URL || 'http://localhost:8080';\n\napp.get('/hello', async (req, res) => {\n  try {\n    const response = await axios.post(\`\${DB_URL}/query\`, {\n      action: "insert",\n      table: "greetings",\n      data: { id: 1, message: "Hello World from Express!" }\n    });\n    res.json(response.data);\n  } catch (error) {\n    res.status(500).json({ error: error.message });\n  }\n});\n\napp.listen(3000, () => console.log('Server running'));`} />
          </div>
        )
      }
    ]
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
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">PHP can natively connect to OnyxDB without any heavy dependencies. Just use the built-in stream context.</p>
            <CodeBlock file="index.php" code={`<?php\n$url = 'http://localhost:8080/query';\n$data = array(\n    'action' => 'insert',\n    'table' => 'greetings',\n    'data' => array('id' => 1, 'message' => 'Hello from PHP!')\n);\n\n$options = array(\n    'http' => array(\n        'header'  => "Content-type: application/json\\r\\n",\n        'method'  => 'POST',\n        'content' => json_encode($data)\n    )\n);\n$context  = stream_context_create($options);\n$result = file_get_contents($url, false, $context);\n\nheader('Content-Type: application/json');\necho $result;\n?>`} />
          </div>
        )
      }
    ]
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
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">Go is perfect for OnyxDB. Fast, compiled, and highly concurrent.</p>
            <CodeBlock file="Terminal" code={`go mod init go-onyx\ngo get github.com/gofiber/fiber/v2`} />
            <CodeBlock file="main.go" code={`package main\n\nimport (\n    "bytes"\n    "encoding/json"\n    "net/http"\n    "io/ioutil"\n    "github.com/gofiber/fiber/v2"\n)\n\nfunc main() {\n    app := fiber.New()\n\n    app.Get("/hello", func(c *fiber.Ctx) error {\n        payload := map[string]interface{}{\n            "action": "insert",\n            "table": "greetings",\n            "data": map[string]interface{}{\n                "id": 1, "message": "Hello World from Go!",\n            },\n        }\n        \n        jsonValue, _ := json.Marshal(payload)\n        resp, err := http.Post("http://localhost:8080/query", "application/json", bytes.NewBuffer(jsonValue))\n        if err != nil { return c.Status(500).SendString(err.Error()) }\n        defer resp.Body.Close()\n        \n        body, _ := ioutil.ReadAll(resp.Body)\n        c.Set("Content-Type", "application/json")\n        return c.Send(body)\n    })\n\n    app.Listen(":3000")\n}`} />
          </div>
        )
      }
    ]
  },
  {
    id: 'rails',
    title: 'Ruby on Rails',
    chapters: [
      {
        id: 'rails-hello',
        title: 'Hello World',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">Using the native `net/http` module in Rails controllers.</p>
            <CodeBlock file="app/controllers/greetings_controller.rb" code={`require 'net/http'\nrequire 'json'\n\nclass GreetingsController < ApplicationController\n  def hello\n    uri = URI('http://localhost:8080/query')\n    payload = {\n      action: "insert",\n      table: "greetings",\n      data: { id: 1, message: "Hello from Rails!" }\n    }\n\n    res = Net::HTTP.post(uri, payload.to_json, "Content-Type" => "application/json")\n    render json: JSON.parse(res.body)\n  end\nend`} />
          </div>
        )
      }
    ]
  },
  {
    id: 'aspnet',
    title: 'ASP.NET Core',
    chapters: [
      {
        id: 'aspnet-hello',
        title: 'HttpClient Service',
        content: (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">In C# ASP.NET Core, simply inject an HttpClient to talk with OnyxDB.</p>
            <CodeBlock file="Controllers/HelloController.cs" code={`using Microsoft.AspNetCore.Mvc;\nusing System.Net.Http;\nusing System.Text;\nusing System.Text.Json;\n\n[ApiController]\n[Route("[controller]")]\npublic class HelloController : ControllerBase\n{\n    private readonly HttpClient _client;\n    public HelloController(HttpClient client) { _client = client; }\n\n    [HttpGet]\n    public async Task<IActionResult> Get()\n    {\n        var payload = new { action = "insert", table = "greetings", data = new { id = 1, message = "Hello ASP.NET!" } };\n        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");\n        \n        var response = await _client.PostAsync("http://localhost:8080/query", content);\n        var responseString = await response.Content.ReadAsStringAsync();\n        \n        return Content(responseString, "application/json");\n    }\n}`} />
          </div>
        )
      }
    ]
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
            <p className="text-gray-600 dark:text-onyx-100/70 leading-relaxed">Rust provides memory safety and incredible speed, pairing perfectly with OnyxDB.</p>
            <CodeBlock file="Cargo.toml" code={`[dependencies]\nactix-web = "4"\nreqwest = { version = "0.11", features = ["json"] }\nserde_json = "1.0"\ntokio = { version = "1", features = ["macros", "rt-multi-thread"] }`} />
            <CodeBlock file="src/main.rs" code={`use actix_web::{get, App, HttpResponse, HttpServer, Responder};\nuse serde_json::json;\n\n#[get("/hello")]\nasync fn hello() -> impl Responder {\n    let client = reqwest::Client::new();\n    let payload = json!({\n        "action": "insert",\n        "table": "greetings",\n        "data": { "id": 1, "message": "Hello from Rust!" }\n    });\n\n    let res = client.post("http://localhost:8080/query")\n        .json(&payload)\n        .send()\n        .await.unwrap()\n        .text()\n        .await.unwrap();\n\n    HttpResponse::Ok().content_type("application/json").body(res)\n}\n\n#[actix_web::main]\nasync fn main() -> std::io::Result<()> {\n    HttpServer::new(|| App::new().service(hello))\n        .bind(("127.0.0.1", 3000))?\n        .run()\n        .await\n}`} />
          </div>
        )
      }
    ]
  }
];
