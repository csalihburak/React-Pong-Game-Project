import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Game } from "./game/game";
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/game" element={<Game/> }  />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
