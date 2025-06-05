import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Accordion component for the account sections
const Accordion = ({
  title,
  children,
  isOpen,
  toggleAccordion
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  toggleAccordion: () => void;
}) => {
  return (
    <div className="mb-4 border border-[#0EADAB]/20 rounded-lg overflow-hidden">
      <div
        className="flex justify-between items-center p-4 bg-[#1B1C25] cursor-pointer"
        onClick={toggleAccordion}
      >
        <h3 className="text-white text-lg font-medium">{title}</h3>
        <div className="text-[#0EADAB]">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 bg-[#1B1C25]/80 border-t border-[#0EADAB]/20">
          {children}
        </div>
      )}
    </div>
  );
};

const Account = () => {
  // State to track which accordion is open
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Toggle function for accordions
  const toggleAccordion = (accordionId: string) => {
    setOpenAccordion(openAccordion === accordionId ? null : accordionId);
  };

  return (
    <div className="min-h-screen bg-[#072730] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <h1 className="text-white text-3xl font-bold mb-8">My Account</h1>

        {/* Personal Information Section */}
        <Accordion
          title="Your Personal Information"
          isOpen={openAccordion === 'personal'}
          toggleAccordion={() => toggleAccordion('personal')}
        >
          <div className="text-white space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Full Name</label>
              <input
                type="text"
                className="w-full bg-[#1B1C25] border border-[#0EADAB]/30 rounded-md p-2 text-white"
                placeholder="John Doe"
                readOnly
              />
            </div>

            {/* Preferred Sport */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Preferred Sport</label>
              <select
                className="w-full bg-[#1B1C25] border border-[#0EADAB]/30 rounded-md p-2 text-white"
                defaultValue=""
              >
                <option value="" disabled>Select Sport</option>
                <option value="NBA">NBA</option>
                <option value="NFL">NFL</option>
                <option value="NHL">NHL</option>
                <option value="MLB">MLB</option>
                <option value="CFL">CFL</option>
                <option value="MLS">MLS</option>
              </select>
            </div>

            {/* Preferred Team */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Preferred Team</label>
              <input
                type="text"
                className="w-full bg-[#1B1C25] border border-[#0EADAB]/30 rounded-md p-2 text-white"
                placeholder="Enter your favorite team"
              />
            </div>

            {/* Betting Style */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Betting Style</label>
              <select
                className="w-full bg-[#1B1C25] border border-[#0EADAB]/30 rounded-md p-2 text-white"
                defaultValue=""
              >
                <option value="" disabled>Select Betting Style</option>
                <option value="Conservative">Conservative</option>
                <option value="Balanced">Balanced</option>
                <option value="Aggressive">Aggressive</option>
              </select>
            </div>

            {/* Risk Tolerance */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Risk Tolerance</label>
              <select
                className="w-full bg-[#1B1C25] border border-[#0EADAB]/30 rounded-md p-2 text-white"
                defaultValue=""
              >
                <option value="" disabled>Select Risk Tolerance</option>
                <option value="Low">Low (Safe Bets)</option>
                <option value="Medium">Medium (Moderate Risk)</option>
                <option value="High">High (Hail Mary)</option>
              </select>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                className="bg-[#0EADAB] text-[#1B1C25] px-6 py-2 rounded-md font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Accordion>

        {/* Subscription Section - Link to dedicated page */}
        <div className="mb-4 border border-[#0EADAB]/20 rounded-lg overflow-hidden">
          <div className="p-4 bg-[#1B1C25]">
            <div className="flex justify-between items-center">
              <h3 className="text-white text-lg font-medium">Your Subscription</h3>
              <a
                href="/account/subscription"
                className="bg-[#0EADAB] text-[#1B1C25] px-4 py-2 rounded-md text-sm font-medium"
              >
                Manage Subscription
              </a>
            </div>
            <p className="text-gray-300 mt-2">
              View and manage your subscription plan, billing history, and payment methods.
            </p>
          </div>
        </div>

        {/* Change Password Section */}
        <Accordion
          title="Change Password"
          isOpen={openAccordion === 'password'}
          toggleAccordion={() => toggleAccordion('password')}
        >
          <div className="text-white space-y-6">
            <div className="bg-[#1B1C25] border border-[#0EADAB]/30 rounded-lg p-6">
              <p className="text-gray-300 text-sm mb-4">
                Update your password to keep your account secure.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    className="w-full bg-[#072730] border border-[#0EADAB]/30 rounded-md p-3 text-white"
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full bg-[#072730] border border-[#0EADAB]/30 rounded-md p-3 text-white"
                    placeholder="Enter your new password"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Password must be at least 8 characters and include a number and a special character.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full bg-[#072730] border border-[#0EADAB]/30 rounded-md p-3 text-white"
                    placeholder="Confirm your new password"
                  />
                </div>

                <div className="pt-2">
                  <button
                    className="bg-[#0EADAB] text-[#1B1C25] px-6 py-2 rounded-md font-medium"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Accordion>

        {/* Referral Code Section */}
        <Accordion
          title="Your Referral Code"
          isOpen={openAccordion === 'referral'}
          toggleAccordion={() => toggleAccordion('referral')}
        >
          <div className="text-white space-y-6">
            <div className="bg-[#1B1C25] border border-[#0EADAB]/30 rounded-lg p-6">
              <h4 className="text-lg font-medium mb-3">Your Referral Code</h4>

              <div className="mb-4">
                <p className="text-gray-300 mb-4">
                  Share this code and get 5% off your subscription whenever someone signs up using your code.
                </p>

                <div className="flex">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value="GAMEPLAN-R4F9Z2"
                      readOnly
                      className="w-full bg-[#072730] border border-[#0EADAB]/30 rounded-l-md p-3 text-white font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("GAMEPLAN-R4F9Z2");
                        alert("Referral code copied to clipboard!");
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0EADAB] hover:text-[#0EADAB]/80"
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                  <button
                    className="bg-[#0EADAB] text-[#1B1C25] px-4 py-3 rounded-r-md font-medium"
                    onClick={() => {
                      navigator.clipboard.writeText("GAMEPLAN-R4F9Z2");
                      alert("Referral code copied to clipboard!");
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <h5 className="text-md font-medium mb-2">Share Your Code</h5>
                <div className="flex space-x-3">
                  <button className="bg-[#1877F2] text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                    </svg>
                  </button>
                  <button className="bg-[#1DA1F2] text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </button>
                  <button className="bg-[#0A66C2] text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                    </svg>
                  </button>
                  <button className="bg-[#25D366] text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </button>
                  <button className="bg-[#EA4335] text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 11v2.4h3.97c-.16 1.029-1.2 3.02-3.97 3.02-2.39 0-4.34-1.979-4.34-4.42 0-2.44 1.95-4.42 4.34-4.42 1.36 0 2.27.58 2.79 1.08l1.9-1.83c-1.22-1.14-2.8-1.83-4.69-1.83-3.87 0-7 3.13-7 7s3.13 7 7 7c4.04 0 6.721-2.84 6.721-6.84 0-.46-.051-.81-.111-1.16h-6.61zm0 0 17 2h-3v3h-2v-3h-3v-2h3v-3h2v3h3v2z" fillRule="evenodd" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#1B1C25] border border-[#0EADAB]/30 rounded-lg p-6">
              <h4 className="text-lg font-medium mb-3">Referral Stats</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#072730] p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">Total Referrals</p>
                  <p className="text-2xl font-bold text-white">3</p>
                </div>
                <div className="bg-[#072730] p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">Pending Rewards</p>
                  <p className="text-2xl font-bold text-white">$14.85</p>
                </div>
                <div className="bg-[#072730] p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">Total Earned</p>
                  <p className="text-2xl font-bold text-white">$29.70</p>
                </div>
              </div>

              <h5 className="text-md font-medium mb-2">Recent Referrals</h5>
              <div className="bg-[#072730] rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-[#0EADAB]/20">
                  <thead className="bg-[#072730]">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Plan
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Reward
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#072730] divide-y divide-[#0EADAB]/20">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        May 10, 2024
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        j****@gmail.com
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        Pro Plan
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0EADAB] text-right">
                        $4.95
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        April 22, 2024
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        m****@outlook.com
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        Pro Plan
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0EADAB] text-right">
                        $4.95
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        March 15, 2024
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        t****@yahoo.com
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        Pro Plan
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0EADAB] text-right">
                        $4.95
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Accordion>

        {/* Account Deactivation Section */}
        <Accordion
          title="Deactivate Your Account"
          isOpen={openAccordion === 'deactivate'}
          toggleAccordion={() => toggleAccordion('deactivate')}
        >
          <div className="text-white space-y-6">
            <div className="bg-[#1B1C25] border border-[#0EADAB]/30 rounded-lg p-6">
              <h4 className="text-lg font-medium text-red-500 mb-2">Deactivate Account</h4>
              <p className="text-gray-300 text-sm mb-4">
                Deactivating your account will cancel your subscription and remove your access to GamePlan AI.
                This action cannot be undone.
              </p>

              <div className="bg-red-900/20 border border-red-500/30 rounded-md p-4 mb-4">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-500">Warning</h3>
                    <div className="mt-1 text-sm text-gray-300">
                      <p>
                        This will immediately cancel your subscription and delete your account data.
                        Your saved picks, preferences, and betting history will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#0EADAB] border-gray-300 rounded focus:ring-[#0EADAB]"
                  />
                  <span className="ml-2 text-sm text-gray-300">
                    I understand that deactivating my account is permanent and cannot be undone.
                  </span>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Please type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  className="w-full bg-[#072730] border border-red-500/30 rounded-md p-3 text-white"
                  placeholder="DELETE"
                />
              </div>

              <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium"
              >
                Deactivate Account
              </button>
            </div>
          </div>
        </Accordion>

        {/* Disclaimer Section */}
        <div className="mt-8 p-6 bg-[#1B1C25] border border-[#0EADAB]/20 rounded-lg">
          <h3 className="text-white text-lg font-medium mb-4">Important Disclaimer</h3>
          <div className="text-gray-300 space-y-4">
            <p>
              GamePlan AI provides predictions and recommendations for informational purposes only.
              These insights are based on AI-generated data and should not be considered guaranteed outcomes.
            </p>
            <p>
              All betting activities involve inherent financial risks. Users are solely responsible for their
              decisions and any financial losses incurred. GamePlan AI does not assume liability for losses
              resulting from user actions based on our predictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
