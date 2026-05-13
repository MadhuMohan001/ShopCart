import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-black text-gray-200 dark:text-gray-800">404</h1>
      <h2 className="text-2xl font-bold mb-2 -mt-4">Page not found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary">Go Back Home</Link>
    </div>
  );
}
