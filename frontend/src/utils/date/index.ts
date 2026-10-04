export const formatPostDate = (createdAt: string | Date) => {
    const currentDate = new Date();
    const createdAtDate = new Date(createdAt);

    const timeDifferenceInSeconds = Math.floor((currentDate.getTime() - createdAtDate.getTime()) / 1000);
    const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);
    const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60);
    const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);

    if (timeDifferenceInDays > 1) {
        return createdAtDate.toLocaleDateString("en-US", {month: "short", day: "numeric"});
    }
    if (timeDifferenceInDays === 1) {
        return "1d";
    }
    if (timeDifferenceInHours >= 1) {
        return `${timeDifferenceInHours}h`;
    }
    if (timeDifferenceInMinutes >= 1) {
        return `${timeDifferenceInMinutes}m`;
    }
    return "Just now";
};

export const formatMemberSinceDate = (createdAt: string | Date) => {
    const date = new Date(createdAt);
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `Joined ${month} ${year}`;
};