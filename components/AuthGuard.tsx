import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const { isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoggedIn) {
            router.replace("/login"); // ✅ 로그인 안 했으면 로그인 페이지로 이동
        }
    }, [isLoggedIn]);

    if (!isLoggedIn) {
        return null; // 아직 리디렉션 중
    }

    return <>{children}</>;
};

export default AuthGuard;
