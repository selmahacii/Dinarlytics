import { useTranslation as useI18n } from 'react-i18next';
import { Langue } from '@/types';
import { useEffect } from 'react';
import { useApp } from '@core/context/AppContext';

export const useTranslation = (ns = 'translation') => {
  const { t, i18n } = useI18n(ns);
  const { currentLang, setLang } = useApp();

  // Sync i18next with AppContext if they ever diverge
  useEffect(() => {
    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }, [currentLang, i18n]);

  const changeLang = (lang: Langue) => {
    i18n.changeLanguage(lang);
    setLang(lang);
  };

  return { 
    t, 
    currentLang: i18n.language as Langue, 
    changeLang,
    i18n 
  };
};


