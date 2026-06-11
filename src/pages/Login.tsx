import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { ShieldCheck, Heart, Zap } from 'lucide-react';

export const Login: React.FC = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl rotate-3 transform hover:rotate-0 transition-transform duration-300">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Proof</h1>
          <p className="text-gray-500 text-lg">Your personal ledger of value and contribution.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-8">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <p className="text-sm text-gray-600 text-left">Document the small ways you make the world better.</p>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-sm text-gray-600 text-left">Get reminded of your consistency and growth.</p>
          </div>
        </div>

        <div className="pt-10">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-100 transition-all shadow-sm active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};
