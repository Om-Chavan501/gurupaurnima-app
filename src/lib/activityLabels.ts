export function labelForAction(action: string): string {
  switch (action) {
    case "poll.update": return "updated their date picks";
    case "poll.update.admin": return "edited date picks on behalf of someone";
    case "performance.update": return "updated their composition";
    case "performance.update.admin": return "edited a composition on behalf";
    case "performance.delete": return "removed a composition entry";
    case "profile.update": return "edited their profile";
    case "profile.verify": return "changed a verified status";
    case "profile.admin": return "changed an admin status";
    case "profile.delete": return "removed a profile";
    default: return action;
  }
}
