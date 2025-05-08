import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { HomeIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const getInitials = (email: string) => {
    return email?.charAt(0).toUpperCase() || '';
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleCreatePoll = () => {
    router.push('/polls/new');
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Social Polling
              </h1>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              {router.pathname !== '/dashboard' && (
                <button
                  onClick={handleGoHome}
                  className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  title="Go to Dashboard"
                >
                  <HomeIcon className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={handleCreatePoll}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                title="Create new poll"
              >
                <PlusCircleIcon className="h-5 w-5 sm:mr-1.5" />
                <span className="hidden sm:inline">Create Poll</span>
              </button>
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="text-sm font-medium">
                    {getInitials(user.email || '')}
                  </span>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleSignOut}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block w-full px-4 py-2 text-left text-sm text-gray-700`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 