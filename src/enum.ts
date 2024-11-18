export enum NOTI_TYPE {
  DEBOOK = 'debook',
  FOLLOW = 'follow',
  COMMENT = 'comment',
  LIKE = 'like',
  INVITATION = 'invitation',
  COLLABORATOR = 'collaborator',
}

export enum INVITATION_STATUS_TYPE {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

export enum NOTI_STATUS_TYPE {
  READ = 'read',
  PENDING = 'pending',
}

export enum ACHIEVE_TYPE {
  NONE = 'none',
  FRIEND = 'friend',
  LINE = 'line',
  BOOKLIST = 'booklist',
  FOLLOW = 'follow',
}

export enum LINE_TYPE {
  VIDEO = 'video',
  TEXT = 'text',
}

export enum NOTI_MESSAGES {
  INVITATION_ACCEPTED = 'Your invitation is accepted.',
  INVITATION_DECLINED = 'Your invitation is declined.',
  FOLLOW_BY = 'You are followed by $NAME.',
  INVITE_BOOKLIST_COLLABORATOR = '$NAME invited you as a collaborator for a boollist #$BOOKLIST.',
  ACCEPT_BOOKLIST_COLLABORATOR = '$NAME is accepted your collaborator invitation.',
  REJECT_BOOKLIST_COLLABORATOR = '$NAME is rejected your collaborator invitation.',
}
