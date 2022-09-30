import { languages } from '@logto/language-kit';
import classNames from 'classnames';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';
import Select from '@/components/Select';
import Switch from '@/components/Switch';
import * as textButtonStyles from '@/components/TextButton/index.module.scss';

import { CustomPhrasesContext } from '../hooks/use-custom-phrases-context';
import { SignInExperienceForm } from '../types';
import ManageLanguageModal from './ManageLanguageModal';
import * as styles from './index.module.scss';

type Props = {
  isManageLanguageVisible?: boolean;
};

const LanguagesForm = ({ isManageLanguageVisible = false }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { watch, control, register } = useFormContext<SignInExperienceForm>();
  const isAutoDetect = watch('languageInfo.autoDetect');
  const defaultLanguage = watch('languageInfo.fallbackLanguage');
  const [isManageLanguageFormOpen, setIsManageLanguageFormOpen] = useState(false);

  const { existedLanguageTags, setDefaultLanguageTag } = useContext(CustomPhrasesContext);

  const defaultLanguageOptions = useMemo(() => {
    return existedLanguageTags.map((languageTag) => ({
      value: languageTag,
      title: languages[languageTag],
    }));
  }, [existedLanguageTags]);

  useEffect(() => {
    setDefaultLanguageTag(defaultLanguage);
  }, [defaultLanguage, setDefaultLanguageTag]);

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.others.languages.title')}</div>
      <FormField title="sign_in_exp.others.languages.enable_auto_detect">
        <Switch
          {...register('languageInfo.autoDetect')}
          label={t('sign_in_exp.others.languages.description')}
        />
      </FormField>
      {isManageLanguageVisible && (
        <div
          className={classNames(textButtonStyles.button, styles.manageLanguage)}
          onClick={() => {
            setIsManageLanguageFormOpen(true);
          }}
        >
          {t('sign_in_exp.others.languages.manage_language')}
        </div>
      )}
      <FormField title="sign_in_exp.others.languages.default_language">
        <Controller
          name="languageInfo.fallbackLanguage"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select value={value} options={defaultLanguageOptions} onChange={onChange} />
          )}
        />
        <div className={styles.defaultLanguageDescription}>
          {isAutoDetect
            ? t('sign_in_exp.others.languages.default_language_description_auto')
            : t('sign_in_exp.others.languages.default_language_description_fixed')}
        </div>
      </FormField>
      <ManageLanguageModal
        isOpen={isManageLanguageFormOpen}
        onClose={() => {
          setIsManageLanguageFormOpen(false);
        }}
      />
    </>
  );
};

export default LanguagesForm;
