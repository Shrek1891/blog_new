import {MdHomeFilled} from "react-icons/md";
import {IoNotifications} from "react-icons/io5";
import {FaUser} from "react-icons/fa";
import {Link, useNavigate} from "react-router-dom";
import {BiLogOut} from "react-icons/bi";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import apiClient from "../../api/client.ts";
import type {User} from "../../types/types.ts";

const Sidebar = () => {
    const navigate = useNavigate();
    const { data } = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            try {
                const data = await apiClient.get<User | { errors?: unknown[] } | null>('/auth/me');
                if (data && typeof data === 'object' && 'errors' in data && Array.isArray(data.errors) && data.errors.length > 0) {
                    return null;
                }
                return data as User | null;
            } catch (error) {
                console.error("Error fetching user data:", error);
                throw error;
            }
        },
        retry: false,
    });
    const queryClient = useQueryClient();
    const {mutate: logoutMutate} = useMutation({
        mutationFn: async () => {
            try {
                return await apiClient.post<{ message?: string }>('/auth/logout');
            } catch (error) {
                console.error("Error fetching user data:", error);
                throw error;
            }
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to fetch user data");
        },
        onSuccess: () => {
            toast.success("Logged out successfully!");
            queryClient.setQueryData(['authUser'], null);
            queryClient.invalidateQueries({queryKey: ['authUser']});
            navigate('/');
        }
    });


    return (
        <div className='md:flex-[2_2_0] w-18 max-w-52'>
            <div
                className='sticky top-0 left-0 h-screen flex flex-col backdrop-blur-md bg-white/3 border-r border-white/10 w-20 md:w-full shadow-xl'>
                <Link to='/' className='flex justify-center md:justify-start'>
                    React Social
                </Link>
                <ul className='flex flex-col gap-3 mt-4'>
                    <li className='flex justify-center md:justify-start'>
                        <Link
                            to='/'
                            className='flex gap-3 items-center hover:bg-white/10 backdrop-blur-sm transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
                        >
                            <MdHomeFilled className='w-8 h-8'/>
                            <span className='text-lg hidden md:block'>Home</span>
                        </Link>
                    </li>
                    <li className='flex justify-center md:justify-start'>
                        <Link
                            to='/notifications'
                            className='flex gap-3 items-center hover:bg-white/10 backdrop-blur-sm transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
                        >
                            <IoNotifications className='w-6 h-6'/>
                            <span className='text-lg hidden md:block'>Notifications</span>
                        </Link>
                    </li>

                    <li className='flex justify-center md:justify-start'>
                        <Link
                            to={`/profile/${data?.username}`}
                            className='flex gap-3 items-center hover:bg-white/10 backdrop-blur-sm transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
                        >
                            <FaUser className='w-6 h-6'/>
                            <span className='text-lg hidden md:block'>Profile</span>
                        </Link>
                    </li>
                </ul>
                {data && (
                    <Link
                        to={`/profile/${data.username}`}
                        className='mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-white/10 backdrop-blur-sm py-2 px-4 rounded-full'
                    >
                        <div className='avatar hidden md:inline-flex'>
                            <div className='w-8 rounded-full'>
                                <img src={data?.profileImg || "/avatar-placeholder.png"}/>
                            </div>
                        </div>
                        <div className='flex justify-between flex-1'>
                            <div className='hidden md:block'>
                                <p className='text-white font-bold text-sm w-20 truncate'>{data?.fullName}</p>
                                <p className='text-slate-500 text-sm'>@{data?.username}</p>
                            </div>
                            <BiLogOut
                                className='w-5 h-5 cursor-pointer'
                                onClick={(event) => {
                                    event.preventDefault();
                                    logoutMutate();
                                }}
                            />
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
};
export default Sidebar;