import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/types";
import { AuthError } from "@supabase/supabase-js";

interface AuthProps {
  setUser: (user: User) => void;
}

export default function Auth({ setUser }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // 회원가입
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        });

        if (error) throw error;

        if (data?.user) {
          // 프로필 생성
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: data.user.id,
                username: username || email.split("@")[0],
                avatar_url: "",
              },
            ]);

          if (profileError) throw profileError;

          // User 객체 생성
          const newUser: User = {
            id: data.user.id,
            email: data.user.email,
            username: username || email.split("@")[0],
            avatar_url: "",
          };

          setUser(newUser);
        }
      } else {
        // 로그인
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data?.user) {
          // 프로필 가져오기
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", data.user.id)
            .single();

          // User 객체 생성
          const loggedInUser: User = {
            id: data.user.id,
            email: data.user.email,
            username: profile?.username || email.split("@")[0],
            avatar_url: profile?.avatar_url,
          };

          setUser(loggedInUser);
        }
      }
    } catch (error: unknown) {
      const err = error as AuthError;
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isSignUp ? "회원가입" : "로그인"}
      </h2>
      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              사용자 이름
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {loading ? "처리 중..." : isSignUp ? "가입하기" : "로그인"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          {isSignUp
            ? "이미 계정이 있으신가요? 로그인"
            : "계정이 없으신가요? 가입하기"}
        </button>
      </div>
    </div>
  );
}
