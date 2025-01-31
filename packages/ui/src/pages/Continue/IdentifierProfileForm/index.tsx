import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { SmartInputField } from '@/components/InputFields';
import type {
  IdentifierInputType,
  IdentifierInputValue,
} from '@/components/InputFields/SmartInputField';
import { getGeneralIdentifierErrorMessage, validateIdentifierField } from '@/utils/form';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  defaultType?: IdentifierInputType;
  enabledTypes: IdentifierInputType[];

  onSubmit?: (identifier: IdentifierInputType, value: string) => Promise<void> | void;
  errorMessage?: string;
  clearErrorMessage?: () => void;
};

type FormState = {
  identifier: IdentifierInputValue;
};

const IdentifierProfileForm = ({
  className,
  autoFocus,
  defaultType,
  enabledTypes,
  onSubmit,
  errorMessage,
  clearErrorMessage,
}: Props) => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<FormState>({
    reValidateMode: 'onBlur',
    defaultValues: {
      identifier: {
        type: defaultType,
        value: '',
      },
    },
  });

  useEffect(() => {
    if (!isValid) {
      clearErrorMessage?.();
    }
  }, [clearErrorMessage, isValid]);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage?.();

      void handleSubmit(async ({ identifier: { type, value } }) => {
        if (!type) {
          return;
        }

        await onSubmit?.(type, value);
      })(event);
    },
    [clearErrorMessage, handleSubmit, onSubmit]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Controller
        control={control}
        name="identifier"
        rules={{
          validate: (identifier) => {
            const { type, value } = identifier;

            if (!type || !value) {
              return getGeneralIdentifierErrorMessage(enabledTypes, 'required');
            }

            const errorMessage = validateIdentifierField(type, value);

            if (errorMessage) {
              return typeof errorMessage === 'string'
                ? t(`error.${errorMessage}`)
                : t(`error.${errorMessage.code}`, errorMessage.data);
            }

            return true;
          },
        }}
        render={({ field }) => (
          <SmartInputField
            autoComplete="new-identifier"
            autoFocus={autoFocus}
            className={styles.inputField}
            {...field}
            defaultType={defaultType}
            isDanger={!!errors.identifier}
            errorMessage={errors.identifier?.message}
            enabledTypes={enabledTypes}
          />
        )}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <Button title="action.continue" htmlType="submit" />

      <input hidden type="submit" />
    </form>
  );
};

export default IdentifierProfileForm;
