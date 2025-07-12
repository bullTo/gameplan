import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  variant?: 'default' | 'account';
}

const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  // Determine styles based on variant
  const bgColor = variant === 'account' ? 'bg-[#072730]' : 'bg-[#15161D]';
  const borderTop = variant === 'account' ? 'border-t border-[#0EADAB]/20' : '';
  
  return (
    <footer className={`${bgColor} ${borderTop} py-[60px]`}>
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        {/* Logo */}
        <div className="flex items-center mb-6 md:mb-0">
          <img
            src="/home/basic-logo.png"
            alt="GamePlan AI Logo"
            className="h-[57.58px]"
          />
        </div>

        {/* Middle Menu */}
        <div className="flex flex-row justify-center items-center gap-[30px] my-6 md:my-0">
          <Link to={variant === 'account' ? "/account/dashboard" : "#"} className="text-white hover:text-[#0EADAB] transition-colors font-poppins tracking-wider text-base">
            Dashboard
          </Link>
          <Link to={variant === 'account' ? "/account/predictions" : "#"} className="text-white hover:text-[#0EADAB] transition-colors font-poppins tracking-wider text-base">
            Predictions
          </Link>
          <Link to={variant === 'account' ? "/account/tracker" : "#"} className="text-white hover:text-[#0EADAB] transition-colors font-poppins tracking-wider text-base">
            Tracking
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="flex flex-row items-center gap-[24px] mt-6 md:mt-0">
          <a href="" className="text-white hover:text-[#0EADAB] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 16.84 5.44 20.87 10 21.8V15H8V12H10V9.5C10 7.57 11.57 6 13.5 6H16V9H14C13.45 9 13 9.45 13 10V12H16V15H13V21.95C18.05 21.45 22 17.19 22 12Z" fill="currentColor"/>
            </svg>
          </a>
          <a href="http://Instagram.com/gameplanai" className="text-white hover:text-[#0EADAB] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.42 16.42C15.39 17.45 14.04 18 12.67 18C11.3 18 9.95 17.45 8.92 16.42C7.89 15.39 7.34 14.04 7.34 12.67C7.34 11.3 7.89 9.95 8.92 8.92C9.95 7.89 11.3 7.34 12.67 7.34C14.04 7.34 15.39 7.89 16.42 8.92C17.45 9.95 18 11.3 18 12.67C18 14.04 17.45 15.39 16.42 16.42Z" fill="currentColor"/>
              <path d="M12.67 9.34C11.1 9.34 9.84 10.6 9.84 12.17C9.84 13.74 11.1 15 12.67 15C14.24 15 15.5 13.74 15.5 12.17C15.5 10.6 14.24 9.34 12.67 9.34Z" fill="currentColor"/>
            </svg>
          </a>
          <a href="http://X.com/GamePlanAi" className="text-white hover:text-[#0EADAB] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28 9.09 5.11 7.38 3 4.79C2.63 5.42 2.42 6.16 2.42 6.94C2.42 8.43 3.17 9.75 4.33 10.5C3.62 10.5 2.96 10.3 2.38 10V10.03C2.38 12.11 3.86 13.85 5.82 14.24C5.46 14.34 5.08 14.39 4.69 14.39C4.42 14.39 4.15 14.36 3.89 14.31C4.43 16 6 17.26 7.89 17.29C6.43 18.45 4.58 19.13 2.56 19.13C2.22 19.13 1.88 19.11 1.54 19.07C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79C20.33 8.6 20.33 8.42 20.32 8.23C21.16 7.63 21.88 6.87 22.46 6Z" fill="currentColor"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
