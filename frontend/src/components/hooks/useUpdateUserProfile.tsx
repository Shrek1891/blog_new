import {useMutation, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import apiClient from "../../api/client.ts";

export type UpdateUserProfileFormData = {
    fullName?: string;
    username?: string;
    email?: string;
    bio?: string;
    link?: string;
    profileImg?: string | ArrayBuffer | null;
    coverImg?: string | ArrayBuffer | null;
    newPassword?: string;
    currentPassword?: string;
};

const useUpdateUserProfile = (formData: UpdateUserProfileFormData) => {
    const queryClient = useQueryClient();
    const {mutateAsync: updateUserProfile, isPending: isUpdatedUserPending} = useMutation({
        mutationFn: async () => {
            try {
                return await apiClient.post('/users/update', formData);
            } catch (e) {
                console.error("Error fetching updated user data:", e);
                throw e;
            }
        },
        retry: false,
        onSuccess: () => {
            toast.success("Profile updated successfully");
            Promise.all([
                queryClient.invalidateQueries({queryKey: ['authUser']}),
                queryClient.invalidateQueries({queryKey: ['userProfile']}),
            ]);
        },
    });

    return {updateUserProfile, isUpdatedUserPending};
};

export default useUpdateUserProfile;