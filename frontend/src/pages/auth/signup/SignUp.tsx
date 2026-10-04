import {Link, useNavigate} from "react-router-dom";
import {useState, type ChangeEvent, type SubmitEvent} from "react";

import {MdOutlineMail, MdPassword, MdDriveFileRenameOutline} from "react-icons/md";
import {FaUser} from "react-icons/fa";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import apiClient from "../../../api/client.ts";
import type {User} from "../../../types/types.ts";

const SignUpPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        fullName: "",
        password: "",
    });

    const {mutate, isError, isPending, error} = useMutation<
        User,
        Error,
        typeof formData
    >({
        mutationFn: ({email, username, fullName, password}) =>
            apiClient.post<User>('/auth/signup', {email, username, fullName, password}),
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to sign up");
        },
        onSuccess: (user) => {
            toast.success("Account created successfully!");
            queryClient.setQueryData(['authUser'], user);
            navigate('/');
        }
    });
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault(); // page won't reload
        mutate(formData);
    };


    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    return (
        <div
            className='min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(120,119,198,0.35),transparent_30%),linear-gradient(135deg,#0f172a_0%,#111827_55%,#1f2937_100%)] px-4 py-10 flex items-center justify-center'>
            <div
                className='w-full max-w-5xl overflow-hidden rounded-4xl border border-white/20 bg-white/10 shadow-[0_25px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl'>
                <div className='grid min-h-160 lg:grid-cols-[1.1fr_0.9fr]'>
                    <div className='hidden lg:flex flex-col justify-center px-12 py-16'>
                        <p className='mb-4 text-sm uppercase tracking-[0.35em] text-sky-200/80'>Welcome</p>
                        <h2 className='text-4xl font-semibold text-white'>Create your account and start sharing your
                            story.</h2>
                        <p className='mt-4 max-w-md text-lg text-slate-200/80'>Join the community and publish your next
                            idea in seconds.</p>
                    </div>

                    <div className='flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12'>
                        <div
                            className='w-full max-w-md rounded-3xl border border-white/20 bg-slate-900/30 p-8 shadow-2xl backdrop-blur-md'>
                            <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                                <h1 className='text-4xl font-extrabold text-white'>Join today.</h1>
                                <label
                                    className='input w-full input-bordered rounded-2xl border-white/20 bg-white/10 text-white backdrop-blur-sm flex items-center gap-2'>
                                    <MdOutlineMail className='text-slate-200'/>
                                    <input
                                        type='email'
                                        className='grow bg-transparent text-white/90 outline-none w-full'
                                        placeholder='Email'
                                        name='email'
                                        onChange={handleInputChange}
                                        value={formData.email}
                                    />
                                </label>
                                <div className='flex flex-wrap gap-4'>
                                    <label
                                        className='input w-full input-bordered rounded-2xl border-white/20 bg-white/10 text-white backdrop-blur-sm flex items-center gap-2 flex-1 min-w-55'>
                                        <FaUser className='text-slate-200'/>
                                        <input
                                            type='text'
                                            className='grow bg-transparent text-white/90 outline-none w-full'
                                            placeholder='Username'
                                            name='username'
                                            onChange={handleInputChange}
                                            value={formData.username}
                                        />
                                    </label>
                                    <label className='input w-full input-bordered rounded-2xl border-white/20 bg-white/10
                                     text-white backdrop-blur-sm flex items-center gap-2 flex-1 min-w-55 '>
                                        <MdDriveFileRenameOutline className='text-slate-200'/>
                                        <input
                                            type='text'
                                            className='grow bg-transparent text-white/90 outline-none w-full'
                                            placeholder='Full Name'
                                            name='fullName'
                                            onChange={handleInputChange}
                                            value={formData.fullName}
                                        />
                                    </label>
                                </div>
                                <label
                                    className='input  w-full input-bordered rounded-2xl border-white/20 bg-white/10 text-white backdrop-blur-sm flex items-center gap-2'>
                                    <MdPassword className='text-slate-200'/>
                                    <input
                                        type='password'
                                        className='grow bg-transparent text-white/90 outline-none w-full'
                                        placeholder='Password'
                                        name='password'
                                        onChange={handleInputChange}
                                        value={formData.password}
                                    />
                                </label>
                                <button
                                    className='btn rounded-full border-white/20 bg-sky-500/90 text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400'>
                                    {isPending ? "Loading..." : "Sign up"}
                                </button>
                                {isError && error?.message && <p className='text-red-400'>{error.message}</p>}
                            </form>

                            <div className='mt-6 flex flex-col gap-2'>
                                <p className='text-lg text-slate-200'>Already have an account?</p>
                                <Link to='/login'>
                                    <button
                                        className='btn w-full rounded-full border-white/20 bg-transparent text-white hover:bg-white/10'>Sign
                                        in
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SignUpPage;
