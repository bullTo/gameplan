import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { verifyResetToken, resetPassword } from '@/api/auth';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  // userId is set but not currently used in the component
  // const [userId, setUserId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setTokenError('No reset token provided. Please request a new password reset link.');
      return;
    }

    setToken(tokenParam);

    // Verify the token
    const verifyToken = async () => {
      try {
        // We verify the token but don't need to use the userId for now
        await verifyResetToken(tokenParam);
        // setUserId(response.userId);
      } catch (err) {
        setTokenError(err instanceof Error ? err.message : 'Invalid or expired token. Please request a new password reset link.');
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Invalid token. Please request a new password reset link.');
      return;
    }

    if (!password) {
      setError('Please enter a new password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and numbers.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await resetPassword(token, password);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#072730',
      padding: '1.5rem'
    }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0EADAB' }}>GamePlan AI</h1>
          <p style={{ fontSize: '1rem', color: '#A1A1A2', marginTop: '0.5rem' }}>Reset your password</p>
        </div>

        <Card style={{ border: '1px solid #4E4E50', backgroundColor: '#1B1C25', color: 'white' }}>
          <CardHeader>
            <CardTitle style={{ color: '#0EADAB' }}>
              {isSuccess ? 'Password Reset Successful' : 'Create New Password'}
            </CardTitle>
            <CardDescription style={{ color: '#A1A1A2' }}>
              {isSuccess
                ? 'Your password has been reset successfully.'
                : 'Enter a new password for your account.'}
            </CardDescription>
          </CardHeader>

          {tokenError ? (
            <CardContent>
              <div style={{ color: '#D03E35', textAlign: 'center', padding: '1rem 0' }}>
                <p>{tokenError}</p>
              </div>
            </CardContent>
          ) : isSuccess ? (
            <CardContent>
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p>You can now log in with your new password.</p>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password" style={{ color: '#A1A1A2' }}>New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        backgroundColor: '#072730',
                        borderColor: '#4E4E50',
                        color: 'white'
                      }}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" style={{ color: '#A1A1A2' }}>Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        backgroundColor: '#072730',
                        borderColor: '#4E4E50',
                        color: 'white'
                      }}
                      disabled={isSubmitting}
                    />
                  </div>

                  {error && (
                    <div style={{ color: '#D03E35', fontSize: '0.875rem' }}>
                      {error}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  style={{
                    backgroundColor: '#0EADAB',
                    color: 'white',
                    width: '100%'
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </CardFooter>
            </form>
          )}

          {(isSuccess || tokenError) && (
            <CardFooter>
              <Button
                onClick={() => navigate('/')}
                style={{
                  backgroundColor: '#0EADAB',
                  color: 'white',
                  width: '100%'
                }}
              >
                Return to Login
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
