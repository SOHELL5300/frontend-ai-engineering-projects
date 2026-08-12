export default function MeetingInput({
  value,
  onChange,
  onGenerate,
  onClear,
  isGenerating,
}) {
  return (
    <section className="inputPanel" id="workspace">
      <div className="panelHeader">
        <div>
          <p className="sectionLabel">Raw input</p>
          <h2>Paste meeting notes</h2>
        </div>

        <button
          type="button"
          className="secondaryButton"
          onClick={onClear}
          disabled={isGenerating}
        >
          Clear
        </button>
      </div>

      <textarea
        className="meetingTextarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Example: Today we discussed the dashboard performance issue. Rahul will check API latency. Priya will update the UI loading state. The release may be delayed because QA found login bugs..."
      />

      <div className="inputFooter">
        <p>{value.trim().length} characters</p>

        <button
          type="button"
          className="primaryButton"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Notes"}
        </button>
      </div>
    </section>
  );
}