
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User is already logged in, redirecting to home');
      navigate('/home');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting to sign in with email:', email);
      const { error } = await signInWithEmail(email);
      
      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email!",
          description: "We sent you a magic link to sign in.",
        });
        setEmail('');
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#071b2d]">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  // Don't render login form if user is already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#071b2d] text-white p-4 font-sans">
      <div className="text-center mb-10">
        <div className="inline-block p-4 bg-[#00e0ff]/20 rounded-full mb-4">
          <LogIn className="h-8 w-8 text-[#00e0ff]" />
        </div>
        <h1 className="text-3xl font-bold">Welcome to Surfable</h1>
        <p className="text-white/80 mt-2">
          Sign in to share your surf videos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/80 sr-only">Email Address</Label>
          <div className="relative flex items-center">
            <Mail className="absolute left-4 h-5 w-5 text-[#00e0ff]/60" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12 w-full h-14 bg-white/10 border-white/20 rounded-xl text-lg text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#00e0ff] focus:border-[#00e0ff] transition-all"
              required
              disabled={loading}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 bg-[#00e0ff] text-[#071b2d] font-bold text-lg rounded-xl hover:bg-white transition-all active:scale-95" 
          disabled={loading || !email.trim()}
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-white/60">
        <p>We'll send a secure link to sign in instantly.</p>
        <p className="mt-1">No password required!</p>
      </div>
    </div>
  );
};

export default Login;
