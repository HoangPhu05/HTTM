import React from 'react';

const Header = ({ title, subtitle }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-8 px-6 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold">{title}</h1>
      {subtitle && <p className="text-blue-100 mt-2">{subtitle}</p>}
    </div>
  );
};

export default Header;
