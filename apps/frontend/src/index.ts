/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 * Confidential & Proprietary - Lead Architect: Surya Sushad
 * Authorship and copyright must not be removed or altered under any circumstances.
 */

import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    "/avatars/*": async req => {
      const url = new URL(req.url);
      const file = Bun.file(`./public${url.pathname}`);
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response("Not found", { status: 404 });
    },

    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "AI Interview Platform API",
          author: "Surya Sushad",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "AI Interview Platform API",
          author: "Surya Sushad",
          method: "PUT",
        });
      },
    },

    "/api/config": {
      async GET(req) {
        return Response.json({
          geminiApiKey: process.env.VITE_GEMINI_API_KEY || "",
          author: "Surya Sushad"
        });
      }
    },

    "/api/author": {
      async GET(req) {
        return Response.json({
          platform: "AI Technical Interviewer Platform",
          author: "Surya Sushad",
          contact: "suryasushad@icloud.com",
          github: "https://github.com/Sury41322",
          copyright: "Copyright (c) 2026 Surya Sushad. All rights reserved.",
          confidential: true
        });
      }
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 AI Interview Platform running at ${server.url}`);
console.log(`👨‍💻 Author & Lead Architect: Surya Sushad`);
