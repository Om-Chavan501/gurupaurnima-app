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
    case "profile.role.shishya": return "marked someone a shishya";
    case "profile.role.audience": return "marked someone audience";
    case "invite.create": return "created an invite code";
    case "invite.revoke": return "revoked an invite code";
    case "request.raise.verify": return "asked to be verified";
    case "request.raise.change_to_shishya": return "asked to be reclassified as shishya";
    case "request.raise.change_to_audience": return "asked to be reclassified as audience";
    case "request.accepted.verify": return "accepted a verification request";
    case "request.rejected.verify": return "rejected a verification request";
    case "request.ignored.verify": return "ignored a verification request";
    case "request.accepted.change_to_shishya": return "approved a shishya reclassification";
    case "request.rejected.change_to_shishya": return "rejected a shishya reclassification";
    case "request.ignored.change_to_shishya": return "ignored a shishya reclassification";
    case "request.accepted.change_to_audience": return "approved an audience reclassification";
    case "request.rejected.change_to_audience": return "rejected an audience reclassification";
    case "request.ignored.change_to_audience": return "ignored an audience reclassification";
    case "signup.invite_redeemed": return "joined via invite";
    default: return action;
  }
}
