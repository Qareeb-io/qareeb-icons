import "./App.css";

import { qaActivity, QareebIcon, qaRobot } from "../../src";
import "../../src/style.css"; // Import the CSS file for QareebIcon

function App() {
  return (
    <>
      HELLO
      <QareebIcon icon={qaRobot} />
      <QareebIcon icon={qaActivity} />
    </>
  );
}

export default App;
