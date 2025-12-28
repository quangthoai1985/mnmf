export type Category = "Landscape" | "Portrait" | "Street Life";

export interface Photo {
    id: string;
    url: string;
    title: string;
    author: string;
    category: Category;
    likes: number; // For initial state
}

export const MOCK_PHOTOS: Photo[] = [
    // Landscape
    {
        id: "1",
        url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop",
        title: "Mountain Silence",
        author: "Elena Rivers",
        category: "Landscape",
        likes: 124,
    },
    {
        id: "2",
        url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2074&auto=format&fit=crop",
        title: "Misty Valley",
        author: "John Smith",
        category: "Landscape",
        likes: 98,
    },
    {
        id: "3",
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop",
        title: "Yosemite Falls",
        author: "Kodak Portra",
        category: "Landscape",
        likes: 210,
    },

    // Portrait
    {
        id: "4",
        url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1964&auto=format&fit=crop",
        title: "Soulful Eyes",
        author: "Maria Garcia",
        category: "Portrait",
        likes: 156,
    },
    {
        id: "5",
        url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop",
        title: "The Thinker",
        author: "David Chen",
        category: "Portrait",
        likes: 87,
    },
    {
        id: "6",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
        title: "Just a Smile",
        author: "Sarah Jones",
        category: "Portrait",
        likes: 132,
    },

    // Street Life
    {
        id: "7",
        url: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=2139&auto=format&fit=crop",
        title: "Subway Motion",
        author: "Street Walker",
        category: "Street Life",
        likes: 180,
    },
    {
        id: "8",
        url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop",
        title: "City Rain",
        author: "Neon Nights",
        category: "Street Life",
        likes: 245,
    },
    {
        id: "9",
        url: "https://images.unsplash.com/photo-1517732306149-e8f08f64f483?q=80&w=2070&auto=format&fit=crop",
        title: "Market Chaos",
        author: "Busy Bee",
        category: "Street Life",
        likes: 112,
    },
];
