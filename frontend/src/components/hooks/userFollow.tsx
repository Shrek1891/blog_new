import {useMutation, useQueryClient} from '@tanstack/react-query';
import toast from "react-hot-toast";
import apiClient from "../../api/client.ts";

const useFollowUser = () => {
    const queryClient = useQueryClient();

    const {mutate: followUser, isPending, isError} = useMutation({
        mutationFn: async (userId: string) => {
            try {
                return await apiClient.post<{ message?: string }>(`/users/follow/${userId}`);
            } catch (error) {
                toast.error('Error following user');
                throw error;
            }
        },
        onSuccess: () => {
            Promise.all([
                queryClient.invalidateQueries({queryKey: ['suggestedUsers']}),
                queryClient.invalidateQueries({queryKey: ['authUser']})
            ])

            toast.success('User followed successfully');
        }
    });

    return {followUser, isPending, isError};
};

export default useFollowUser;