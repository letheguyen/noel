import Cookies from 'js-cookie';

export const logout = () => {
  // Xóa tất cả cookies
  Cookies.remove('token');
  Cookies.remove('member');
  
  // Xóa tất cả localStorage
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
  
  // Chuyển về trang login
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

