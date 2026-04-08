import React from 'react';

const API_URL = "https://skilledlink-f4lp.onrender.com";

const ProfileAvatar = ({ src, name, size = "50px", customStyle = {} }) => {
  // 1. Check karte hain ki photo ka link kaisa hai
  const isFullUrl = src && String(src).startsWith('http');
  
  // 2. Final URL banate hain
  const finalSrc = src 
    ? (isFullUrl ? src : `${API_URL}/${src.replace(/^\/+/, '')}`) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;

  return (
    <img 
      src={finalSrc} 
      alt={name || "Profile"} 
      style={{ 
        width: size, 
        height: size, 
        borderRadius: "50%", 
        objectFit: "cover", 
        flexShrink: 0,
        ...customStyle // Extra styling ke liye
      }}
      onError={(e) => { 
        // 3. Agar Render ne photo delete kar di, toh yeh default naam ka avatar dikhayega
        e.target.onerror = null; 
        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`; 
      }}
    />
  );
};

export default ProfileAvatar;