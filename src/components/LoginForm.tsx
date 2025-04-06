import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../lib/auth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic validation
      if (!email || !password) {
        throw new Error('Email e password sono obbligatori');
      }

      if (password.length < 6) {
        throw new Error('La password deve essere di almeno 6 caratteri');
      }

      // Sign in with Supabase
      const { user } = await signIn(email, password);
      
      if (!user?.id) {
        throw new Error('Errore durante l\'autenticazione: dati utente mancanti');
      }

      // Save auth data
      localStorage.setItem('userId', user.id);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Credenziali non valide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800/50 p-8 rounded-lg shadow-xl backdrop-blur-sm ring-1 ring-white/10">
        <div>
          <h2 className="text-2xl font-semibold text-center text-white mb-8">
            FlashTicket 2.0
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 text-red-200 rounded-lg ring-1 ring-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border-0 bg-white/5 
                text-white shadow-sm ring-1 ring-inset ring-white/10 
                focus:ring-2 focus:ring-inset focus:ring-purple-500
                sm:text-sm sm:leading-6"
              required
              disabled={loading}
              autoComplete="email"
              placeholder="Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border-0 bg-white/5 
                text-white shadow-sm ring-1 ring-inset ring-white/10 
                focus:ring-2 focus:ring-inset focus:ring-purple-500
                sm:text-sm sm:leading-6"
              required
              minLength={6}
              disabled={loading}
              autoComplete="current-password"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent 
              rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 
              hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-purple-500 transition-all duration-200 
              hover:shadow-lg hover:shadow-purple-500/20
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}
