import React from 'react';

interface UserNameIconProps {
  name: string; // Type for the prop
}

const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500']; // 3 colors

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Pick a color based on user name
const getColor = (name: string) => {
  let charSum = 0;
  for (let i = 0; i < name.length; i++) {
    charSum += name.charCodeAt(i);
  }
  return colors[charSum % colors.length];
};

const UserNameIcon: React.FC<UserNameIconProps> = ({ name }) => {
  const initials = getInitials(name);
  const colorClass = getColor(name);

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${colorClass}`}
    >
      {initials}
    </div>
  );
};

export default UserNameIcon;
