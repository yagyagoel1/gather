import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/signin';
import SignUp from './components/signup';
import Arena from './components/Arena';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/arena" element={<Arena />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
