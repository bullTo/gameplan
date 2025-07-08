import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No token provided.');
      return;
    }
    fetch(`/.netlify/functions/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.message === 'Email verified') {
          setStatus('success');
          setTimeout(() => navigate('/'), 2000); // Redirect after 2 seconds
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed.');
      });
  }, [searchParams, navigate]);

  if (status === 'verifying') return <div>Verifying...</div>;
  if (status === 'success') return <div>Email verified! Redirecting...</div>;
  return <div>{message}</div>;
};

export default VerifyEmailPage; 