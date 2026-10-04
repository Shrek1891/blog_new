import {FaRegComment, FaRegHeart, FaRegBookmark, FaTrash} from "react-icons/fa";
import {BiRepost} from "react-icons/bi";
import {useState} from "react";
import {Link} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {formatPostDate} from "../../utils/date";
import type {Post_type, User} from "../../types/types.ts";
import apiClient from "../../api/client.ts";

const Post = ({post}: { post: Post_type }) => {
    const [comment, setComment] = useState("");
    const queryClient = useQueryClient();

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
    const {mutate: deletePost, isPending: isDeleting} = useMutation({
        mutationFn: async () => {
            try {
                return await apiClient.del(`/posts/${post._id}`);
            } catch (error) {
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error("Something went wrong");
            }
        },
        onSuccess: () => {
            toast.success("Post deleted successfully");
            queryClient.invalidateQueries({queryKey: ["posts"]});
        },
    });

    const {mutate: likePost, isPending: isLiking} = useMutation({
        mutationFn: async () => {
            try {
                return await apiClient.post(`/posts/like/${post._id}`);
            } catch (error) {
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error("Something went wrong");
            }
        },
        onSuccess: (updatedLikes) => {
            toast.success("Post liked successfully");
            queryClient.setQueriesData({queryKey: ["posts"]}, (oldData: Post_type[]) => {
                return oldData.map((p) => {
                    if (p._id === post._id) {
                        return {...p, likes: updatedLikes};
                    }
                    return p;
                });
            });
        },
    });

    const {mutate: commentPost, isPending: isCommenting} = useMutation({
        mutationFn: async () => {
            try {
                return await apiClient.post(`/posts/comment/${post._id}`, {text: comment});
            } catch (error) {
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error("Something went wrong");
            }
        },
        onSuccess: (newComment) => {
            toast.success("Comment added successfully");
            queryClient.setQueriesData({queryKey: ["posts"]}, (oldData: Post_type[]) => {
                return oldData.map((p) => {
                    if (p._id === post._id) {
                        return {...p, comments: [...p.comments, newComment]};
                    }
                    return p;
                });
            });
        },
    });

    const isMyPost = authUser?._id === post.user._id;
    const postOwner = post.user;
    const isLiked = Boolean(authUser && post.likes?.includes(authUser._id));
    const formattedDate = formatPostDate(post.createdAt);

    const handleDeletePost = () => {
        deletePost()
    };

    const handlePostComment = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isCommenting) return;
        commentPost();
        setComment("");
    };

    const handleLikePost = () => {
        if (isLiking) return;
        likePost();
    };

    if (isLiking || isDeleting || isCommenting) {
        return (
            <div className='flex justify-center items-center p-4 border-b border-white/10 backdrop-blur-sm'>
                <span className='loading loading-spinner loading-md'></span>
            </div>
        );
    }

    return (
        <>
            <div
                className='flex gap-2 items-start p-4 border-b border-white/10 backdrop-blur-sm hover:bg-white/5 transition duration-200'>
                <div className='avatar'>
                    <Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
                        <img src={postOwner.profileImg || "/avatar-placeholder.png"}/>
                    </Link>
                </div>
                <div className='flex flex-col flex-1'>
                    <div className='flex gap-2 items-center'>
                        <Link to={`/profile/${postOwner.username}`} className='font-bold'>
                            {postOwner.fullName}
                        </Link>
                        <span className='text-gray-700 flex gap-1 text-sm'>
							<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
                        {isMyPost && (
                            <span className='flex justify-end flex-1'>
								<FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost}/>
							</span>
                        )}
                    </div>
                    <div className='flex flex-col gap-3 overflow-hidden'>
                        <span>{post.text}</span>
                        {post.img && (
                            <img
                                src={post.img}
                                className='h-80 object-contain rounded-lg border border-gray-700'
                                alt=''
                            />
                        )}
                    </div>
                    <div className='flex justify-between mt-3'>
                        <div className='flex gap-4 items-center w-2/3 justify-between'>
                            <div
                                className='flex gap-1 items-center cursor-pointer group'
                                onClick={() => {
                                    const modal = document.getElementById(`comments_modal_${post._id}`) as HTMLDialogElement | null;
                                    modal?.showModal();
                                }}
                            >
                                <FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400'/>
                                <span className='text-sm text-slate-500 group-hover:text-sky-400'>
									{post.comments.length}
								</span>
                            </div>
                            {/* We're using Modal Component from DaisyUI */}
                            <dialog id={`comments_modal_${post._id}`} className='modal border-none outline-none'>
                                <div
                                    className='modal-box rounded backdrop-blur-lg bg-black/50 border border-white/20 shadow-2xl'>
                                    <h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
                                    <div className='flex flex-col gap-3 max-h-60 overflow-auto'>
                                        {post.comments.length === 0 && (
                                            <p className='text-sm text-slate-500'>
                                                No comments yet 🤔 Be the first one 😉
                                            </p>
                                        )}
                                        {post.comments.map((comment, index) => (
                                            <div key={`comment-${index}`} className='flex gap-2 items-start'>
                                                <div className='avatar'>
                                                    <div className='w-8 rounded-full'>
                                                        <img
                                                            src={comment.user.profileImg || "/avatar-placeholder.png"}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='flex flex-col'>
                                                    <div className='flex items-center gap-1'>
                                                        <span className='font-bold'>{comment.user.fullName}</span>
                                                        <span className='text-gray-700 text-sm'>
															@{comment.user.username}
														</span>
                                                    </div>
                                                    <div className='text-sm'>{comment.text}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <form
                                        className='flex gap-2 items-center mt-4 border-t border-white/10 pt-2'
                                        onSubmit={handlePostComment}
                                    >
										<textarea
                                            className='textarea w-full p-1 rounded text-md resize-none bg-white/5 border border-white/20 focus:outline-none focus:border-white/40 text-white'
                                            placeholder='Add a comment...'
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                        <button className='btn btn-primary rounded-full btn-sm text-white px-4'>
                                            {isCommenting ? (
                                                <span className='loading loading-spinner loading-md'></span>
                                            ) : (
                                                "Post"
                                            )}
                                        </button>
                                    </form>
                                </div>
                                <form method='dialog' className='modal-backdrop'>
                                    <button className='outline-none'>close</button>
                                </form>
                            </dialog>
                            <div className='flex gap-1 items-center group cursor-pointer'>
                                <BiRepost className='w-6 h-6  text-slate-500 group-hover:text-green-500'/>
                                <span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
                            </div>
                            <div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
                                {!isLiked && (
                                    <FaRegHeart
                                        className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500'/>
                                )}
                                {isLiked && <FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 '/>}

                                <span
                                    className={`text-sm text-slate-500 group-hover:text-pink-500 ${
                                        isLiked ? "text-pink-500" : ""
                                    }`}
                                >
									{post.likes.length}
								</span>
                            </div>
                        </div>
                        <div className='flex w-1/3 justify-end gap-2 items-center'>
                            <FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer'/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Post;