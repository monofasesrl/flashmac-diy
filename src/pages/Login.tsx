import { LoginForm } from '../components/LoginForm';

export function Login() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 rounded-lg">
        <LoginForm />
      </div>
    </div>
  );
}
