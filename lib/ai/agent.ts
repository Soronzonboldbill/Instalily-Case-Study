// fakes AI responses (i.e. simulating an intent parsing agent)
// which would then trigger some kind of AI workflow.
//
type Intent = "insight" | "schedule" | "note";
export async function parseHumanIntent(msg: string) {
  let intent: Intent;
  if (msg.includes("schedule")) {
    intent = "schedule";
  } else if (msg.includes("insights")) {
    intent = "insight";
  } else {
    intent = "note";
  }

  switch (intent) {
    case "insight":
      return [
        "Here are your top 3 customers this week: ",
        "Acme Corp, Horizon Logistics, and NovaTech. ",
        "They’ve driven the most engagement recently. ",
        "Want me to prep quick notes for each?",
      ];
    case "schedule":
      return [
        "Got it — scheduling a quick sync with ",
        "Client X ",
        "for later today. ",
        "I'll block 15 minutes and send you a reminder!",
      ];
    case "note":
      return [
        "Sure, I'll remember that ",
        "Client X from company Z ",
        "likes your tie. ",
        "Added to notes for later!",
      ];
  }
}
