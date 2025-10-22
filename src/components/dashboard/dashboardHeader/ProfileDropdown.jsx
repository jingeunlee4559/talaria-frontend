import { FiBell, FiLogOut, FiShield, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = ({ isOpen, onLogout }) => {
    const navigate = useNavigate();
    if (!isOpen) return null;

    const menuItems = [
        { id: 1, label: '프로필', icon: <FiUser className="w-5 h-5" />, action: () => navigate('/dashboardhome/settings') },
        { id: 2, label: '알림', icon: <FiBell className="w-5 h-5" />, action: () => navigate('/dashboardhome/settings/notifications') },
        { id: 3, label: '보안', icon: <FiShield className="w-5 h-5" />, action: () => navigate('/dashboardhome/settings/security') },
        { id: 4, label: '로그아웃', icon: <FiLogOut className="w-5 h-5" />, action: onLogout, isDanger: true },
    ];

    return (
        <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-fade-in-down">
            <div className="p-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={(e) => {
                            e.preventDefault(); // 기본 링크 동작 방지
                            item.action(); // 지정된 함수 실행
                        }}
                        className={`
                            flex items-center w-full px-4 py-3 text-sm rounded-lg transition-colors duration-200 text-left
                            ${item.isDanger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'}
                        `}
                    >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProfileDropdown;
