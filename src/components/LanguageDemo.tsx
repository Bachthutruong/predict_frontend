import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const LanguageDemo: React.FC = () => {
  const { t, currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('common.language')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {t('common.language')}: {currentLanguage}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">{t('auth.login')}</h3>
          <p className="text-sm">{t('auth.email')}: user@example.com</p>
          <p className="text-sm">{t('auth.password')}: ********</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">{t('navigation.dashboard')}</h3>
          <p className="text-sm">{t('dashboard.welcome')}</p>
          <p className="text-sm">{t('dashboard.totalPoints')}: 1000</p>
        </div>

        <div className="flex space-x-2">
          {availableLanguages.map((language) => (
            <Button
              key={language.code}
              variant={currentLanguage === language.code ? "default" : "outline"}
              size="sm"
              onClick={() => changeLanguage(language.code)}
            >
              {language.nativeName}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageDemo; 