import { useRef, useState, useEffect } from "react";
import { Hero } from "../components/Hero";
import { Gallery } from "../components/Gallery";
import { Navbar } from "../components/Navbar";
import { AuthModal } from "../components/auth/AuthModal";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export const Home = () => {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authTab, setAuthTab] = useState<"login" | "register">("login");
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const galleryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkUserAndRole = async (currentUser: User | null) => {
            setUser(currentUser);
            if (currentUser) {
                // Check if user is admin
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', currentUser.id)
                    .single();
                setIsAdmin(profile?.role === 'admin');
            } else {
                setIsAdmin(false);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            checkUserAndRole(session?.user ?? null);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            checkUserAndRole(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const scrollToGallery = () => {
        galleryRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const openAuth = (tab: "login" | "register") => {
        setAuthTab(tab);
        setIsAuthOpen(true);
    };

    return (
        <div className="min-h-screen bg-background text-foreground dark selection:bg-white selection:text-black">
            <Navbar
                onLoginClick={() => openAuth("login")}
                onRegisterClick={() => openAuth("register")}
                onLogoutClick={handleLogout}
                user={user}
                isAdmin={isAdmin}
            />

            <Hero onEnter={scrollToGallery} />

            <div ref={galleryRef}>
                <Gallery user={user} onLoginClick={() => openAuth("login")} />
            </div>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                initialTab={authTab}
            />
        </div>
    );
};
