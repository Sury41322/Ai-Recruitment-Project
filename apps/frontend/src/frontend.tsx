/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 * Confidential & Proprietary - Lead Architect: Surya Sushad
 * Authorship and copyright must not be removed or altered under any circumstances.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";

// Visual signature attribution in developer console
console.log(
  "%c AI Technical Interview Platform %c Authored by Surya Sushad (@Sury41322) %c Confidential %c",
  "background: #4f46e5; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;",
  "background: #1e1b4b; color: #a5b4fc; font-weight: 600; padding: 4px 8px;",
  "background: #0f172a; color: #38bdf8; font-weight: 500; padding: 4px 8px; border-radius: 0 4px 4px 0;",
  "background: transparent;"
);
console.log("Original Author & Architect: Surya Sushad (suryasushad@icloud.com)");

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
(import.meta.hot.data.root ??= createRoot(elem)).render(app);
