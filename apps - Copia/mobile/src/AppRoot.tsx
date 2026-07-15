import { RobotoSlab_700Bold } from '@expo-google-fonts/roboto-slab';
import { SedgwickAve_400Regular, useFonts } from '@expo-google-fonts/sedgwick-ave';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { AppBackground } from './components/layout/AppBackground';
import { LoginScreen } from './features/auth/screens/LoginScreen';
import { bootstrapCurrentUser, completeStartPathChoice, getMe } from './features/identity/services/identityService';
import { StartPathSelectionPosterScreen } from './features/onboarding/screens/StartPathSelectionPosterScreen';
import { CreateTeamWizardScreen } from './features/teams/screens/CreateTeamWizardScreen';
import { TeamProfileScreen } from './features/teams/screens/TeamProfileScreen';
import { fetchFirstManagedTeam, type CreatedTeamResult } from './features/teams/services/teamService';
import { supabase } from './lib/supabase';
import { components, defaultTheme, layout, typography } from './theme';

type MePayload = {
  person?: {
    id?: string;
  } | null;
};

export function AppRoot() {
  const colorScheme = useColorScheme();
  const [screen, setScreen] = useState<'login' | 'start-path' | 'create-team' | 'team-profile'>('login');
  const [activeTeam, setActiveTeam] = useState<CreatedTeamResult['team'] | null>(null);
  const [isTemporaryTeamRedirectModalOpen, setIsTemporaryTeamRedirectModalOpen] = useState(false);
  const [fontsLoaded, fontsError] = useFonts({
    RobotoSlab_700Bold,
    SedgwickAve_400Regular,
  });

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (isMounted && data.session) {
        await tryBootstrapCurrentUser();
        await hydrateScreenAfterLogin(isMounted);
      }
    });

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await tryBootstrapCurrentUser();
        await hydrateScreenAfterLogin(isMounted);
        return;
      }

      setActiveTeam(null);
      setIsTemporaryTeamRedirectModalOpen(false);
      setScreen('login');
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (fontsError) {
      console.warn('Custom fonts could not be loaded. Falling back to system fonts.', fontsError);
    }
  }, [fontsError]);

  async function handleStartPathChoice(choice: 'CREATE_TEAM' | 'JOIN_TEAM' | 'EXPLORE') {
    try {
      await completeStartPathChoice(choice);
    } catch (error) {
      console.warn('Could not save start path choice.', error);
    }

    if (choice === 'CREATE_TEAM') {
      setScreen('create-team');
    }
  }

  function handleCreateTeamCreated(result: CreatedTeamResult) {
    setActiveTeam(result.team);
    setScreen('team-profile');
  }

  function handleTemporaryTeamRedirectConfirm() {
    setIsTemporaryTeamRedirectModalOpen(false);
    setScreen(activeTeam ? 'team-profile' : 'start-path');
  }

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar style={colorScheme === 'light' ? 'dark' : 'light'} />
        {screen === 'login' ? (
          <LoginScreen onStartPathRequested={() => setScreen('start-path')} />
        ) : screen === 'team-profile' && activeTeam ? (
          <TeamProfileScreen onBack={() => setScreen('start-path')} team={activeTeam} />
        ) : screen === 'create-team' ? (
          <CreateTeamWizardScreen onBack={() => setScreen('start-path')} onCreated={handleCreateTeamCreated} />
        ) : (
          <StartPathSelectionPosterScreen onBack={() => setScreen('login')} onChoice={handleStartPathChoice} />
        )}
      </SafeAreaView>

      <Modal
        animationType="fade"
        onRequestClose={handleTemporaryTeamRedirectConfirm}
        transparent
        visible={isTemporaryTeamRedirectModalOpen}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Aviso temporario</Text>
            <Text style={styles.modalBody}>
              A home principal ainda nao foi criada. Por enquanto, apos identificar seu login, o app vai abrir uma
              tela de time para continuar os testes. Esse desvio deve ser removido quando a home ficar pronta.
            </Text>
            <Pressable accessibilityRole="button" onPress={handleTemporaryTeamRedirectConfirm} style={styles.modalPrimaryButton}>
              <Text style={styles.modalPrimaryButtonText}>Ir para tela de time</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </AppBackground>
  );

  async function hydrateScreenAfterLogin(isMounted: boolean) {
    const existingTeam = await tryLoadExistingTeam();

    if (!isMounted) {
      return;
    }

    if (existingTeam) {
      setActiveTeam(existingTeam);
      setScreen('start-path');
      setIsTemporaryTeamRedirectModalOpen(true);
      return;
    }

    setActiveTeam(null);
    setIsTemporaryTeamRedirectModalOpen(false);
    setScreen('start-path');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.shell.pagePaddingHorizontal,
  },
  modalBody: {
    color: defaultTheme.text.body,
    fontSize: typography.textStyles.body.fontSize,
    lineHeight: typography.textStyles.body.lineHeight,
  },
  modalCard: {
    backgroundColor: defaultTheme.surface.card,
    borderColor: defaultTheme.border.default,
    borderRadius: layout.radius['2xl'],
    borderWidth: 1,
    gap: 18,
    maxWidth: 420,
    padding: 24,
    width: '100%',
  },
  modalPrimaryButton: {
    alignItems: 'center',
    backgroundColor: defaultTheme.surface.primaryAction,
    borderRadius: layout.radius.lg,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 18,
  },
  modalPrimaryButtonText: {
    color: components.button.primary.textColor,
    fontSize: components.button.primary.textStyle.fontSize,
    fontWeight: components.button.primary.textStyle.fontWeight,
    lineHeight: components.button.primary.textStyle.lineHeight,
  },
  modalTitle: {
    color: defaultTheme.text.accent,
    fontFamily: typography.families.brandDisplayAlt,
    fontSize: typography.textStyles.headingLg.fontSize,
    fontWeight: typography.textStyles.headingLg.fontWeight,
    lineHeight: typography.textStyles.headingLg.lineHeight,
  },
});

async function tryBootstrapCurrentUser() {
  try {
    await bootstrapCurrentUser();
  } catch (error) {
    console.warn('Could not bootstrap current user.', error);
  }
}

async function tryLoadExistingTeam() {
  try {
    const me = (await getMe()) as MePayload;
    const personId = me.person?.id;

    if (!personId) {
      return null;
    }

    return await fetchFirstManagedTeam(personId);
  } catch (error) {
    console.warn('Could not load existing team for temporary redirect.', error);
    return null;
  }
}
