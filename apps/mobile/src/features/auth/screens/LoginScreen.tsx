import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import logoFinal from '../../../assets/brand/logo-final.png';
import googleIcon from '../../../assets/icons/google.png';
import { env } from '../../../config/env';
import { components, defaultTheme, layout, typography } from '../../../theme';
import { signInWithGoogle } from '../services/authService';

type LoginScreenProps = {
  onStartPathRequested?: () => void;
};

export function LoginScreen({ onStartPathRequested }: LoginScreenProps) {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setAuthError(null);
    setIsGoogleLoading(true);

    const { error } = await signInWithGoogle();

    if (error) {
      setAuthError(error.message);
      setIsGoogleLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.brandMark}>
        <Image accessibilityLabel="Logo FUTSTATS" resizeMode="contain" source={logoFinal} style={styles.logo} />
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>Bem-vindo à várzea!</Text>
        <Text style={styles.subtitle}>
          Entre para acompanhar seu time, registrar partidas e transformar resenha em dados.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="nome@email.com"
          placeholderTextColor={components.input.placeholderColor}
          style={styles.input}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          placeholder="Sua senha"
          placeholderTextColor={components.input.placeholderColor}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity activeOpacity={0.86} onPress={onStartPathRequested} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>ENTRAR</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou entre com</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtonsFrame}>
          <TouchableOpacity
            activeOpacity={0.76}
            disabled={isGoogleLoading}
            onPress={handleGoogleSignIn}
            style={[styles.socialButton, isGoogleLoading && styles.disabledButton]}
          >
            <Image accessibilityLabel="Logo Google" resizeMode="contain" source={googleIcon} style={styles.googleIcon} />
            <Text style={styles.socialButtonText}>{isGoogleLoading ? 'Abrindo...' : 'Google'}</Text>
          </TouchableOpacity>

          <View style={styles.socialDivider} />

          <TouchableOpacity activeOpacity={0.76} style={styles.socialButton}>
            <FontAwesome color={defaultTheme.icon.primary} name="apple" size={24} />
            <Text style={styles.socialButtonText}>Apple</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.76} onPress={onStartPathRequested} style={styles.guestButton}>
          <Text style={styles.guestButtonText}>Entrar sem conta</Text>
        </TouchableOpacity>
      </View>

      {!env.hasSupabaseConfig && (
        <Text style={styles.configWarning}>
          Configure o Supabase em .env.local para habilitar autenticação.
        </Text>
      )}

      {authError && <Text style={styles.errorText}>{authError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    gap: layout.spacing['3xl'],
    paddingTop: layout.shell.pagePaddingTop,
    paddingBottom: layout.shell.pagePaddingBottom,
    paddingHorizontal: layout.shell.pagePaddingHorizontal,
  },
  brandMark: {
    alignSelf: 'center',
    height: 210,
    width: 238,
  },
  logo: {
    height: '100%',
    width: '100%',
  },
  hero: {
    gap: layout.spacing.sm,
  },
  title: {
    color: defaultTheme.text.accent,
    fontFamily: typography.textStyles.display.fontFamily,
    fontSize: 34,
    lineHeight: 38,
    textAlign: 'center',
  },
  subtitle: {
    color: defaultTheme.text.subdued,
    fontFamily: typography.families.body,
    fontSize: typography.textStyles.action.fontSize,
    lineHeight: 23,
    textAlign: 'center',
  },
  form: {
    gap: 14,
  },
  label: {
    color: defaultTheme.text.accent,
    fontFamily: typography.textStyles.label.fontFamily,
    fontSize: typography.textStyles.label.fontSize,
    fontWeight: typography.textStyles.label.fontWeight,
    lineHeight: typography.textStyles.label.lineHeight,
  },
  input: {
    backgroundColor: components.input.backgroundColor,
    borderColor: components.input.borderColor,
    borderRadius: 22,
    borderWidth: components.input.borderWidth,
    color: components.input.textColor,
    fontFamily: components.input.textStyle.fontFamily,
    fontSize: components.input.textStyle.fontSize,
    lineHeight: components.input.textStyle.lineHeight,
    minHeight: 58,
    paddingHorizontal: components.input.paddingHorizontal,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 22,
    marginTop: layout.spacing.md,
    paddingVertical: 18,
    backgroundColor: components.button.primary.backgroundColor,
  },
  primaryButtonText: {
    color: components.button.primary.textColor,
    fontFamily: typography.families.body,
    fontSize: components.button.primary.textStyle.fontSize,
    fontWeight: components.button.primary.textStyle.fontWeight,
    lineHeight: components.button.primary.textStyle.lineHeight,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    marginBottom: 2,
    marginTop: layout.spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: defaultTheme.border.subtle,
  },
  dividerText: {
    color: defaultTheme.text.muted,
    fontFamily: typography.families.body,
    fontSize: typography.textStyles.bodySmall.fontSize,
    fontWeight: '600',
  },
  socialButtonsFrame: {
    backgroundColor: defaultTheme.surface.transparent,
    borderColor: defaultTheme.border.default,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 60,
    overflow: 'hidden',
  },
  socialButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.68,
  },
  socialDivider: {
    width: 1,
    backgroundColor: defaultTheme.border.default,
  },
  googleIcon: {
    height: 23,
    width: 23,
  },
  socialButtonText: {
    color: defaultTheme.text.body,
    fontFamily: typography.families.body,
    fontSize: 18,
    fontWeight: '800',
  },
  guestButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: components.button.ghost.borderColor,
    borderRadius: 22,
    marginTop: layout.spacing.xl,
    paddingVertical: 17,
    backgroundColor: defaultTheme.surface.transparent,
  },
  guestButtonText: {
    color: components.button.ghost.textColor,
    fontFamily: typography.families.body,
    fontSize: components.button.ghost.textStyle.fontSize,
    fontWeight: components.button.ghost.textStyle.fontWeight,
    lineHeight: components.button.ghost.textStyle.lineHeight,
  },
  configWarning: {
    color: defaultTheme.text.muted,
    fontFamily: typography.families.body,
    fontSize: typography.textStyles.caption.fontSize,
    lineHeight: 17,
    textAlign: 'center',
  },
  errorText: {
    color: defaultTheme.text.danger,
    fontFamily: typography.families.body,
    fontSize: typography.textStyles.caption.fontSize,
    lineHeight: 17,
    textAlign: 'center',
  },
});
