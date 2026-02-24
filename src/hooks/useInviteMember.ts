import { useMutation } from '@tanstack/react-query';
import * as api from '@/lib/api';

interface InviteMemberInput {
  email: string;
  boardId: string;
  boardName: string;
  inviterId: string;
  inviterEmail: string;
}

export function useInviteMember() {
  return useMutation({
    mutationFn: async ({
      email,
      boardId,
      boardName,
      inviterId,
      inviterEmail,
    }: InviteMemberInput) => {
      const emailLower = email.toLowerCase().trim();

      if (emailLower === inviterEmail.toLowerCase()) {
        throw new Error('You cannot invite yourself');
      }

      const lookupData = await api.lookupByEmail(emailLower);
      if (!lookupData.exists) {
        throw new Error(
          'No user found with this email. They need to sign up first.'
        );
      }

      const targetUserId = lookupData.userId;

      const memberCheck = await api.checkIsMember(boardId, targetUserId);
      if (memberCheck.isMember) {
        throw new Error('This user is already a member of the board');
      }

      const inviteCheck = await api.checkInvite(targetUserId, boardId);
      if (inviteCheck.exists) {
        throw new Error('An invitation has already been sent to this user');
      }

      await api.createNotification({
        user_id: targetUserId,
        type: 'board_invitation',
        data: {
          board_id: boardId,
          board_name: boardName,
          invited_by_id: inviterId,
          invited_by_email: inviterEmail,
        },
      });
    },
  });
}
