// Placeholder file, this should be overridden by the generated code


import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/RecipeGenerator', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-[#6b9b76] rounded-full animate-spin"></div>
    </div>
  );
}