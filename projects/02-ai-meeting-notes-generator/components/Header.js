export default function Header() {
  return (
    <header className="header">
      <div>
        <p className="logoText">AI Notes</p>
      </div>

      <nav className="navLinks" aria-label="Main navigation">
        <a href="#features">Features</a>
        <a href="#workspace">Generator</a>
      </nav>
    </header>
  );
}