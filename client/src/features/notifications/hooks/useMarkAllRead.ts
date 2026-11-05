import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAllNotificationsRead } from '../api/notificationsApi';
import { notificationKeys } from '../notificationKeys';

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.myNotifications });
    },
  });
};
