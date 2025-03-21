"use client";

import { useState, useEffect } from "react";
import Auth from "@/components/Auth";
import Chat from "@/components/Chat";
import { supabase } from "@/lib/supabase";
import { User } from "@/types";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 로그인된 사용자 확인
    const checkUser = async () => {
      setLoading(true);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", authUser.id)
          .single();

        setUser({
          id: authUser.id,
          email: authUser.email,
          username:
            profile?.username || authUser.email?.split("@")[0] || "익명",
          avatar_url: profile?.avatar_url,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    checkUser();

    // 인증 상태 변경 리스너
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email,
            username:
              profile?.username || session.user.email?.split("@")[0] || "익명",
            avatar_url: profile?.avatar_url,
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold">Supabase 실시간 채팅</h1>
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-gray-600">
                    {user.username.charAt(0)}
                  </span>
                )}
              </div>
              <span className="font-medium">{user.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
            >
              로그아웃
            </button>
          </div>
        )}
      </header>

      <main>
        {loading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : user ? (
          <Chat user={user} />
        ) : (
          <Auth setUser={setUser} />
        )}
      </main>
    </div>
  );
}
