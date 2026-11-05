import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationRead } from '../api/notificationsApi';
import { notificationKeys } from '../notificationKeys';

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.myNotifications });
    },
  });
};
