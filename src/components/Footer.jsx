import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-50 border-t">
            <div className="container mx-auto px-4 py-8 text-center text-gray-500">
                <p>&copy; {new Date().getFullYear()} Talaria. All Rights Reserved.</p>
                {/* 여기에 회사 정보나 다른 링크들을 추가할 수 있습니다. */}
            </div>
        </footer>
    );
};

export default Footer;
