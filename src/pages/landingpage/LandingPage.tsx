import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
// Make sure we're not importing any authentication-related functions

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('LandingPage component mounted');
    // This will help us see if the component is being rendered at all
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/login?tab=register');
  };

  return (
    <div className="min-h-screen bg-[#1B1C25] text-white">
      {/* Header */}
      <header className="border-b border-[#0EADAB]/20 sticky top-0 z-50 bg-[#1B1C25] h-[80px] flex items-center">
        <div className="container mx-auto px-[50px] flex justify-between items-center">
          {/* Logo Left */}
          <div className="flex items-center">
            <img
              src="/gameplan-ai-logo.png"
              alt="GamePlan AI Logo"
              className="h-[50px]"
            />
          </div>

          {/* Button Right */}
          <div className='hidden sm:flex'>
            <Button
              className="bg-[#0EADAB] hover:bg-[#0EADAB]/90 text-white font-poppins tracking-wider px-8 py-3 rounded-md w-[263px] h-[50px]"
              onClick={handleLoginClick}
            >
              Build Your GamePlan
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-[#15161D] to-[#1B1C25] min-h-[1000px] flex items-center">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-[56px] font-semibold mb-6 font-poppins leading-[120%] tracking-[-1.2px] text-center text-white capitalize max-w-[1208px] mx-auto">
            Dominate Game Day with <span className="text-[#0EADAB]">AI-Powered</span> Plays
          </h1>
          <p className="text-white font-poppins font-normal text-xl leading-[160%] tracking-wider text-center mb-20 max-w-[1060px] mx-auto">
            Customized recommendations. Smart tracking. Real-time data. All built to help you play smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              className="bg-[#0EADAB] hover:bg-[#0EADAB]/90 text-white px-8 py-6 text-lg font-poppins tracking-wider rounded-md"
              onClick={handleSignupClick}
            >
              Build Your GamePlan
            </Button>
            <Button
              variant="outline"
              className="border-[#0EADAB] text-[#0EADAB] hover:bg-[#0EADAB]/10 px-8 py-6 text-lg font-poppins tracking-wider rounded-md"
              onClick={handleLoginClick}
            >
              View Predictions
            </Button>
          </div>
          <div className="flex justify-center">
            <img
              src="/home/hero-main.png"
              alt="GamePlan AI Dashboard Preview"
              className="w-full max-w-[752px] h-auto"
              width={752}
              height={489}
            />
          </div>
        </div>
      </section>

      {/* Teams Coverage Section */}
      <section className="py-[90px] px-[60px] flex flex-col justify-center items-center gap-[80px] bg-[#1B1C25] min-h-[599.75px]">
        <div className="flex flex-col items-center gap-[20px] w-full max-w-[1320px]">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-white font-poppins">
            Covering all <span className="text-[#0EADAB]">NBA</span>, <span className="text-[#0EADAB]">MLB</span> and <span className="text-[#0EADAB]">NHL</span> Teams
          </h2>
          <p className="text-xl text-center text-gray-300 font-poppins">
            Your go-to source for data on every pro play and player.
          </p>
        </div>

        {/* Team Badges */}
        <div className="flex flex-wrap justify-center gap-6 w-full max-w-[1320px]">
          {/* Row 1 */}
          <div className="flex flex-wrap justify-center gap-6">

            <img
              src="/home/badges/69e526ae5ff4ed618ce84ac00e057d37e4adab6b.png"
              alt="Team Badge"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
            />
            <img
              src="/home/badges/409d415b5e2d680adaddaaa77dab34010f9499da.png"
              alt="Team Badge"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
            />
            <img
              src="/home/badges/a315f943e97a7216958f671104ac828c341589a0.png"
              alt="Team Badge"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
            />
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap justify-center gap-6">
            <img
              src="/home/badges/image 3.png"
              alt="Team Badge"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
            />
            <img
              src="/home/badges/ec10e9ad3cb60db9df9ecd4560363ddcf6b108ef.png"
              alt="Team Badge"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
            />
            <img
              src="/home/badges/image 10.png"
              alt="Team Badge"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
            />
            <img
              src="/home/badges/NBA Teams.png"
              alt="NBA Teams"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
            />
          </div>

          {/* View All Teams Button */}
          <div className="mt-8 w-full flex justify-center">
            <Button
              variant="outline"
              className="border-[#0EADAB] text-[#0EADAB] hover:bg-[#0EADAB]/10 px-8 py-3 font-poppins tracking-wider rounded-md"
              onClick={handleLoginClick}
            >
              View All Teams
            </Button>
          </div>
        </div>
      </section>

      {/* Predictions Section */}
      <section className="py-20 bg-[#1B1C25] flex flex-col items-center gap-[53px]">
        <div className="flex flex-col items-center gap-[20px] w-full max-w-[1303px] px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-white font-poppins">
            Get highly accurate Predictions
          </h2>
          <p className="text-xl text-center text-gray-300 font-poppins max-w-[800px] mx-auto">
            Smart insights tailored to your preferences—powered by real-time data and AI.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center p-[50px] gap-[51px] w-full max-w-[1303px] bg-[#15161D] rounded-[20px]">
          {/* Left side - Image (75% width) */}
          <div className="w-full md:w-[75%]">
            <img
              src="/home/predictions-screenshot.png"
              alt="GamePlan AI Predictions Dashboard"
              className="w-full h-auto rounded-[10px]"
            />
          </div>

          {/* Right side - Content columns (25% width) */}
          <div className="w-full md:w-[25%] flex flex-col gap-[25px]">
            {/* Safe Bets */}
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.5857 0.42041H2.9044C2.38243 0.42041 1.88182 0.627766 1.51273 0.996861C1.14363 1.36596 0.936279 1.86656 0.936279 2.38854V9.27697C0.936279 15.7619 4.07544 19.692 6.70904 21.8471C9.5456 24.1671 12.3674 24.9543 12.4904 24.9875C12.6595 25.0335 12.8379 25.0335 13.007 24.9875C13.13 24.9543 15.9482 24.1671 18.7884 21.8471C21.4146 19.692 24.5538 15.7619 24.5538 9.27697V2.38854C24.5538 1.86656 24.3464 1.36596 23.9773 0.996861C23.6082 0.627766 23.1076 0.42041 22.5857 0.42041ZM22.5857 9.27697C22.5857 13.8369 20.9054 17.5382 17.5915 20.2763C16.149 21.4642 14.5084 22.3886 12.745 23.0071C11.0047 22.3994 9.38439 21.4914 7.95757 20.3243C4.60437 17.5812 2.9044 13.8652 2.9044 9.27697V2.38854H22.5857V9.27697ZM7.12849 12.9254C6.94384 12.7407 6.84011 12.4903 6.84011 12.2292C6.84011 11.968 6.94384 11.7176 7.12849 11.5329C7.31314 11.3483 7.56358 11.2446 7.82472 11.2446C8.08585 11.2446 8.33629 11.3483 8.52094 11.5329L10.7769 13.7901L16.9691 7.59669C17.0605 7.50526 17.1691 7.43273 17.2885 7.38325C17.408 7.33377 17.536 7.3083 17.6653 7.3083C17.7946 7.3083 17.9227 7.33377 18.0421 7.38325C18.1616 7.43273 18.2701 7.50526 18.3616 7.59669C18.453 7.68812 18.5255 7.79666 18.575 7.91612C18.6245 8.03557 18.65 8.16361 18.65 8.29291C18.65 8.42221 18.6245 8.55025 18.575 8.6697C18.5255 8.78916 18.453 8.89771 18.3616 8.98913L11.4731 15.8776C11.3817 15.9691 11.2732 16.0417 11.1537 16.0912C11.0343 16.1407 10.9062 16.1662 10.7769 16.1662C10.6476 16.1662 10.5195 16.1407 10.4001 16.0912C10.2806 16.0417 10.1721 15.9691 10.0807 15.8776L7.12849 12.9254Z" fill="#0EADAB"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-poppins font-semibold text-lg">Safe Bets</h3>
                <p className="text-gray-400 font-poppins">Low risk, steady reward</p>
              </div>
            </div>

            {/* Hail Marys */}
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M27.5353 6.29612C27.5061 5.81629 27.3024 5.36374 26.9624 5.02382C26.6225 4.68391 26.17 4.48016 25.6902 4.451C24.1427 4.35874 20.188 4.5002 16.9062 7.78082L16.3219 8.37249H9.14683C8.88738 8.37103 8.63023 8.42117 8.39034 8.52C8.15044 8.61883 7.93259 8.76437 7.74946 8.94816L3.53029 13.1698C3.27154 13.4284 3.08998 13.7539 3.00597 14.11C2.92196 14.466 2.93884 14.8384 3.05471 15.1853C3.17058 15.5323 3.38085 15.8401 3.66193 16.0742C3.94301 16.3083 4.28377 16.4595 4.64597 16.5107L9.37808 17.1712L14.8163 22.6094L15.4768 27.344C15.5276 27.7062 15.6787 28.047 15.913 28.3278C16.1474 28.6087 16.4556 28.8184 16.8028 28.9332C17.0051 29.0008 17.2169 29.0353 17.4302 29.0353C17.6884 29.0358 17.9441 28.9852 18.1827 28.8864C18.4213 28.7876 18.6379 28.6426 18.8202 28.4597L23.0418 24.2405C23.2256 24.0574 23.3711 23.8395 23.47 23.5996C23.5688 23.3597 23.6189 23.1026 23.6175 22.8431V15.6681L24.2042 15.0813C27.4861 11.7995 27.6275 7.84478 27.5353 6.29612ZM9.14683 10.3406H14.3538L9.49125 15.2019L4.92028 14.5647L9.14683 10.3406ZM18.2998 9.17819C19.2454 8.22677 20.3832 7.48807 21.637 7.01143C22.8909 6.53479 24.232 6.33118 25.5708 6.4142C25.6571 7.75373 25.4556 9.0962 24.9799 10.3514C24.5042 11.6066 23.7654 12.7454 22.813 13.6913L15.745 20.7569L11.233 16.245L18.2998 9.17819ZM21.6493 22.8431L17.4265 27.0697L16.7881 22.4975L21.6493 17.6362V22.8431ZM12.5271 24.0117C11.9735 25.2246 10.1223 28.0537 4.92028 28.0537C4.65929 28.0537 4.40899 27.9501 4.22444 27.7655C4.0399 27.581 3.93622 27.3307 3.93622 27.0697C3.93622 21.8677 6.7654 20.0164 7.97826 19.4616C8.09585 19.408 8.22287 19.3781 8.35204 19.3735C8.4812 19.369 8.61 19.3899 8.73108 19.4352C8.85216 19.4804 8.96314 19.549 9.05769 19.6371C9.15224 19.7253 9.22851 19.8312 9.28214 19.9488C9.33577 20.0664 9.36571 20.1934 9.37026 20.3225C9.3748 20.4517 9.35386 20.5805 9.30863 20.7016C9.26339 20.8227 9.19476 20.9336 9.10663 21.0282C9.01851 21.1227 8.91263 21.199 8.79503 21.2526C8.00409 21.6131 6.25861 22.773 5.95109 26.0389C9.21694 25.7314 10.3794 23.9859 10.7373 23.1949C10.791 23.0773 10.8672 22.9714 10.9618 22.8833C11.0563 22.7952 11.1673 22.7266 11.2884 22.6813C11.4095 22.6361 11.5383 22.6152 11.6674 22.6197C11.7966 22.6242 11.9236 22.6542 12.0412 22.7078C12.1588 22.7614 12.2647 22.8377 12.3528 22.9323C12.4409 23.0268 12.5096 23.1378 12.5548 23.2589C12.6 23.38 12.621 23.5088 12.6164 23.6379C12.6119 23.7671 12.5819 23.8941 12.5283 24.0117H12.5271Z" fill="#0EADAB"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-poppins font-semibold text-lg">Hail Marys</h3>
                <p className="text-gray-400 font-poppins">High risk, high reward</p>
              </div>
            </div>

            {/* Parleys */}
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <svg width="27" height="23" viewBox="0 0 27 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M26.5378 21.0857C26.5378 21.3467 26.4341 21.597 26.2495 21.7816C26.065 21.9661 25.8147 22.0698 25.5537 22.0698H1.93621C1.67522 22.0698 1.42492 21.9661 1.24037 21.7816C1.05583 21.597 0.952148 21.3467 0.952148 21.0857V1.40447C0.952148 1.14348 1.05583 0.893183 1.24037 0.708636C1.42492 0.524088 1.67522 0.42041 1.93621 0.42041C2.1972 0.42041 2.4475 0.524088 2.63205 0.708636C2.8166 0.893183 2.92027 1.14348 2.92027 1.40447V14.7742L9.11249 8.58075C9.20388 8.48925 9.31241 8.41667 9.43187 8.36715C9.55134 8.31763 9.67939 8.29214 9.80871 8.29214C9.93803 8.29214 10.0661 8.31763 10.1855 8.36715C10.305 8.41667 10.4135 8.48925 10.5049 8.58075L13.745 11.822L20.2262 5.34072H17.6812C17.4202 5.34072 17.1699 5.23704 16.9854 5.0525C16.8008 4.86795 16.6971 4.61765 16.6971 4.35666C16.6971 4.09567 16.8008 3.84537 16.9854 3.66082C17.1699 3.47628 17.4202 3.3726 17.6812 3.3726H22.6015C22.8625 3.3726 23.1128 3.47628 23.2974 3.66082C23.4819 3.84537 23.5856 4.09567 23.5856 4.35666V9.27697C23.5856 9.53796 23.4819 9.78826 23.2974 9.97281C23.1128 10.1574 22.8625 10.261 22.6015 10.261C22.3405 10.261 22.0902 10.1574 21.9057 9.97281C21.7211 9.78826 21.6175 9.53796 21.6175 9.27697V6.73194L14.4412 13.9094C14.3498 14.0009 14.2413 14.0735 14.1218 14.123C14.0023 14.1726 13.8743 14.1981 13.745 14.1981C13.6156 14.1981 13.4876 14.1726 13.3681 14.123C13.2487 14.0735 13.1401 14.0009 13.0487 13.9094L9.80871 10.6682L2.92027 17.5566V20.1017H25.5537C25.8147 20.1017 26.065 20.2053 26.2495 20.3899C26.4341 20.5744 26.5378 20.8247 26.5378 21.0857Z" fill="#0EADAB"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-poppins font-semibold text-lg">Parleys</h3>
                <p className="text-gray-400 font-poppins">One bet, multiple wins</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Track Your Plays Section */}
      <section className="py-20 bg-[#1B1C25] flex flex-col items-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-white font-poppins mb-6">
            Track your plays
          </h2>
          <p className="text-xl text-center text-gray-300 font-poppins max-w-[800px] mx-auto mb-12">
            Monitor your performance, analyze your history, and improve your strategy with our tracking tools.
          </p>

          <div className="flex flex-col md:flex-row gap-8 w-full max-w-[1303px] mx-auto">
            {/* Left column - 30% width with stat cards */}
            <div className="w-full md:w-[30%] bg-[#15161D] rounded-[14px] p-6">
              <h3 className="text-white text-xl font-poppins mb-6">Your Stats</h3>

              <div className="flex flex-col gap-6">
                {/* Tracked Plays */}
                <div className="bg-[#1B1C25] rounded-[5px] p-4 border border-[#0EADAB]/20 flex flex-col items-center">
                  <span className="text-white text-4xl font-poppins">17</span>
                  <span className="text-white text-sm font-poppins">Tracked Plays</span>
                </div>

                {/* Live Plays */}
                <div className="bg-[#1B1C25] rounded-[5px] p-4 border border-[#0EADAB]/20 flex flex-col items-center">
                  <span className="text-white text-4xl font-poppins">3</span>
                  <span className="text-white text-sm font-poppins">Live Plays</span>
                </div>

                {/* Closed Plays */}
                <div className="bg-[#1B1C25] rounded-[5px] p-4 border border-[#0EADAB]/20 flex flex-col items-center">
                  <span className="text-white text-4xl font-poppins">14</span>
                  <span className="text-white text-sm font-poppins">Closed Plays</span>
                </div>

                {/* Win Ratio */}
                <div className="bg-[#1B1C25] rounded-[5px] p-4 border border-[#0EADAB]/20 flex flex-col items-center">
                  <span className="text-white text-4xl font-poppins">45%</span>
                  <span className="text-white text-sm font-poppins">Win Ratio</span>
                </div>

                {/* ROI */}
                <div className="bg-[#1B1C25] rounded-[5px] p-4 border border-[#0EADAB]/20 flex flex-col items-center">
                  <span className="text-white text-4xl font-poppins">10%</span>
                  <span className="text-white text-sm font-poppins">ROI</span>
                </div>

                {/* Preferred Style */}
                <div className="bg-[#1B1C25] rounded-[5px] p-4 border border-[#0EADAB]/20 flex flex-col items-center">
                  <span className="text-white text-4xl font-poppins">Safe Play</span>
                  <span className="text-white text-sm font-poppins">Preferred Style</span>
                </div>
              </div>
            </div>

            {/* Right column - 70% width with tracker visualization */}
            <div className="w-full md:w-[70%]">


              {/* Past Plays */}
              <div className="mt-8">
                <div className="bg-[#15161D] rounded-[14px] p-6 mb-6">
                  <h3 className="text-white text-xl font-poppins mb-4">Past Plays</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Past Play Card 1 */}
                    <div className="bg-[#1B1C25] rounded-[10px] p-4 border border-[#0EADAB]/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-700 rounded-full"></div>
                          <div>
                            <span className="text-white">OKC</span>
                            <span className="text-white/50"> vs MEM</span>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-[#0EADAB]/5 border border-[#0EADAB] rounded-full">
                          <span className="text-[#0EADAB] text-xs">Single</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-white text-xs">Match Date: 2025-04-22</p>
                        <p className="text-white/50 text-xs">Payout: $107 on a $100 bet</p>
                        <p className="text-white/50 text-xs">Oklahoma City Thunder Win</p>
                      </div>

                      <div className="flex justify-between">
                        <div className="flex gap-3">
                          <div className="bg-[#1B1C25] rounded-[5px] p-2 border border-[#0EADAB]/20 flex flex-col items-center">
                            <span className="text-white text-xl">-1400</span>
                            <span className="text-white text-xs">Odds</span>
                          </div>
                          <div className="bg-[#1B1C25] rounded-[5px] p-2 border border-[#0EADAB]/20 flex flex-col items-center">
                            <span className="text-white text-xl">93%</span>
                            <span className="text-white text-xs">Confidence</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="bg-[#389353] rounded px-2 py-1">
                            <span className="text-[#12131C] text-sm">HIT</span>
                          </div>
                          <div className="bg-gray-700/25 rounded px-2 py-1">
                            <span className="text-[#12131C] text-sm">MISS</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Past Play Card 2 */}
                    <div className="bg-[#1B1C25] rounded-[10px] p-4 border border-[#0EADAB]/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-700 rounded-full"></div>
                          <div>
                            <span className="text-white">BOS</span>
                            <span className="text-white/50"> vs ORL</span>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-[#0EADAB]/5 border border-[#0EADAB] rounded-full">
                          <span className="text-[#0EADAB] text-xs">Hail Mary</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-white text-xs">Match Date: 2025-04-23</p>
                        <p className="text-white/50 text-xs">Payout: $191 on a $100 bet</p>
                        <p className="text-white/50 text-xs">Boston Celtics should lose by a difference of -12.5 points</p>
                      </div>

                      <div className="flex justify-between">
                        <div className="flex gap-3">
                          <div className="bg-[#1B1C25] rounded-[5px] p-2 border border-[#0EADAB]/20 flex flex-col items-center">
                            <span className="text-white text-xl">-12.5</span>
                            <span className="text-white text-xs">Spread</span>
                          </div>
                          <div className="bg-[#1B1C25] rounded-[5px] p-2 border border-[#0EADAB]/20 flex flex-col items-center">
                            <span className="text-white text-xl">81%</span>
                            <span className="text-white text-xs">Confidence</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="bg-[#389353] rounded px-2 py-1">
                            <span className="text-[#12131C] text-sm">HIT</span>
                          </div>
                          <div className="bg-gray-700/25 rounded px-2 py-1">
                            <span className="text-[#12131C] text-sm">MISS</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Plays */}
                <div className="bg-[#15161D] rounded-[14px] p-6">
                  <h3 className="text-white text-xl font-poppins mb-4">Live Plays</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Live Play Card 1 */}
                    <div className="bg-[#1B1C25] rounded-[10px] p-4 border border-[#0EADAB]/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-700 rounded-full"></div>
                          <div>
                            <span className="text-white">OKC</span>
                            <span className="text-white/50"> vs MEM</span>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-[#0EADAB]/5 border border-[#0EADAB] rounded-full">
                          <span className="text-[#0EADAB] text-xs">Single</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-white text-xs">Match Date: 2025-04-22</p>
                        <p className="text-white/50 text-xs">Payout: $110 on a $100 bet</p>
                        <p className="text-white/50 text-xs">Oklahoma City Thunder Win</p>
                      </div>

                      <div className="flex justify-between">
                        <div className="flex gap-3">
                          <div className="bg-[#1B1C25] rounded-[5px] p-2 border border-[#0EADAB]/20 flex flex-col items-center">
                            <span className="text-white text-xl">-1000</span>
                            <span className="text-white text-xs">Odds</span>
                          </div>
                          <div className="bg-[#1B1C25] rounded-[5px] p-2 border border-[#0EADAB]/20 flex flex-col items-center">
                            <span className="text-white text-xl">91%</span>
                            <span className="text-white text-xs">Confidence</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="bg-[#272830] rounded px-2 py-1">
                            <span className="text-[#12131C] text-sm">HIT</span>
                          </div>
                          <div className="bg-[#D03E35] rounded px-2 py-1">
                            <span className="text-[#12131C] text-sm">MISS</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Play Card 2 */}
                    <div className="bg-[#1B1C25] rounded-[10px] p-4 border border-[#0EADAB]/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-700 rounded-full"></div>
                          <div>
                            <span className="text-white">CLE</span>
                            <span className="text-white/50"> vs MIA</span>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-[#0EADAB]/5 border border-[#0EADAB] rounded-full">
                          <span className="text-[#0EADAB] text-xs">Hail Mary</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-white text-xs">Match Date: 2025-04-23</p>
                        <p className="text-white/50 text-xs">Payout: $191 on a $100 bet</p>
                        <p className="text-white/50 text-xs">Cleveland Cavaliers should lose by a difference of -12 points</p>
                      </div>

                      <div className="flex justify-between">
                        <div className="flex gap-3">
                          <div className="bg-[#1B1C25] rounded-[5px] p-2 border border-[#0EADAB]/20 flex flex-col items-center">
                            <span className="text-white text-xl">-12</span>
                            <span className="text-white text-xs">Spread</span>
                          </div>
                          <div className="bg-[#1B1C25] rounded-[5px] p-2 border border-[#0EADAB]/20 flex flex-col items-center">
                            <span className="text-white text-xl">80%</span>
                            <span className="text-white text-xs">Confidence</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="bg-[#272830] rounded px-2 py-1">
                            <span className="text-[#12131C] text-sm">HIT</span>
                          </div>
                          <div className="bg-[#D03E35] rounded px-2 py-1">
                            <span className="text-[#12131C] text-sm">MISS</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1B1C25] flex flex-col items-center">
        <div className="flex flex-col items-center p-[50px] gap-[51px] w-full max-w-[1303px] bg-[#15161D] rounded-[20px]">
          <div className="flex flex-col items-center gap-[20px]">
            <div className="flex flex-row justify-center items-center gap-[20px] w-full max-w-[721px]">
              <h2 className="text-4xl md:text-5xl font-semibold text-center text-white font-poppins">
                Get <img src="/home/basic-logo.png" alt="GamePlan AI Logo" className="inline-block h-12 mx-2" /> Today!
              </h2>
            </div>
            <p className="text-white font-poppins font-normal text-xl leading-[160%] tracking-wider text-center max-w-[957px] mx-auto">
              Track ROI, view custom predictions, and discover high-confidence plays tailored to you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-[35px] justify-center">
            <Button
              className="bg-[#0EADAB] hover:bg-[#0EADAB]/90 text-white px-8 py-6 text-lg font-poppins tracking-wider rounded-md w-[263px]"
              onClick={handleSignupClick}
            >
              Build Your GamePlan
            </Button>
            <Button
              variant="outline"
              className="border-[#0EADAB] text-[#0EADAB] hover:bg-[#0EADAB]/10 px-8 py-6 text-lg font-poppins tracking-wider rounded-md w-[217px]"
              onClick={handleLoginClick}
            >
              View Predictions
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="default" />
    </div>
  );
};

export default LandingPage;
