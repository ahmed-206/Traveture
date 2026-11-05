import { useQuery } from '@tanstack/react-query';
import { getMyNotifications } from '../api/notificationsApi';
import { notificationKeys } from '../notificationKeys';

export const useMyNotifications = () => {
  return useQuery({
    queryKey: notificationKeys.myNotifications,
    queryFn: getMyNotifications,
  });
};
