import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/base';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username:email, password }),
      });
      const data = await response.json();
      if (data.token) {
        toast.success('Sign in successful');
        navigate(`/arena?token=${data.token}&spaceId=cm4kpiix6000ncwgugbdpw23m`);
      }
    } catch (error) {
        toast.error('Sign in failed:');
      console.error('Sign in failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-96 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className='font-bold'>Not A User <span className='underline text-blue-500 cursor-pointer' onClick={()=>navigate("/signup")}>Sign Up</span> </div>
        
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default SignIn;
