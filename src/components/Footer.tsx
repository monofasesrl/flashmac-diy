import { useI18n } from '../lib/i18n/context';

export function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col items-center text-xs text-gray-500 dark:text-gray-400">
        <p>© {currentYear} MONOFASE SRLS - Tutti i diritti riservati.</p>
        <p className="mt-1">
          <a 
            href="https://www.flashmac.com/privacy/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t('footer.privacy')}
          </a>
        </p>
      </div>
    </footer>
  );
}
