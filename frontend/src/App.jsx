import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import UserList from './pages/UserList';
import UserForm from './pages/UserForm';
import UserDetails from './pages/UserDetails';
import Notification from './components/Notification';

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/add" element={<UserForm />} />
          <Route path="/users/edit/:id" element={<UserForm />} />
          <Route path="/users/view/:id" element={<UserDetails />} />
        </Routes>
      </Layout>
      <Notification />
    </>
  );
}

export default App;
