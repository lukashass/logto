import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Case from '@/assets/images/case.svg';
import * as pageLayout from '@/cloud/scss/layout.module.scss';
import Button from '@/components/Button';
import FormField from '@/components/FormField';
import OverlayScrollbar from '@/components/OverlayScrollbar';
import TextInput from '@/components/TextInput';

import ActionBar from '../../components/ActionBar';
import { CardSelector, MultiCardSelector } from '../../components/CardSelector';
import type { Questionnaire } from '../../types';
import { CloudPage } from '../../types';
import { getCloudPagePathname } from '../../utils';
import * as styles from './index.module.scss';
import { titleOptions, companySizeOptions, reasonOptions } from './options';

const About = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { control, register, handleSubmit } = useForm<Questionnaire>({
    mode: 'onChange',
  });

  const onSubmit = handleSubmit(async (formData) => {
    console.log(formData);
  });

  const onNext = async () => {
    await onSubmit();
    navigate(getCloudPagePathname(CloudPage.SignInExperience));
  };

  const onBack = async () => {
    navigate(getCloudPagePathname(CloudPage.Welcome));
  };

  return (
    <div className={pageLayout.page}>
      <OverlayScrollbar className={pageLayout.contentContainer}>
        <div className={pageLayout.content}>
          <Case />
          <div className={styles.title}>{t('cloud.about.title')}</div>
          <div className={styles.description}>{t('cloud.about.description')}</div>
          <form className={styles.form}>
            <FormField title="cloud.about.title_field" headlineClassName={styles.cardFieldHeadline}>
              <Controller
                control={control}
                name="titles"
                defaultValue={[]}
                render={({ field: { onChange, value } }) => (
                  <MultiCardSelector
                    className={styles.titleSelector}
                    optionClassName={styles.option}
                    value={value}
                    options={titleOptions}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
            <FormField title="cloud.about.company_name_field">
              <TextInput
                placeholder={t('cloud.about.company_name_placeholder')}
                {...register('companyName')}
              />
            </FormField>
            <FormField
              title="cloud.about.company_size_field"
              headlineClassName={styles.cardFieldHeadline}
            >
              <Controller
                control={control}
                name="companySize"
                render={({ field: { onChange, value, name } }) => (
                  <CardSelector
                    name={name}
                    value={value}
                    options={companySizeOptions}
                    optionClassName={styles.option}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
            <FormField
              title="cloud.about.reason_field"
              headlineClassName={styles.cardFieldHeadline}
            >
              <Controller
                control={control}
                name="reasons"
                defaultValue={[]}
                render={({ field: { onChange, value } }) => (
                  <MultiCardSelector value={value} options={reasonOptions} onChange={onChange} />
                )}
              />
            </FormField>
          </form>
        </div>
      </OverlayScrollbar>
      <ActionBar step={2}>
        <Button title="general.next" type="primary" onClick={onNext} />
        <Button title="general.back" onClick={onBack} />
      </ActionBar>
    </div>
  );
};

export default About;
