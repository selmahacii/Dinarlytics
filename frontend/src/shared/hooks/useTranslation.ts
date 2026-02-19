import { useApp } from '@core/context/AppContext';
import { translations } from '@shared/utils/translations';
import { Langue } from '@/types';

export const useTranslation = () => {
  const { currentLang, setLang } = useApp();

  const t = (key: string) => {
    // @ts-ignore
    return translations[currentLang]?.[key] || key;
  };

  const changeLang = (lang: Langue) => {
    // @ts-ignore
    setLang(lang);
  };

  return { t, currentLang, changeLang };
};


