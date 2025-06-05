// React is automatically imported in the JSX transform

const Profile = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4" style={{ color: '#0EADAB' }}>Profile</h1>
      <div style={{ backgroundColor: '#1B1C25', padding: '1.5rem', borderRadius: '0.5rem' }}>
        <p>Manage your profile settings here.</p>
        <p className="mt-4">Update your personal information, subscription details, and preferences.</p>
      </div>
    </div>
  )
}

export default Profile
