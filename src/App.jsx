import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Layout from './components/Layout/Layout';
import BoardPage from './pages/Board/Board';
import Calendar from './pages/Calendar/Calendar';
import Dashboard from './pages/Dashboard/Dashboard';
import DataGrid from './pages/DataGrid/DataGrid';
import Login from './Login/Login';
import Users from './pages/Users/Users';
import Account from './pages/Account/Account';
import { useEffect } from 'react';

const App = () => {
  return <div id="dashboard">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path="dashboard" element={<Dashboard/>}/>
          <Route path="calendar" element={<Calendar/>}/>
          <Route path="board" element={<BoardPage/>}/>
          <Route path="users" element={<Users/>}/>
          <Route path="login" element={<Login/>}/>
          <Route path="account" element={<Account/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </div>
};

export default App;