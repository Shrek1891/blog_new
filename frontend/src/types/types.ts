export type Post_type = {
    _id: string;
    text: string;
    user: User;
    likes: string[];
    comments: Comment[];
    createdAt: Date | string;
    updatedAt: Date | string;
    img?: string;
};

export type User = {
    _id: string;
    username: string;
    email: string;
    password?: string;
    posts?: Post_type[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    profileImg?: string;
    coverImg?: string;
    fullName: string;
    bio?: string;
    link?: string;
    followers?: string[];
    following?: string[];
    joinedDate?: Date | string;
};

export type Comment = {
    _id: string;
    text: string;
    user: User;
    post: Post_type;
    createdAt: Date | string;
    updatedAt: Date | string;
};

export type Notification = {
    _id: string;
    from: User;
    to: User;
    type: "follow" | "like";
    read: boolean;
};