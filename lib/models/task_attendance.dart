class DailyTask {
  final String date; // YYYY-MM-DD
  final String leetcodeUrl;
  final String csTopic;
  final String csTopicDescription;
  final String motivationQuote;

  DailyTask({
    required this.date,
    required this.leetcodeUrl,
    required this.csTopic,
    required this.csTopicDescription,
    required this.motivationQuote,
  });

  factory DailyTask.fromMap(Map<String, dynamic> map, String id) {
    return DailyTask(
      date: id,
      leetcodeUrl: map['leetcodeUrl'] ?? '',
      csTopic: map['csTopic'] ?? '',
      csTopicDescription: map['csTopicDescription'] ?? '',
      motivationQuote: map['motivationQuote'] ?? '',
    );
  }
}

class AttendanceRecord {
  final String id;
  final String date;
  final String studentUid;
  final String regNo;
  final String teamId;
  final bool isPresent;
  final DateTime timestamp;
  final String markedBy;

  AttendanceRecord({
    required this.id,
    required this.date,
    required this.studentUid,
    required this.regNo,
    required this.teamId,
    required this.isPresent,
    required this.timestamp,
    required this.markedBy,
  });

  factory AttendanceRecord.fromMap(Map<String, dynamic> map, String id) {
    return AttendanceRecord(
      id: id,
      date: map['date'] ?? '',
      studentUid: map['studentUid'] ?? '',
      regNo: map['regNo'] ?? '',
      teamId: map['teamId'] ?? '',
      isPresent: map['status'] == 'PRESENT',
      timestamp: (map['timestamp'] as dynamic).toDate(),
      markedBy: map['markedBy'] ?? '',
    );
  }
}
