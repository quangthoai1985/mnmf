import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { Gallery } from "../components/Gallery";
import { TopVoted } from "../components/TopVoted";
import { AuthModal } from "../components/auth/AuthModal";
import { ChangePasswordModal } from "../components/auth/ChangePasswordModal";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

export const Home = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            checkAdmin(session?.user ?? null);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            checkAdmin(session?.user ?? null);
        });

        // Handle password reset flow
        if (location.hash.includes('type=recovery')) {
            setIsChangePasswordModalOpen(true);
            // Clear hash to prevent reopening on refresh
            navigate('/', { replace: true });
        }

        return () => subscription.unsubscribe();
    }, [location, navigate]);

    const checkAdmin = async (currentUser: User | null) => {
        if (!currentUser) {
            setIsAdmin(false);
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();

        setIsAdmin(profile?.role === 'admin');
    };

    const handleLoginClick = () => {
        setAuthModalTab("login");
        setIsAuthModalOpen(true);
    };

    const handleRegisterClick = () => {
        setAuthModalTab("register");
        setIsAuthModalOpen(true);
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            showToast("Đăng xuất thất bại", "error");
        } else {
            showToast("Đăng xuất thành công", "success");
        }
    };

    // Scroll to gallery function
    const scrollToGallery = () => {
        const gallerySection = document.getElementById('gallery-section');
        if (gallerySection) {
            gallerySection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-black text-white dark selection:bg-white selection:text-black">
            <Navbar
                onLoginClick={handleLoginClick}
                onRegisterClick={handleRegisterClick}
                onLogoutClick={handleLogout}
                onChangePasswordClick={() => setIsChangePasswordModalOpen(true)}
                user={user}
                isAdmin={isAdmin}
            />

            <Hero onEnter={scrollToGallery} />

            <TopVoted />

            <div id="gallery-section">
                <Gallery user={user} onLoginClick={handleLoginClick} />
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialTab={authModalTab}
            />

            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
            />
        </div>
    );
};
