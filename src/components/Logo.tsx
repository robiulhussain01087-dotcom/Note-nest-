import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { NOTENEST_OFFICIAL_LOGO } from '../utils/assetService';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const { websiteSettings } = useSettings();
  const [imgError, setImgError] = useState(false);

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  // Always prefer local static official asset or saved logoUrl
  const logoSrc = imgError
    ? NOTENEST_OFFICIAL_LOGO
    : (websiteSettings.logoUrl || NOTENEST_OFFICIAL_LOGO);

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <img
        src={logoSrc}
        alt={websiteSettings.siteName || 'NoteNest Logo'}
        className={`${iconSizes[size]} object-contain rounded-full shadow-xs`}
        onError={() => setImgError(true)}
      />

      <div className="flex flex-col">
        <div className="flex items-center leading-none">
          <span className={`font-extrabold tracking-tight text-blue-950 ${textSizes[size]}`}>
            Note
          </span>
          <span className={`font-extrabold tracking-tight text-emerald-600 ${textSizes[size]}`}>
            Nest
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
            {websiteSettings.tagline || 'Learn • Prepare • Succeed'}
          </span>
        )}
      </div>
    </div>
  );
};
