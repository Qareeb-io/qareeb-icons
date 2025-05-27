import "./App.css";

import { qaActivity, QareebIcon } from "../../src";
import '../../src/style.css'; // Import the CSS file for QareebIcon

function App() {
  return (
    <>
      HELLO
      <QareebIcon icon={qaActivity}  />
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22 12H18L15 21L9 3L6 12H2"
          stroke="black"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </>
  );
}

export default App;
