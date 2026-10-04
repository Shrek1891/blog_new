import {CiImageOn} from "react-icons/ci";
import {BsEmojiSmileFill} from "react-icons/bs";
import {useRef, useState} from "react";
import {IoCloseSharp} from "react-icons/io5";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import apiClient from "../../api/client.ts";
import type {User} from "../../types/types.ts";

const CreatePost = () => {
    const [text, setText] = useState("");
    const [img, setImg] = useState<string  | null | ArrayBuffer>(null);
    const imgRef = useRef<HTMLInputElement | null>(null);
    const {data: authUser} = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            try {
                const data = await apiClient.get<User | { errors?: unknown[] } | null>('/auth/me');
                if (data && typeof data === 'object' && 'errors' in data && Array.isArray(data.errors) && data.errors.length > 0) {
                    return null;
                }
                return data as User | null;
            } catch (e) {
                console.error("Error fetching user data:", e);
                throw e;
            }
        },
        retry: false,
    });
    const queryClient = useQueryClient();
    const {mutate: createPost, isPending, isError} = useMutation({
        mutationFn: async ({text, img}: { text: string; img: string | null | ArrayBuffer }) => {
            try {
                return await apiClient.post('/posts', {text, img});
            } catch (error) {
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error("Failed to create post");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["posts"]});
            setText("");
            setImg(null);
            if (imgRef.current) {
                imgRef.current.value = '';
            }
            toast.success("Post created successfully!");
            queryClient.invalidateQueries({queryKey: ["posts"]});
        },
        onError: (error) => {
            console.error("Error creating post:", error);
            toast.error("Failed to create post");
        },
    });


    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        createPost({text, img});
    };

    const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            setImg(null);
            return;
        }
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className='flex p-4 items-start gap-4 border-b border-white/10 backdrop-blur-sm bg-white/3'>
            <div className='avatar'>
                <div className='w-8 rounded-full'>
                    <img src={authUser?.profileImg || "/avatar-placeholder.png"}/>
                </div>
            </div>
            <form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
				<textarea
                    className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none bg-transparent text-white'
                    placeholder='What is happening?!'
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                {img && (
                    <div className='relative w-72 mx-auto'>
                        <IoCloseSharp
                            className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
                            onClick={() => {
                                setImg(null);
                                if (imgRef.current)
                                {
                                    imgRef.current.value = '';
                                }
                            }}
                        />
                        <img src={img as string} className='w-full mx-auto h-72 object-contain rounded'/>
                    </div>
                )}

                <div className='flex justify-between border-t border-white/10 py-2'>
                    <div className='flex gap-1 items-center'>
                        <CiImageOn
                            className='fill-primary w-6 h-6 cursor-pointer'
                            onClick={() => imgRef.current?.click()}
                        />
                        <BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer'/>
                    </div>
                    <input type='file' hidden ref={imgRef} onChange={handleImgChange}/>
                    <button className='btn btn-primary rounded-full btn-sm text-white px-4 hover:shadow-lg transition'>
                        {isPending ? "Posting..." : "Post"}
                    </button>
                </div>
                {isError && <div className='text-red-500'>Something went wrong</div>}
            </form>
        </div>
    );
};
export default CreatePost;