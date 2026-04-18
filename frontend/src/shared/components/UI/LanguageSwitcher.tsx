import React from 'react';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { Globe } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { clsx } from 'clsx';

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇩🇿' },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n, changeLang, currentLang: langCode } = useTranslation();

  const changeLanguage = (lng: string) => {
    changeLang(lng as any);
  };

  const currentLanguage = languages.find((l) => l.code === langCode) || languages[0];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center gap-x-2 rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none transition-all duration-200">
          <Globe className="h-4 w-4 text-gray-500" aria-hidden="true" />
          <span className="hidden sm:inline">{currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-slate-700">
          <div className="py-1">
            {languages.map((lang) => (
              <Menu.Item key={lang.code}>
                {({ active }) => (
                  <button
                    onClick={() => changeLanguage(lang.code)}
                    className={clsx(
                      active ? 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300',
                      'flex w-full items-center px-4 py-2 text-sm transition-colors duration-150'
                    )}
                  >
                    <span className="mr-3">{lang.flag}</span>
                    <span className={clsx(i18n.language === lang.code ? 'font-bold' : 'font-normal')}>
                      {lang.name}
                    </span>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default LanguageSwitcher;
