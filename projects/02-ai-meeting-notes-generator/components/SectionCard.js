export default function SectionCard({ title, children }) {
  return (
    <section className="sectionCard">
      <h3>{title}</h3>
      {children}
    </section>
  );
}