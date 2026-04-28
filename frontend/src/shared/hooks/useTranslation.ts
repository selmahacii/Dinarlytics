import { useTranslation as useI18n } from 'react-i18next';
import { Langue } from '@/types';
import { useEffect } from 'react';
import { useApp } from '@core/context/AppContext';

export const useTranslation = (ns = 'translation') => {
  const { t, i18n } = useI18n(ns);
  const { currentLang, setLang } = useApp();

  const changeLang = (lang: Langue) => {
    setLang(lang);
  };

  return { 
    t, 
    currentLang, 
    changeLang,
    i18n 
  };
};


