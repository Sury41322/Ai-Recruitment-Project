/**
 * @author Surya Sushad <suryasushad@icloud.com>
 * @copyright 2026 Surya Sushad. All rights reserved.
 * Confidential & Proprietary - Lead Architect: Surya Sushad
 * Authorship and copyright must not be removed or altered under any circumstances.
 */

import { Form } from "./components/Form";
import { Interview } from "./components/interview";
import { Result } from "./components/result";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-screen bg-white flex flex-col justify-between">
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route
              path="/"
              element={
                <div className="min-h-[calc(100vh-45px)] w-full flex justify-center items-center p-4">
                  <Form />
                </div>
              }
            />
            <Route path="/interview/:id" element={<Interview />} />
            <Route path="/result" element={<Result />} />
          </Routes>
        </div>
        
        {/* Permanent Author Attribution Footer */}
        <footer className="w-full py-2.5 px-6 text-center text-xs text-slate-400 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 select-none bg-slate-50/50">
          <span>AI Technical Interview Platform</span>
          <span>•</span>
          <span>Authored by <strong className="font-semibold text-slate-600">Surya Sushad</strong></span>
          <span>•</span>
          <span className="text-slate-400">© 2026 All Rights Reserved (Confidential)</span>
        </footer>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
