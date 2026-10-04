import {Link} from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import {useQuery} from "@tanstack/react-query";
import useFollowUser from "../hooks/userFollow.tsx";
import type {User} from "../../types/types.ts";
import apiClient from "../../api/client.ts";

const RightPanel = () => {
    const {data: suggestedUsers, isLoading: usersLoading, error: usersError} = useQuery({
        queryKey: ['suggestedUsers'],
        queryFn: async () => {
            try {
                return await apiClient.get<User[]>('/users/suggested');
            } catch (error) {
                console.error("Error fetching suggested users:", error);
                throw error;
            }
        }
    });
    const {followUser, isPending} = useFollowUser();

    if (usersError) {
        return <p className='text-center my-4'>Error loading suggested users. Please try again later.</p>;
    }


    return (
        <div className='hidden lg:block my-4 mx-2'>
            <div className='backdrop-blur-lg bg-white/5 p-4 rounded-2xl sticky top-2 border border-white/20 shadow-2xl'>
                <p className='font-bold text-white/90'>Who to follow</p>
                <div className='flex flex-col gap-4'>
                    {/* item */}
                    {usersLoading || isPending && (
                        <>
                            <RightPanelSkeleton/>
                            <RightPanelSkeleton/>
                            <RightPanelSkeleton/>
                            <RightPanelSkeleton/>
                        </>
                    )}
                    {!usersLoading && suggestedUsers?.map((user: User) => (
                        <Link
                            to={`/profile/${user.username}`}
                            className='flex items-center justify-between gap-4'
                            key={user._id}
                        >
                            <div className='flex gap-2 items-center'>
                                <div className='avatar'>
                                    <div className='w-8 rounded-full'>
                                        <img src={user.profileImg || "/avatar-placeholder.png"}/>
                                    </div>
                                </div>
                                <div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user.fullName}
										</span>
                                    <span className='text-sm text-slate-500'>@{user.username}</span>
                                </div>
                            </div>
                            <div>
                                <button
                                    className='btn bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full btn-sm backdrop-blur-md transition'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        followUser(user._id);
                                    }
                                    }
                                >
                                    Follow
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default RightPanel;