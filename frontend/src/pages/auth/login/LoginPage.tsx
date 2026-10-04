import {type ChangeEvent, type SubmitEvent, useState} from "react";
import {Link} from "react-router-dom";
import {useMutation, useQueryClient} from "@tanstack/react-query";


import {MdOutlineMail, MdPassword} from "react-icons/md";
import toast from "react-hot-toast";
import apiClient from "../../../api/client.ts";


const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const queryClient = useQueryClient();

    const {
        mutate: loginMutate,
        isError: mutationError,
        isPending: mutationPending,
        error: mutationErrorMessage
    } = useMutation<
        unknown,
        Error,
        typeof formData
    >({
        mutationFn: async ({username, password}) => {
            const data = await apiClient.post<{ errors?: Array<{ message: string }> }>('/auth/login', {username, password});
            if (Array.isArray(data.errors) && data.errors.length > 0) {
                throw new Error(data.errors[0].message);
            }
            toast.success("Logged in successfully!");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['authUser']});
        }
    });

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        loginMutate(formData);
    };
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    return (
        <div
            className='flex-1 min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(120,119,198,0.35),transparent_30%),linear-gradient(135deg,#0f172a_0%,#111827_55%,#1f2937_100%)] px-4 py-10 flex items-center justify-center'>
            <div
                className='w-full max-w-md rounded-3xl border border-white/20 bg-slate-900/30 p-8 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center'>
                <form className='flex flex-wrap gap-4 justify-center items-center' onSubmit={handleSubmit}>
                    <h1 className='text-4xl font-extrabold text-white'>{"Let's"} go.</h1>
                    <label
                        className='w-full input input-bordered rounded-2xl border-white/20 bg-white/10 text-white backdrop-blur-sm flex items-center gap-2'>
                        <MdOutlineMail/>
                        <input
                            type='text'
                            className='grow bg-transparent text-white/90 outline-none'
                            placeholder='username'
                            name='username'
                            onChange={handleInputChange}
                            value={formData.username}
                        />
                    </label>

                    <label
                        className='input  w-full input-bordered rounded-2xl border-white/20 bg-white/10 text-white backdrop-blur-sm flex items-center gap-2'>
                        <MdPassword/>
                        <input
                            type='password'
                            className='grow bg-transparent text-white/90 outline-none'
                            placeholder='Password'
                            name='password'
                            onChange={handleInputChange}
                            value={formData.password}
                        />
                    </label>
                    <button
                        className='btn rounded-full border-white/20 bg-sky-500/90 text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400'>
                        {mutationPending ? "Loading..." : "Login"}
                    </button>
                    {mutationError && mutationErrorMessage &&
                        <p className='text-red-500'>{mutationErrorMessage.message}</p>}
                </form>
                <div className='flex flex-col gap-2 mt-4 items-center'>
                    <p className='text-white text-lg'>{"Don't"} have an account?</p>
                    <Link to='/signup'>
                        <button
                            className='btn rounded-full border-white/20 bg-slate-600/90 text-white shadow-lg shadow-slate-600/20 transition hover:bg-slate-500'>
                            Sign up
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
export default LoginPage;
