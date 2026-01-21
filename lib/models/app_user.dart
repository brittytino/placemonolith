enum UserRole {
  student,
  teamLeader,
  coordinator,
  placementRep
}

class AppUser {
  final String uid;
  final String email;
  final String regNo;
  final String name;
  final String? teamId;
  final bool isTeamLeader;
  final bool isCoordinator;
  final bool isPlacementRep;

  AppUser({
    required this.uid,
    required this.email,
    required this.regNo,
    required this.name,
    this.teamId,
    this.isTeamLeader = false,
    this.isCoordinator = false,
    this.isPlacementRep = false,
  });

  factory AppUser.fromMap(String uid, Map<String, dynamic> data) {
    final roles = data['roles'] as Map<String, dynamic>? ?? {};
    return AppUser(
      uid: uid,
      email: data['email'] ?? '',
      regNo: data['regNo'] ?? '',
      name: data['name'] ?? '',
      teamId: data['teamId'],
      isTeamLeader: roles['isTeamLeader'] ?? false,
      isCoordinator: roles['isCoordinator'] ?? false,
      isPlacementRep: roles['isPlacementRep'] ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'regNo': regNo,
      'name': name,
      'teamId': teamId,
      'roles': {
        'isTeamLeader': isTeamLeader,
        'isCoordinator': isCoordinator,
        'isPlacementRep': isPlacementRep,
      },
    };
  }
}
