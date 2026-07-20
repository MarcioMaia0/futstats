import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import logoBackground from '../../../assets/backgrounds/logo-background.png';
import logoFinal from '../../../assets/brand/logo-final.png';
import { components, defaultTheme } from '../../../theme';
import { signUpWithEmail } from '../services/authService';
import {
  buildSignUpPayload,
  checkUsernameAvailability,
  formatContactPhone,
  resolveUsernameSuggestion,
  validateContactPhone,
  validatePasswordConfirmation,
  validateUsernameCandidate,
} from '../services/signUpService';

type SignUpScreenProps = {
  onBackToLogin?: () => void;
};

type IoniconName = ComponentProps<typeof Ionicons>['name'];
const SHOW_FIELD_LABELS = false;

function hookProps(id: string) {
  return {
    nativeID: id,
    testID: id,
  };
}

export function SignUpScreen({ onBackToLogin }: SignUpScreenProps) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const hasEditedUsernameRef = useRef(false);

  useEffect(() => {
    const trimmedName = displayName.trim();

    if (!trimmedName || hasEditedUsernameRef.current) {
      if (!trimmedName) {
        setUsername('');
        setIsUsernameAvailable(null);
      }

      return;
    }

    let isMounted = true;

    async function hydrateSuggestion() {
      setIsUsernameLoading(true);
      const result = await resolveUsernameSuggestion(trimmedName);

      if (!isMounted) {
        return;
      }

      setUsername(result.selectedUsername);
      setIsUsernameAvailable(result.selectedUsernameAvailable);
      setIsUsernameLoading(false);
    }

    void hydrateSuggestion();

    return () => {
      isMounted = false;
    };
  }, [displayName]);

  useEffect(() => {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      setIsUsernameAvailable(null);
      return;
    }

    const validation = validateUsernameCandidate(normalizedUsername);

    if (!validation.valid) {
      setIsUsernameAvailable(false);
      return;
    }

    let isMounted = true;
    const timeoutId = setTimeout(async () => {
      setIsUsernameLoading(true);
      const result = await checkUsernameAvailability(validation.username);

      if (!isMounted) {
        return;
      }

      setIsUsernameAvailable(result.available);
      setIsUsernameLoading(false);
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [username]);

  const usernameValidation = useMemo(() => validateUsernameCandidate(username), [username]);
  const contactPhoneValidation = useMemo(() => validateContactPhone(contactPhone), [contactPhone]);
  const isPasswordConfirmationValid = validatePasswordConfirmation(password, confirmPassword);
  const canSubmit =
    !isSubmitting &&
    !!displayName.trim() &&
    !!email.trim() &&
    !!password &&
    !!confirmPassword &&
    termsAccepted &&
    usernameValidation.valid &&
    isUsernameAvailable === true &&
    contactPhoneValidation.valid &&
    isPasswordConfirmationValid;

  const usernameHelperText = useMemo(() => {
    if (!username.trim()) {
      return 'O @usuario será sugerido automaticamente a partir do nome.';
    }

    if (isUsernameLoading) {
      return 'Validando disponibilidade...';
    }

    if (!usernameValidation.valid) {
      if (usernameValidation.code === 'TOO_SHORT') {
        return 'O @usuario precisa ter pelo menos 3 caracteres.';
      }

      if (usernameValidation.code === 'TOO_LONG') {
        return 'O @usuario pode ter no máximo 20 caracteres.';
      }

      if (usernameValidation.code === 'RESERVED') {
        return 'Esse @usuario é reservado.';
      }

      return 'Use apenas letras minúsculas, números, _ e .';
    }

    if (isUsernameAvailable === false) {
      return 'Esse @usuario já está em uso.';
    }

    if (isUsernameAvailable === true) {
      return 'Esse @usuario está disponível.';
    }

    return 'Edite se quiser ajustar a sugestão.';
  }, [isUsernameAvailable, isUsernameLoading, username, usernameValidation]);

  const contactPhoneHelperText = useMemo(() => {
    if (!contactPhone.trim() || contactPhoneValidation.valid) {
      return null;
    }

    if (contactPhoneValidation.code === 'INVALID_DDD') {
      return 'Informe um DDD válido. Ex.: (11) 99999-9999.';
    }

    return 'Informe DDD + número. Ex.: (11) 99999-9999.';
  }, [contactPhone, contactPhoneValidation]);

  async function handleSignUp() {
    if (!contactPhoneValidation.valid) {
      setAuthSuccessMessage(null);
      setAuthError('Informe um telefone com DDD válido ou deixe o campo vazio.');
      return;
    }

    if (!canSubmit) {
      setAuthSuccessMessage(null);
      setAuthError('Preencha os campos obrigatórios e revise o @usuario e a senha.');
      return;
    }

    setAuthError(null);
    setAuthSuccessMessage(null);
    setIsSubmitting(true);

    const payload = buildSignUpPayload({
      contactPhone,
      displayName,
      email,
      password,
      termsAccepted,
      username,
    });

    const { data, error } = await signUpWithEmail({
      contactPhone: payload.contact_phone,
      displayName: payload.display_name,
      email: payload.email,
      password: payload.password,
      termsAccepted: payload.terms_accepted,
      username: payload.username,
    });

    if (error) {
      setAuthError(error.message);
      setIsSubmitting(false);
      return;
    }

    if (!data.session) {
      setAuthSuccessMessage('Conta criada. Se o app não entrar sozinho, confirme o e-mail e tente acessar em seguida.');
      setIsSubmitting(false);
    }
  }

  function handleDisplayNameChange(value: string) {
    setDisplayName(value);
    setAuthError(null);
    setAuthSuccessMessage(null);
  }

  function handleUsernameChange(value: string) {
    hasEditedUsernameRef.current = true;
    setUsername(value.toLowerCase());
    setAuthError(null);
    setAuthSuccessMessage(null);
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    setAuthError(null);
    setAuthSuccessMessage(null);
  }

  function handleContactPhoneChange(value: string) {
    setContactPhone(formatContactPhone(value));
    setAuthError(null);
    setAuthSuccessMessage(null);
  }

  return (
    <View className="flex-1 relative overflow-hidden" {...hookProps('sign-up-container-main')}>
      <View pointerEvents="none" style={styles.watermarkLayer} {...hookProps('sign-up-container-watermark')}>
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          source={logoBackground}
          style={styles.watermarkImage}
          {...hookProps('sign-up-image-watermark')}
          className="-left-2/5 -top-1/8 md:left-0 md:-top-1/8"
        />
      </View>
      <ScrollView
        className="w-full flex-1"
        contentContainerClassName="min-h-full px-4 pb-8 pt-3 md:items-center"
        keyboardShouldPersistTaps="handled"
        {...hookProps('sign-up-container-scroll')}
      >
        <View className="w-full gap-6 md:max-w-lg mt-5" {...hookProps('sign-up-container-shell')}>
          {/*<View className="h-[180px] w-[220px] self-center" {...hookProps('sign-up-container-logo')}>
            <Image
              accessibilityLabel="Logo FUTSTATS"
              resizeMode="contain"
              source={logoFinal}
              style={{ height: '100%', width: '100%' }}
              {...hookProps('sign-up-image-logo')}
            />
          </View>*/}

          <View className="gap-2" {...hookProps('sign-up-container-hero')}>
            <Text className="text-center font-slab text-[2rem] leading-[2.3rem] text-brand-gold" {...hookProps('sign-up-text-title')}>
              Criar conta
            </Text>
            <Text className="text-center text-base leading-6 text-text-subdued" {...hookProps('sign-up-text-subtitle')}>
              Crie sua conta para entrar no app e começar sua jornada no FUTSTATS.
            </Text>
          </View>

          <View className="gap-5" {...hookProps('sign-up-container-form')}>
            {SHOW_FIELD_LABELS ? <FieldLabel icon="person-circle-outline" id="sign-up-label-display-name" text="Nome de exibição" /> : null}
            <AuthTextField
              autoCapitalize="words"
              hookId="sign-up-input-display-name"
              icon="person-circle-outline"
              onChangeText={handleDisplayNameChange}
              placeholder="Nome de exibição no app"
              value={displayName}
            />

            {SHOW_FIELD_LABELS ? <FieldLabel icon="at-outline" id="sign-up-label-username" text="@usuario" /> : null}
            <AuthTextField
              autoCapitalize="none"
              hookId="sign-up-input-username"
              icon="at-outline"
              onChangeText={handleUsernameChange}
              placeholder="@usuario público"
              value={username}
            />
            <Text
              className="text-[12px] leading-[18px]"
              style={{
                color: isUsernameAvailable === true ? '#77D38B' : isUsernameAvailable === false ? '#FF7B7B' : defaultTheme.text.muted,
              }}
              {...hookProps('sign-up-text-username-helper')}
            >
              {usernameHelperText}
            </Text>

            {SHOW_FIELD_LABELS ? <FieldLabel icon="mail-outline" id="sign-up-label-email" text="E-mail" /> : null}
            <AuthTextField
              autoCapitalize="none"
              hookId="sign-up-input-email"
              icon="mail-outline"
              keyboardType="email-address"
              onChangeText={handleEmailChange}
              placeholder="E-mail de acesso"
              value={email}
            />

            {SHOW_FIELD_LABELS ? <FieldLabel icon="call-outline" id="sign-up-label-contact-phone" text="Telefone de contato (opcional)" /> : null}
            <AuthTextField
              hookId="sign-up-input-contact-phone"
              icon="call-outline"
              keyboardType="phone-pad"
              onChangeText={handleContactPhoneChange}
              placeholder="Telefone com DDD (opcional)"
              value={contactPhone}
            />
            {contactPhoneHelperText ? (
              <Text className="text-[12px] leading-[18px] text-[#FF7B7B]" {...hookProps('sign-up-text-contact-phone-helper')}>
                {contactPhoneHelperText}
              </Text>
            ) : null}

            {SHOW_FIELD_LABELS ? <FieldLabel icon="lock-closed-outline" id="sign-up-label-password" text="Senha" /> : null}
            <PasswordField
              hookId="sign-up-input-password"
              onChangeText={(value) => {
                setPassword(value);
                setAuthError(null);
                setAuthSuccessMessage(null);
              }}
              onToggleVisibility={() => setIsPasswordVisible((current) => !current)}
              placeholder="Senha com pelo menos 8 caracteres"
              value={password}
              visible={isPasswordVisible}
            />

            {SHOW_FIELD_LABELS ? <FieldLabel icon="shield-checkmark-outline" id="sign-up-label-confirm-password" text="Confirmar senha" /> : null}
            <PasswordField
              hookId="sign-up-input-confirm-password"
              onChangeText={(value) => {
                setConfirmPassword(value);
                setAuthError(null);
                setAuthSuccessMessage(null);
              }}
              onToggleVisibility={() => setIsConfirmPasswordVisible((current) => !current)}
              placeholder="Confirmar senha"
              value={confirmPassword}
              visible={isConfirmPasswordVisible}
            />
            {confirmPassword ? (
              <Text
                className="text-[12px] leading-[18px]"
                style={{ color: isPasswordConfirmationValid ? '#77D38B' : '#FF7B7B' }}
                {...hookProps('sign-up-text-confirm-password-helper')}
              >
                {isPasswordConfirmationValid ? 'As senhas conferem.' : 'As senhas não conferem.'}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="checkbox"
              className="mt-1 flex-row items-center gap-3"
              onPress={() => {
                setTermsAccepted((current) => !current);
                setAuthError(null);
                setAuthSuccessMessage(null);
              }}
              {...hookProps('sign-up-button-terms')}
            >
              <View
                className="h-[28px] w-[28px] items-center justify-center rounded-[8px] border"
                style={{ borderColor: defaultTheme.color.primary, backgroundColor: termsAccepted ? defaultTheme.color.primary : 'transparent' }}
                {...hookProps('sign-up-container-terms-checkbox')}
              >
                {termsAccepted ? <Ionicons color="#1E1E1E" name="checkmark" size={16} /> : null}
              </View>
              <Text className="flex-1 text-[15px] leading-6 text-white" {...hookProps('sign-up-text-terms')}>
                <Ionicons color={defaultTheme.color.primary} name="shield-checkmark-outline" size={16} />{' '}
                Eu aceito os <Text className="font-bold text-brand-gold">Termos de Uso</Text> e a{' '}
                <Text className="font-bold text-brand-gold">Política de Privacidade</Text>.
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              className={`mt-2 flex-row items-center justify-center gap-2 rounded-[22px] py-[18px] ${canSubmit ? 'bg-brand-gold' : 'bg-brand-gold/50'}`}
              disabled={!canSubmit}
              onPress={handleSignUp}
              {...hookProps('sign-up-button-submit')}
            >
              <Ionicons color="#1E1E1E" name="person-add-outline" size={22} />
              <Text className="text-[19px] font-bold leading-6 text-[#1E1E1E]" {...hookProps('sign-up-text-submit')}>
                {isSubmitting ? 'Criando...' : 'Criar conta'}
              </Text>
            </Pressable>

            <Pressable accessibilityRole="button" className="flex-row items-center justify-center gap-2 py-2" onPress={onBackToLogin} {...hookProps('sign-up-button-login')}>
              <Ionicons color={defaultTheme.color.primary} name="log-in-outline" size={18} />
              <Text className="text-[16px] leading-6 text-text-subdued" {...hookProps('sign-up-text-login')}>
                Já tem conta? <Text className="font-bold text-brand-gold">Entrar</Text>
              </Text>
            </Pressable>
          </View>

          {authSuccessMessage ? (
            <Text className="text-center text-[12px] leading-[18px] text-[#77D38B]" {...hookProps('sign-up-text-auth-success')}>
              {authSuccessMessage}
            </Text>
          ) : null}

          {authError ? (
            <Text className="text-center text-[11px] leading-[17px] text-[#FF7B7B]" {...hookProps('sign-up-text-auth-error')}>
              {authError}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function FieldLabel({ icon, id, text }: { icon?: IoniconName; id: string; text: string }) {
  return (
    <View className="flex-row items-center gap-2" {...hookProps(`${id}-row`)}>
      {icon ? <Ionicons color={defaultTheme.color.primary} name={icon} size={16} /> : null}
      <Text className="text-[13px] font-bold leading-[18px] text-brand-gold" {...hookProps(id)}>
        {text}
      </Text>
    </View>
  );
}

function AuthTextField({
  autoCapitalize,
  hookId,
  icon,
  keyboardType,
  onChangeText,
  placeholder,
  value,
}: {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  hookId: string;
  icon: IoniconName;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View className="relative" {...hookProps(`${hookId}-container`)}>
      <View className="absolute left-4 top-0 z-10 h-[58px] items-center justify-center" {...hookProps(`${hookId}-icon`)}>
        <Ionicons color={defaultTheme.color.primary} name={icon} size={20} />
      </View>
      <TextInput
        autoCapitalize={autoCapitalize}
        className="min-h-[58px] rounded-[22px] border border-[#5A5A5A] bg-[#242424] px-4 pl-12 text-[15px] leading-5 text-white"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={components.input.placeholderColor}
        value={value}
        {...hookProps(hookId)}
      />
    </View>
  );
}

function PasswordField({
  hookId,
  onChangeText,
  onToggleVisibility,
  placeholder,
  value,
  visible,
}: {
  hookId: string;
  onChangeText: (value: string) => void;
  onToggleVisibility: () => void;
  placeholder: string;
  value: string;
  visible: boolean;
}) {
  return (
    <View className="relative" {...hookProps(`${hookId}-container`)}>
      <View className="absolute left-4 top-0 z-10 h-[58px] items-center justify-center" {...hookProps(`${hookId}-icon`)}>
        <Ionicons color={defaultTheme.color.primary} name="lock-closed-outline" size={20} />
      </View>
      <TextInput
        className="min-h-[58px] rounded-[22px] border border-[#5A5A5A] bg-[#242424] px-4 pl-12 pr-14 text-[15px] leading-5 text-white"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={components.input.placeholderColor}
        secureTextEntry={!visible}
        value={value}
        {...hookProps(hookId)}
      />
      <Pressable
        accessibilityRole="button"
        className="absolute right-4 top-0 h-[58px] items-center justify-center"
        onPress={onToggleVisibility}
        {...hookProps(`${hookId}-toggle-visibility`)}
      >
        <Ionicons color={defaultTheme.color.primary} name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  watermarkImage: {
    // height: 420,
    opacity: 0.8,
    // width: 420,
  },
  watermarkLayer: {
    ...StyleSheet.absoluteFill,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
