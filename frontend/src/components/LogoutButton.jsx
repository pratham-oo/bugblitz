// src/components/LogoutButton.jsx
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleLogout}
        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition duration-300"
      >
        🚪 Logout
      </button>

      <div className="text-sm text-purple-600 font-semibold animate-pulse">
        Tailwind works 🔥
      </div>
    </div>
  );
}

export default LogoutButton;
