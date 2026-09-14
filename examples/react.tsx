import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { FilmstripGallery } from "../src/react";
import "../src/styles.css";
const options = {
  items: [1, 2, 3].map((i) => ({
    id: String(i),
    src: `${import.meta.env.BASE_URL}samples/landscape-${i}.svg`,
    alt: `Landscape ${i}`,
  })),
};
function App() {
  const [shown, setShown] = useState(true);
  return (
    <>
      <button onClick={() => setShown(!shown)}>Toggle gallery</button>
      {shown && <FilmstripGallery options={options} />}
    </>
  );
}
createRoot(document.querySelector("#root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
