// React is automatically imported in the JSX transform

const Referral = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4" style={{ color: '#0EADAB' }}>Referral Program</h1>
      <div style={{ backgroundColor: '#1B1C25', padding: '1.5rem', borderRadius: '0.5rem' }}>
        <p>Invite friends and earn rewards!</p>
        <p className="mt-4">Share your referral link with friends and get bonus credits when they sign up.</p>
      </div>
    </div>
  )
}

export default Referral
