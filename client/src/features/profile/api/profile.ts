import { type ApiSuccessResponse } from '../../../api/api.types';
import api from '../../../api/axios';
import type { User } from '../../auth/types/user.types';


export const updateProfile = async(data:FormData): Promise<User> => {
    const response = await api.patch<ApiSuccessResponse<User>>("users/updateMe", data);
    return response.data.data;
}