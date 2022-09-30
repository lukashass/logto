import { SignInExperience as SignInExperienceType } from '@logto/schemas';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import ConfirmModal from '@/components/ConfirmModal';
import TabNav, { TabNavItem } from '@/components/TabNav';
import useApi, { RequestError } from '@/hooks/use-api';
import useSettings from '@/hooks/use-settings';
import * as detailsStyles from '@/scss/details.module.scss';

import Preview from './components/Preview';
import SignInMethodsChangePreview from './components/SignInMethodsChangePreview';
import Skeleton from './components/Skeleton';
import Welcome from './components/Welcome';
import usePreviewConfigs from './hooks';
import useCustomPhrasesContext from './hooks/use-custom-phrases-context';
import * as styles from './index.module.scss';
import BrandingTab from './tabs/BrandingTab';
import OthersTab from './tabs/OthersTab';
import SignInMethodsTab from './tabs/SignInMethodsTab';
import { SignInExperienceForm } from './types';
import { compareSignInMethods, signInExperienceParser } from './utilities';

const SignInExperience = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tab } = useParams();
  const { data, error, mutate } = useSWR<SignInExperienceType, RequestError>('/api/sign-in-exp');
  const { settings, error: settingsError, updateSettings, mutate: mutateSettings } = useSettings();
  const [dataToCompare, setDataToCompare] = useState<SignInExperienceType>();

  const methods = useForm<SignInExperienceForm>();
  const {
    reset,
    handleSubmit,
    getValues,
    watch,
    formState: { isSubmitting, isDirty },
  } = methods;
  const api = useApi();
  const formData = watch();

  const previewConfigs = usePreviewConfigs(formData, isDirty, data);
  const { context: customPhrasesContext, Provider: CustomPhraseProvider } =
    useCustomPhrasesContext();

  const defaultFormData = useMemo(() => {
    if (!data) {
      return;
    }

    return signInExperienceParser.toLocalForm(data);
  }, [data]);

  useEffect(() => {
    if (defaultFormData && !isDirty) {
      reset(defaultFormData);
    }
  }, [reset, isDirty, defaultFormData]);

  const saveData = async () => {
    const updatedData = await api
      .patch('/api/sign-in-exp', {
        json: signInExperienceParser.toRemoteModel(getValues()),
      })
      .json<SignInExperienceType>();
    void mutate(updatedData);
    await updateSettings({ signInExperienceCustomized: true });
    toast.success(t('general.saved'));
  };

  const onSubmit = handleSubmit(async (formData) => {
    if (!data || isSubmitting) {
      return;
    }

    const formatted = signInExperienceParser.toRemoteModel(formData);

    // Sign-in methods changed, need to show confirm modal first.
    if (!compareSignInMethods(data, formatted)) {
      setDataToCompare(formatted);

      return;
    }

    await saveData();
  });

  if ((!settings && !settingsError) || (!data && !error)) {
    return <Skeleton />;
  }

  if (!settings && settingsError) {
    return <div>{settingsError.body?.message ?? settingsError.message}</div>;
  }

  if (!settings?.signInExperienceCustomized) {
    return (
      <CustomPhraseProvider value={customPhrasesContext}>
        <Welcome
          mutate={() => {
            void mutateSettings();
            void mutate();
          }}
        />
      </CustomPhraseProvider>
    );
  }

  return (
    <CustomPhraseProvider value={customPhrasesContext}>
      <div className={styles.wrapper}>
        <div className={classNames(styles.setup, detailsStyles.container)}>
          <Card className={styles.card}>
            <CardTitle title="sign_in_exp.title" subtitle="sign_in_exp.description" />
            <TabNav className={styles.tabs}>
              <TabNavItem href="/sign-in-experience/branding">
                {t('sign_in_exp.tabs.branding')}
              </TabNavItem>
              <TabNavItem href="/sign-in-experience/methods">
                {t('sign_in_exp.tabs.methods')}
              </TabNavItem>
              <TabNavItem href="/sign-in-experience/others">
                {t('sign_in_exp.tabs.others')}
              </TabNavItem>
            </TabNav>
            {!data && error && (
              <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>
            )}
            {data && defaultFormData && (
              <FormProvider {...methods}>
                <form className={styles.formWrapper} onSubmit={onSubmit}>
                  <div className={classNames(detailsStyles.body, styles.form)}>
                    {tab === 'branding' && (
                      <BrandingTab defaultData={defaultFormData} isDataDirty={isDirty} />
                    )}
                    {tab === 'methods' && (
                      <SignInMethodsTab defaultData={defaultFormData} isDataDirty={isDirty} />
                    )}
                    {tab === 'others' && (
                      <OthersTab defaultData={defaultFormData} isDataDirty={isDirty} />
                    )}
                  </div>
                  <div className={detailsStyles.footer}>
                    <div className={detailsStyles.footerMain}>
                      <Button
                        isLoading={isSubmitting}
                        type="primary"
                        size="large"
                        htmlType="submit"
                        title="general.save_changes"
                      />
                    </div>
                  </div>
                </form>
              </FormProvider>
            )}
          </Card>
        </div>
        {formData.id && <Preview signInExperience={previewConfigs} />}
        {data && (
          <ConfirmModal
            isOpen={Boolean(dataToCompare)}
            onCancel={() => {
              setDataToCompare(undefined);
            }}
            onConfirm={async () => {
              await saveData();
              setDataToCompare(undefined);
            }}
          >
            {dataToCompare && <SignInMethodsChangePreview before={data} after={dataToCompare} />}
          </ConfirmModal>
        )}
      </div>
    </CustomPhraseProvider>
  );
};

export default SignInExperience;
