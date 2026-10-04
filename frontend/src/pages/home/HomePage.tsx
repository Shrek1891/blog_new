import {useState} from "react";
import CreatePost from "./CreatePost.tsx";
import Posts from "../../components/common/Posts.tsx";



const HomePage = () => {
    const [feedType, setFeedType] = useState("forYou");


    return (
        <div
            className='flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(120,119,198,0.35),transparent_30%),linear-gradient(135deg,#0f172a_0%,#111827_55%,#1f2937_100%)]'>
            {/* Header with glassmorphism */}
            <div className='flex w-full backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-10'>
                <div
                    className="flex justify-center flex-1 p-3 hover:backdrop-blur-lg hover:bg-white/10 transition duration-300 cursor-pointer relative"
                    onClick={() => setFeedType("forYou")}
                >
                    For you
                    {feedType === "forYou" && (
                        <div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
                    )}
                </div>
                <div
                    className='flex justify-center flex-1 p-3 hover:backdrop-blur-lg hover:bg-white/10 transition duration-300 cursor-pointer relative'
                    onClick={() => setFeedType("following")}
                >
                    Following
                    {feedType === "following" && (
                        <div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
                    )}
                </div>
            </div>

            {/*  CREATE POST INPUT */}
            <CreatePost/>

            {/* POSTS */}
            <Posts feedType={feedType} />
        </div>

    );
};
export default HomePage;