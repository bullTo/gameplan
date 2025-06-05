import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset } from '@/api/auth';

interface ForgotPasswordDialogProps {
  trigger?: React.ReactNode;
}

export function ForgotPasswordDialog({ trigger }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await requestPasswordReset(email);
      console.log('Password reset response:', response);
      setIsSuccess(true);

      // In development, log the debug info
      if (import.meta.env.DEV && response.debug) {
        console.log('Debug info:', response.debug);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset form state after dialog is closed
    setTimeout(() => {
      setEmail('');
      setIsSuccess(false);
      setError(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="link" style={{ color: '#0EADAB' }}>Forgot password?</Button>}
      </DialogTrigger>
      <DialogContent style={{ backgroundColor: '#1B1C25', color: 'white', border: '1px solid #4E4E50' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#0EADAB' }}>Reset Password</DialogTitle>
          <DialogDescription style={{ color: '#A1A1A2' }}>
            {!isSuccess
              ? 'Enter your email address and we\'ll send you a link to reset your password.'
              : 'Check your email for a password reset link.'}
          </DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email" style={{ color: '#A1A1A2' }}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  style={{
                    backgroundColor: '#072730',
                    borderColor: '#4E4E50',
                    color: 'white'
                  }}
                  disabled={isSubmitting}
                />
                {error && <p style={{ color: '#D03E35', fontSize: '0.875rem' }}>{error}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                style={{ borderColor: '#4E4E50', color: '#A1A1A2' }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: '#0EADAB', color: 'white' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-6">
            <p className="mb-4">
              If an account exists with the email <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
            <p className="mb-4">
              Please check your inbox and spam folder.
            </p>
            <Button
              onClick={handleClose}
              style={{ backgroundColor: '#0EADAB', color: 'white', width: '100%' }}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
