import "./App.css";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <>
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__logo">PMS</span>
          <div>
            <strong>ProductFlow</strong>
            <span>Inventory workspace</span>
          </div>
        </div>
        <div className="app-header__status">
          <span className="app-header__status-dot" />
          Live workspace
        </div>
      </header>
      <Dashboard />
    </>
  );
}

export default App;
