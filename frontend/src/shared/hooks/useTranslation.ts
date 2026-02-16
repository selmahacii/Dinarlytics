import { useState } from 'react';
import { translations } from '@shared/utils/translations';
import { Langue } from '@/types';

export const useTranslation = () => {
  const [currentLang, setCurrentLang] = useState<Langue>('fr');

  const t = (key: string) => {
    return translations[currentLang][key as keyof typeof translations.fr] || key;
  };

  const changeLang = (lang: Langue) => {
    setCurrentLang(lang);
  };

  return { t, currentLang, changeLang };
};


