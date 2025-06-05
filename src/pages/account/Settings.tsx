// React is automatically imported in the JSX transform

const Settings = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4" style={{ color: '#0EADAB' }}>Settings</h1>
      <div style={{ backgroundColor: '#1B1C25', padding: '1.5rem', borderRadius: '0.5rem' }}>
        <p>Manage your account settings here.</p>
        <p className="mt-4">Configure notifications, security options, and other account preferences.</p>
      </div>
    </div>
  )
}

export default Settings
