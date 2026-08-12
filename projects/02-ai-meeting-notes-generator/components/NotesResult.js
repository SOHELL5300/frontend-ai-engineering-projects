import SectionCard from "./SectionCard";

export default function NotesResult({ notes }) {
  function buildCopyText() {
    const actionItemsText = notes.actionItems
      ?.map(
        (item, index) =>
          `${index + 1}. ${item.task} | Owner: ${item.suggestedOwner} | Priority: ${item.priority}`
      )
      .join("\n");

    return `
Meeting Summary:
${notes.summary}

Key Discussion Points:
${notes.keyDiscussionPoints?.map((point) => `- ${point}`).join("\n")}

Decisions Made:
${notes.decisionsMade?.map((decision) => `- ${decision}`).join("\n")}

Action Items:
${actionItemsText}

Risks / Blockers:
${notes.risksAndBlockers?.map((risk) => `- ${risk}`).join("\n")}

Follow-up Questions:
${notes.followUpQuestions?.map((question) => `- ${question}`).join("\n")}
`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildCopyText());
      alert("Meeting summary copied to clipboard.");
    } catch {
      alert("Unable to copy summary. Please try again.");
    }
  }

  return (
    <div className="notesResult">
      <div className="resultHeader">
        <div>
          <p className="sectionLabel">AI output</p>
          <h2>Generated meeting notes</h2>
        </div>

        <button type="button" className="secondaryButton" onClick={handleCopy}>
          Copy Summary
        </button>
      </div>

      <SectionCard title="Meeting Summary">
        <p className="summaryText">{notes.summary}</p>
      </SectionCard>

      <SectionCard title="Key Discussion Points">
        <ul className="contentList">
          {notes.keyDiscussionPoints?.map((point, index) => (
            <li key={`point-${index}`}>{point}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Decisions Made">
        <ul className="contentList">
          {notes.decisionsMade?.map((decision, index) => (
            <li key={`decision-${index}`}>{decision}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Action Items">
        <div className="actionGrid">
          {notes.actionItems?.map((item, index) => (
            <article className="actionCard" key={`action-${index}`}>
              <div className="priorityRow">
                <span className="priorityBadge">{item.priority}</span>
              </div>

              <h4>{item.task}</h4>
              <p>
                <strong>Suggested owner:</strong> {item.suggestedOwner}
              </p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Risks / Blockers">
        <ul className="contentList riskList">
          {notes.risksAndBlockers?.map((risk, index) => (
            <li key={`risk-${index}`}>{risk}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Follow-up Questions">
        <ul className="contentList">
          {notes.followUpQuestions?.map((question, index) => (
            <li key={`question-${index}`}>{question}</li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}