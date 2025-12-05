'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { logout } from '@/lib/auth-utils';
import styles from './LogoutButton.module.css';

export default function LogoutButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kiểm tra xem có token không
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <button onClick={logout} className={styles.logoutButton}>
      🚪 Đăng xuất
    </button>
  );
}

