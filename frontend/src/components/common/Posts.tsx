import type {Post_type} from "../../types/types.ts";
import Post from "./Post.tsx";
import PostSkeleton from "../skeletons/PostSkeleton.tsx";
import {useQuery} from "@tanstack/react-query";
import {useEffect} from "react";
import apiClient from "../../api/client.ts";

type PostsProps = {
    feedType: string;
    username?: string;
    userId?: string;
};

const Posts = ({feedType, username, userId}: PostsProps) => {
    const getPostEndpoints = () => {
        switch (feedType) {
            case 'forYou':
                return '/api/posts/all';
            case 'following':
                return '/api/posts/following';
            case 'posts':
                return username ? `/api/posts/user/${username}` : null;
            case 'likes':
                return userId ? `/api/posts/likes/${userId}` : null;
            default:
                return '/api/posts/all';
        }
    }

    const postEndpoint = getPostEndpoints();
    const {data: posts, isLoading, error: postsError, refetch, isRefetching} = useQuery({
        queryKey: ['posts', feedType, username, userId],
        enabled: Boolean(postEndpoint),
        queryFn: async () => {
            if (!postEndpoint) {
                return [];
            }
            try {
                return await apiClient.get<Post_type[]>(postEndpoint);
            } catch (e) {
                console.error("Error fetching posts:", e);
                throw e;
            }
        }
    });
    useEffect(() => {
        refetch();
    }, [feedType, userId, refetch]);
    if (postsError) {
        return <p className='text-center my-4'>Error loading posts. Please try again later.</p>;
    }
    return (
        <>
            {isLoading || isRefetching && (
                <div className='flex flex-col justify-center'>
                    <PostSkeleton/>
                    <PostSkeleton/>
                    <PostSkeleton/>
                </div>
            )}
            {!isLoading && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
            {!isLoading && posts && (
                <div>
                    {posts.map((post:Post_type) => (
                        <Post key={post._id} post={post}/>
                    ))}
                </div>
            )}
        </>
    );
};
export default Posts;