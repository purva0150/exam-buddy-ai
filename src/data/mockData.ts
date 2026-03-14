export const faculty = [
  { id: "F001", name: "Dr. Sarah Chen", department: "Computer Science", duties: 4, maxDuties: 6, available: true },
  { id: "F002", name: "Prof. James Wilson", department: "Mathematics", duties: 5, maxDuties: 6, available: true },
  { id: "F003", name: "Dr. Priya Sharma", department: "Physics", duties: 3, maxDuties: 6, available: false },
  { id: "F004", name: "Dr. Michael Brown", department: "Chemistry", duties: 6, maxDuties: 6, available: true },
  { id: "F005", name: "Prof. Lisa Park", department: "Biology", duties: 2, maxDuties: 6, available: true },
  { id: "F006", name: "Dr. Ahmed Khan", department: "Computer Science", duties: 4, maxDuties: 6, available: true },
  { id: "F007", name: "Prof. Emily Davis", department: "Mathematics", duties: 5, maxDuties: 6, available: false },
  { id: "F008", name: "Dr. Robert Taylor", department: "Physics", duties: 1, maxDuties: 6, available: true },
];

export const exams = [
  { id: "EX001", subject: "Data Structures", date: "2024-03-18", time: "09:00", students: 120, hall: "Hall A", invigilators: 3, status: "assigned" as const },
  { id: "EX002", subject: "Linear Algebra", date: "2024-03-18", time: "14:00", students: 85, hall: "Hall B", invigilators: 2, status: "assigned" as const },
  { id: "EX003", subject: "Quantum Mechanics", date: "2024-03-19", time: "09:00", students: 60, hall: "Hall C", invigilators: 2, status: "pending" as const },
  { id: "EX004", subject: "Organic Chemistry", date: "2024-03-19", time: "14:00", students: 95, hall: "Hall A", invigilators: 3, status: "assigned" as const },
  { id: "EX005", subject: "Cell Biology", date: "2024-03-20", time: "09:00", students: 110, hall: "Hall B", invigilators: 3, status: "pending" as const },
  { id: "EX006", subject: "Machine Learning", date: "2024-03-20", time: "14:00", students: 75, hall: "Hall D", invigilators: 2, status: "conflict" as const },
];

export const nlpRequests = [
  { id: "R001", faculty: "Dr. Priya Sharma", text: "I am not available on 19th March due to a conference.", tokens: [{ label: "Date", value: "2024-03-19" }, { label: "Status", value: "Unavailable" }, { label: "Reason", value: "Conference" }], status: "processed" as const },
  { id: "R002", faculty: "Prof. Emily Davis", text: "Please avoid morning duties for me next week.", tokens: [{ label: "Time", value: "09:00-12:00" }, { label: "Action", value: "Block" }, { label: "Range", value: "18 Mar - 22 Mar" }], status: "processed" as const },
  { id: "R003", faculty: "Dr. Michael Brown", text: "I can take only one duty per day maximum.", tokens: [{ label: "Max Duties", value: "1/day" }, { label: "Scope", value: "All dates" }], status: "pending" as const },
];

export const conflicts = [
  { id: "C001", type: "Unavailability Clash", faculty: "Dr. Priya Sharma", exam: "Quantum Mechanics", date: "2024-03-19", severity: "high" as const, resolved: false },
  { id: "C002", type: "Double Booking", faculty: "Dr. Michael Brown", exam: "Organic Chemistry", date: "2024-03-19", severity: "medium" as const, resolved: false },
  { id: "C003", type: "Overload", faculty: "Prof. James Wilson", exam: "Linear Algebra", date: "2024-03-18", severity: "low" as const, resolved: true },
];

export const notifications = [
  { id: "N001", title: "Duty Assigned", message: "You have been assigned to invigilate Data Structures on Mar 18.", time: "2 hours ago", read: false },
  { id: "N002", title: "Schedule Update", message: "Quantum Mechanics exam moved to Hall C from Hall D.", time: "5 hours ago", read: false },
  { id: "N003", title: "Conflict Resolved", message: "Your scheduling conflict on Mar 19 has been resolved.", time: "1 day ago", read: true },
  { id: "N004", title: "Reminder", message: "Your invigilation duty for Linear Algebra is tomorrow at 14:00.", time: "1 day ago", read: true },
];

export const departments = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology"];

export const halls = ["Hall A", "Hall B", "Hall C", "Hall D"];
