import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

import logoFinal from '../../../assets/brand/logo-final.png';
import googleIcon from '../../../assets/icons/google.png';
import { env } from '../../../config/env';
import { components, defaultTheme } from '../../../theme';
import { signInWithEmailPassword, signInWithGoogle } from '../services/authService';

type LoginScreenProps = {
  onCreateAccountRequested?: () => void;
  onStartPathRequested?: () => void;
};

function hookProps(id: string) {
  return {
    nativeID: id,
    testID: id,
  };
}

export function LoginScreen({ onCreateAccountRequested, onStartPathRequested }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  async function handleGoogleSignIn() {
    setAuthError(null);
    setIsGoogleLoading(true);

    const { error } = await signInWithGoogle();

    if (error) {
      setAuthError(error.message);
      setIsGoogleLoading(false);
    }
  }

  async function handleEmailSignIn() {
    if (!email.trim() || !password) {
      setAuthError('Preencha e-mail e senha para entrar.');
      return;
    }

    setAuthError(null);
    setIsEmailLoading(true);

    const { error } = await signInWithEmailPassword({ email, password });

    if (error) {
      setAuthError(error.message);
      setIsEmailLoading(false);
    }
  }

  return (
    <View className="flex flex-1 justify-center items-center" {...hookProps('login-container-main')}>
      <View className="flex-1 justify-center gap-8 px-4 pb-6 pt-3 md:max-w-[500px]">
        <View className="h-[210px] w-[238px] self-center" {...hookProps('login-container-logo')}>
          <Image
            accessibilityLabel="Logo FUTSTATS"
            resizeMode="contain"
            source={logoFinal}
            style={{ height: '100%', width: '100%' }}
            {...hookProps('login-image-logo')}
          />
        </View>

        <View className="gap-2" {...hookProps('login-container-hero')}>
          <Text className="text-center font-brand text-[34px] leading-[38px] text-brand-gold" {...hookProps('login-text-title')}>
            Bem-vindo à várzea!
          </Text>
          <Text className="text-center text-base leading-[23px] text-text-subdued" {...hookProps('login-text-subtitle')}>
            Entre para acompanhar seu time, registrar partidas e transformar resenha em dados.
          </Text>
        </View>

        <View className="gap-[14px]" {...hookProps('login-container-form')}>
          <View className="gap-[14px]" {...hookProps('login-container-field-email')}>
            <Text className="text-[13px] font-bold leading-[18px] text-brand-gold" {...hookProps('login-label-email')}>
              E-mail
            </Text>
            <TextInput
              autoCapitalize="none"
              className="min-h-[58px] rounded-[22px] border border-[#5A5A5A] bg-[#242424] px-4 text-[15px] leading-5 text-white"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="nome@email.com"
              placeholderTextColor={components.input.placeholderColor}
              value={email}
              {...hookProps('login-input-email')}
            />
          </View>

          <View className="gap-[14px]" {...hookProps('login-container-field-password')}>
            <Text className="text-[13px] font-bold leading-[18px] text-brand-gold" {...hookProps('login-label-password')}>
              Senha
            </Text>
            <View className="relative" {...hookProps('login-input-password-container')}>
              <TextInput
                className="min-h-[58px] rounded-[22px] border border-[#5A5A5A] bg-[#242424] px-4 pr-14 text-[15px] leading-5 text-white"
                onChangeText={setPassword}
                placeholder="Sua senha"
                placeholderTextColor={components.input.placeholderColor}
                secureTextEntry={!isPasswordVisible}
                value={password}
                {...hookProps('login-input-password')}
              />
              <TouchableOpacity
                activeOpacity={0.76}
                className="absolute right-4 top-0 h-[58px] items-center justify-center"
                onPress={() => setIsPasswordVisible((current) => !current)}
                {...hookProps('login-button-password-visibility')}
              >
                <Ionicons color={defaultTheme.color.primary} name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={22} />
              </TouchableOpacity>
            </View>
          </View>

          {authError ? (
            <View
              className="rounded-[18px] border border-[#C94A4A] bg-[#3A1717] px-4 py-3"
              {...hookProps('login-container-auth-error')}
            >
              <Text className="text-[14px] leading-5 text-[#FF9B9B]" {...hookProps('login-text-auth-error')}>
                {authError}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.86}
            className={`mt-3 items-center rounded-[22px] py-[18px] ${isEmailLoading ? 'bg-brand-gold/70' : 'bg-brand-gold'}`}
            onPress={handleEmailSignIn}
            {...hookProps('login-button-submit')}
          >
            <Text className="text-[19px] font-bold leading-6 text-[#1E1E1E]" {...hookProps('login-text-submit')}>
              {isEmailLoading ? 'Entrando...' : 'ENTRAR'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.76} className="items-center py-1" onPress={onCreateAccountRequested} {...hookProps('login-button-create-account')}>
            <Text className="text-[16px] leading-6 text-text-subdued" {...hookProps('login-text-create-account')}>
              Ainda não tem conta? <Text className="font-bold text-brand-gold">Criar conta</Text>
            </Text>
          </TouchableOpacity>

          <View className="mb-[2px] mt-2 flex-row items-center gap-[14px]" {...hookProps('login-container-divider-social')}>
            <View className="h-px flex-1 bg-stroke-subtle" {...hookProps('login-divider-social-left')} />
            <Text className="text-[13px] font-semibold text-text-muted" {...hookProps('login-text-divider-social')}>
              ou entre com
            </Text>
            <View className="h-px flex-1 bg-stroke-subtle" {...hookProps('login-divider-social-right')} />
          </View>

          <View className="min-h-[60px] flex-row overflow-hidden rounded-[22px] border border-[#5A5A5A]" {...hookProps('login-container-social-actions')}>
            <TouchableOpacity
              activeOpacity={0.76}
              className={`flex-1 flex-row items-center justify-center gap-[10px] ${isGoogleLoading ? 'opacity-70' : ''}`}
              disabled={isGoogleLoading}
              onPress={handleGoogleSignIn}
              {...hookProps('login-button-google')}
            >
              <Image
                accessibilityLabel="Logo Google"
                resizeMode="contain"
                source={googleIcon}
                style={{ height: 23, width: 23 }}
                {...hookProps('login-icon-google')}
              />
              <Text className="text-lg font-extrabold text-white" {...hookProps('login-text-google')}>
                {isGoogleLoading ? 'Abrindo...' : 'Google'}
              </Text>
            </TouchableOpacity>

            <View className="w-px bg-[#5A5A5A]" {...hookProps('login-divider-social-vertical')} />

            <TouchableOpacity
              activeOpacity={0.76}
              className="flex-1 flex-row items-center justify-center gap-[10px]"
              {...hookProps('login-button-apple')}
            >
              <View {...hookProps('login-icon-apple')}>
                <Ionicons color={defaultTheme.icon.primary} name="logo-apple" size={24} />
              </View>
              <Text className="text-lg font-extrabold text-white" {...hookProps('login-text-apple')}>
                Apple
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.76}
            className="mt-5 items-center rounded-[22px] border border-brand-gold bg-transparent py-[17px]"
            onPress={onStartPathRequested}
            {...hookProps('login-button-guest')}
          >
            <Text className="text-[19px] font-bold leading-6 text-brand-gold" {...hookProps('login-text-guest')}>
              Entrar sem conta
            </Text>
          </TouchableOpacity>
        </View>

        {!env.hasSupabaseConfig && (
          <Text className="text-center text-[11px] leading-[17px] text-text-muted" {...hookProps('login-text-config-warning')}>
            Configure o Supabase em .env.local para habilitar autenticacao.
          </Text>
        )}

      </View>
    </View>
  );
}
