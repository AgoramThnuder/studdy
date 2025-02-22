import { useState, useEffect } from 'react';
import { userData } from '../../data';

function Users() {
  const [users, setUsers] = useState(userData);

  // Temporary mock user data
  useEffect(() => {
    const mockUserData = {
      id: "1",
      name: "Current User",
      email: "user@example.com",
      phone: "123-456-7890",
      age: "25",
      access: "admin"
    };

    setUsers([mockUserData]);
  }, []);

  return (
    <div className="users-container">
      {/* Your existing Users component JSX */}
    </div>
  );
}

export default Users; 