export interface QueueItem {
  id: string;
  title: string;
  rentPaise: number;
  localityName: string;
  listerName: string;
  listerAge: string;
  /** 1 = multiple reports, 2 = scam signals, 3 = new user, 4 = random sample. */
  priority: number;
  flags: string[];
}

export const mockQueue: QueueItem[] = [
  {
    id: "mod-1",
    title: "2BHK fully furnished, immediate possession",
    rentPaise: 800_000,
    localityName: "Indiranagar",
    listerName: "Rakesh K",
    listerAge: "joined 2 days ago",
    priority: 1,
    flags: [
      "3 reports: already taken",
      "Rent 64% below locality median",
      "Photos match another listing",
    ],
  },
  {
    id: "mod-2",
    title: "Single room near metro, girls only",
    rentPaise: 1_100_000,
    localityName: "HSR Layout",
    listerName: "Deepa S",
    listerAge: "joined 4 days ago",
    priority: 2,
    flags: ["Advance-payment language in description", "New account"],
  },
  {
    id: "mod-3",
    title: "PG bed with meals, walking distance to tech park",
    rentPaise: 950_000,
    localityName: "Whitefield",
    listerName: "Manoj Reddy",
    listerAge: "joined 6 days ago",
    priority: 3,
    flags: ["First listing from this account"],
  },
  {
    id: "mod-4",
    title: "1BHK on quiet lane, semi-furnished",
    rentPaise: 1_600_000,
    localityName: "BTM Layout",
    listerName: "Anita George",
    listerAge: "joined 8 months ago",
    priority: 4,
    flags: ["Random sample"],
  },
];

export interface ReportRow {
  id: string;
  target: string;
  targetType: "Listing" | "User" | "Message";
  reason: string;
  reporter: string;
  reportedAt: string;
  status: "open" | "resolved";
}

export const mockReports: ReportRow[] = [
  { id: "rep-1", target: "2BHK fully furnished", targetType: "Listing", reason: "Fake or scam", reporter: "Rahul N", reportedAt: "2026-08-16T05:10:00Z", status: "open" },
  { id: "rep-2", target: "Single room near metro", targetType: "Listing", reason: "Already taken", reporter: "Meera I", reportedAt: "2026-08-15T18:40:00Z", status: "open" },
  { id: "rep-3", target: "Rakesh K", targetType: "User", reason: "Harassment", reporter: "Sana Q", reportedAt: "2026-08-15T12:05:00Z", status: "open" },
  { id: "rep-4", target: "Room in 3BHK", targetType: "Listing", reason: "Discriminatory", reporter: "Arun M", reportedAt: "2026-08-14T09:15:00Z", status: "resolved" },
];

export interface AuditRow {
  id: string;
  moderator: string;
  action: string;
  target: string;
  note: string;
  at: string;
}

export const mockAudit: AuditRow[] = [
  { id: "aud-1", moderator: "priya.mod", action: "Suspended listing", target: "listing-44", note: "Photos lifted from another listing", at: "2026-08-16T04:50:00Z" },
  { id: "aud-2", moderator: "priya.mod", action: "Restricted user", target: "user-88", note: "Third upheld report", at: "2026-08-16T04:48:00Z" },
  { id: "aud-3", moderator: "sunil.mod", action: "Stripped description text", target: "listing-41", note: "Prohibited tenant restriction", at: "2026-08-15T17:22:00Z" },
  { id: "aud-4", moderator: "sunil.mod", action: "Approved listing", target: "listing-39", note: "Sample check, no issues", at: "2026-08-15T16:03:00Z" },
];
