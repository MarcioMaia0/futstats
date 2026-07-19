import { RobotoSlab_700Bold } from '@expo-google-fonts/roboto-slab';
import { SedgwickAve_400Regular, useFonts } from '@expo-google-fonts/sedgwick-ave';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { AppBackground } from './components/layout/AppBackground';
import { LoginScreen } from './features/auth/screens/LoginScreen';
import { SignUpScreen } from './features/auth/screens/SignUpScreen';
import { signOutCurrentUser } from './features/auth/services/authService';
import { bootstrapCurrentUser, completeStartPathChoice, getMe } from './features/identity/services/identityService';
import { fetchCurrentUserThemePreference } from './features/identity/services/userPreferencesService';
import { fetchUnreadNotificationsCount } from './features/notifications/services/notificationsService';
import { NotificationsScreen } from './features/notifications/screens/NotificationsScreen';
import { StartPathSelectionPosterScreen } from './features/onboarding/screens/StartPathSelectionPosterScreen';
import { CreateTeamWizardScreen } from './features/teams/screens/CreateTeamWizardScreen';
import { JoinTeamSearchScreen } from './features/teams/screens/JoinTeamSearchScreen';
import { TeamProfileScreen } from './features/teams/screens/TeamProfileScreen';
import { TeamRosterScreen } from './features/teams/screens/TeamRosterScreen';
import { TeamSettingsScreen } from './features/teams/screens/TeamSettingsScreen';
import { fetchFirstManagedTeam, type CreatedTeamResult } from './features/teams/services/teamService';
import { supabase } from './lib/supabase';
import { defaultTheme } from './theme';
import { resolveAppExperienceTheme, type TeamExperienceThemeOverrides, type UserThemePreferenceKey } from './theme/teamExperienceTheme';

type MePayload = {
  person?: {
    id?: string;
  } | null;
};

export function AppRoot() {
  const colorScheme = useColorScheme();
  const [screen, setScreen] = useState<'login' | 'sign-up' | 'start-path' | 'create-team' | 'join-team' | 'team-profile' | 'team-roster' | 'notifications' | 'team-settings'>('login');
  const [activeTeam, setActiveTeam] = useState<CreatedTeamResult['team'] | null>(null);
  const [teamThemeOverrides, setTeamThemeOverrides] = useState<TeamExperienceThemeOverrides | null>(null);
  const [preferredThemeKey, setPreferredThemeKey] = useState<UserThemePreferenceKey | null>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isTemporaryTeamRedirectModalOpen, setIsTemporaryTeamRedirectModalOpen] = useState(false);
  const forcedScreen = getForcedScreenOverride();
  const appExperience = resolveAppExperienceTheme(preferredThemeKey);
  const [fontsLoaded, fontsError] = useFonts({
    RobotoSlab_700Bold,
    SedgwickAve_400Regular,
  });

  useEffect(() => {
    if (forcedScreen === 'login') {
      setActiveTeam(null);
      setTeamThemeOverrides(null);
      setPreferredThemeKey(null);
      setHasUnreadNotifications(false);
      setIsTemporaryTeamRedirectModalOpen(false);
      setScreen('login');
      return;
    }

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
      setTeamThemeOverrides(null);
      setPreferredThemeKey(null);
      setHasUnreadNotifications(false);
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
      return;
    }

    if (choice === 'JOIN_TEAM') {
      setScreen('join-team');
    }
  }

  function handleCreateTeamCreated(result: CreatedTeamResult) {
    setActiveTeam(result.team);
    setTeamThemeOverrides(result.team.theme ?? null);
    setScreen('team-profile');
  }

  function handleTeamThemeOverridesChange(nextOverrides: TeamExperienceThemeOverrides | null) {
    setTeamThemeOverrides(nextOverrides);
    setActiveTeam((current) =>
      current
        ? {
            ...current,
            theme: nextOverrides,
          }
        : current,
    );
  }

  async function handleLogout() {
    try {
      setIsTemporaryTeamRedirectModalOpen(false);
      await signOutCurrentUser();
    } catch (error) {
      console.warn('Could not sign out current user.', error);
    }
  }

  async function refreshUnreadNotifications() {
    try {
      const unreadCount = await fetchUnreadNotificationsCount();
      setHasUnreadNotifications(unreadCount > 0);
    } catch (error) {
      console.warn('Could not refresh unread notifications.', error);
    }
  }

  return (
    <AppBackground baseColor={appExperience.theme.surfaceBase} mode={appExperience.mode}>
      <SafeAreaView style={styles.container}>
        <StatusBar style={appExperience.mode === 'light' ? 'dark' : 'light'} />
        {forcedScreen === 'login' || screen === 'login' ? (
          <LoginScreen onCreateAccountRequested={() => setScreen('sign-up')} onStartPathRequested={() => setScreen('start-path')} />
        ) : screen === 'sign-up' ? (
          <SignUpScreen onBackToLogin={() => setScreen('login')} />
        ) : screen === 'notifications' ? (
          <NotificationsScreen
            hasUnreadNotifications={hasUnreadNotifications}
            onBack={() => setScreen(activeTeam ? 'team-profile' : 'start-path')}
            onOpenAnalyzeJoinRequest={() => undefined}
            onOpenSettings={() => setScreen('team-settings')}
            onProfilePress={handleLogout}
            onReturnHome={() => setScreen(activeTeam ? 'team-profile' : 'start-path')}
            onUnreadNotificationsChange={setHasUnreadNotifications}
            preferredThemeKey={preferredThemeKey}
            team={activeTeam}
            themeOverrides={teamThemeOverrides}
          />
        ) : screen === 'team-settings' && activeTeam ? (
          <TeamSettingsScreen
            initialThemeOverrides={teamThemeOverrides}
            onBack={() => setScreen('team-profile')}
            onTeamSaved={(savedTeam) => {
              setActiveTeam(savedTeam);
              setTeamThemeOverrides(savedTeam.theme ?? null);
            }}
            onThemeOverridesChange={handleTeamThemeOverridesChange}
            preferredThemeKey={preferredThemeKey}
            team={activeTeam}
          />
        ) : screen === 'team-roster' && activeTeam ? (
          <TeamRosterScreen
            hasUnreadNotifications={hasUnreadNotifications}
            onBack={() => setScreen('team-profile')}
            onOpenNotifications={() => setScreen('notifications')}
            onProfilePress={handleLogout}
            preferredThemeKey={preferredThemeKey}
            team={activeTeam}
            themeOverrides={teamThemeOverrides}
          />
        ) : screen === 'team-profile' && activeTeam ? (
          <TeamProfileScreen
            hasUnreadNotifications={hasUnreadNotifications}
            onBack={() => setScreen('start-path')}
            onOpenNotifications={() => setScreen('notifications')}
            onOpenRoster={() => setScreen('team-roster')}
            onOpenSettings={() => setScreen('team-settings')}
            onProfilePress={handleLogout}
            preferredThemeKey={preferredThemeKey}
            team={activeTeam}
            themeOverrides={teamThemeOverrides}
          />
        ) : screen === 'create-team' ? (
          <CreateTeamWizardScreen onBack={() => setScreen('start-path')} onCreated={handleCreateTeamCreated} />
        ) : screen === 'join-team' ? (
          <JoinTeamSearchScreen
            onBack={() => setScreen('start-path')}
            onReturnHome={() => setScreen('start-path')}
            preferredThemeKey={preferredThemeKey}
          />
        ) : (
          <StartPathSelectionPosterScreen onBack={() => setScreen('login')} onChoice={handleStartPathChoice} />
        )}
        {isTemporaryTeamRedirectModalOpen && activeTeam ? (
          <View style={styles.temporaryModalOverlay}>
            <View style={styles.temporaryModalCard}>
              <Text style={styles.temporaryModalTitle}>Aviso temporário</Text>
              <Text style={styles.temporaryModalText}>
                A home principal ainda não foi criada. Por enquanto, após identificar seu login, o app vai abrir uma tela de time para confirmar os testes. Esse desvio deve ser removido quando a home ficar pronta.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setIsTemporaryTeamRedirectModalOpen(false);
                  setScreen('team-profile');
                }}
                style={styles.temporaryModalButton}
              >
                <Text style={styles.temporaryModalButtonText}>Ir para tela de time</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </AppBackground>
  );

  async function hydrateScreenAfterLogin(isMounted: boolean) {
    const existingTeam = await tryLoadExistingTeam();

    if (!isMounted) {
      return;
    }

    if (existingTeam) {
      const userThemePreference = await tryLoadUserThemePreference();
      await refreshUnreadNotifications();
      setActiveTeam(existingTeam);
      setTeamThemeOverrides(existingTeam.theme ?? null);
      setPreferredThemeKey(userThemePreference?.preferredThemeKey ?? null);

      if (forcedScreen === 'team') {
        setIsTemporaryTeamRedirectModalOpen(false);
        setScreen('team-profile');
        return;
      }

      if (forcedScreen === 'team-settings') {
        setIsTemporaryTeamRedirectModalOpen(false);
        setScreen('team-settings');
        return;
      }

      if (forcedScreen === 'notifications') {
        setIsTemporaryTeamRedirectModalOpen(false);
        setScreen('notifications');
        return;
      }

      if (forcedScreen === 'join-team') {
        setIsTemporaryTeamRedirectModalOpen(false);
        setScreen('join-team');
        return;
      }

      setIsTemporaryTeamRedirectModalOpen(true);
      setScreen('start-path');
      return;
    }

    const userThemePreference = await tryLoadUserThemePreference();
    await refreshUnreadNotifications();
    setActiveTeam(null);
    setTeamThemeOverrides(null);
    setPreferredThemeKey(userThemePreference?.preferredThemeKey ?? null);
    setIsTemporaryTeamRedirectModalOpen(false);

    if (forcedScreen === 'join-team') {
      setScreen('join-team');
      return;
    }

    setScreen('start-path');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  temporaryModalButton: {
    alignItems: 'center',
    backgroundColor: defaultTheme.color.primary,
    borderRadius: 18,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  temporaryModalButtonText: {
    color: '#1E1E1E',
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 24,
  },
  temporaryModalCard: {
    backgroundColor: '#242424',
    borderColor: defaultTheme.border.default,
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
    maxWidth: 360,
    padding: 18,
    width: '92%',
  },
  temporaryModalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  temporaryModalText: {
    color: defaultTheme.text.body,
    fontSize: 15,
    lineHeight: 22,
  },
  temporaryModalTitle: {
    color: defaultTheme.color.primary,
    fontFamily: 'RobotoSlab_700Bold',
    fontSize: 28,
    lineHeight: 32,
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

async function tryLoadUserThemePreference() {
  try {
    return await fetchCurrentUserThemePreference();
  } catch (error) {
    console.warn('Could not load user theme preference.', error);
    return null;
  }
}

function getForcedScreenOverride() {
  if (typeof window === 'undefined') {
    return null;
  }

  const url = new URL(window.location.href);
  const screen = url.searchParams.get('screen');

  if (screen === 'login') {
    return 'login';
  }

  if (screen === 'team') {
    return 'team';
  }

  if (screen === 'team-settings') {
    return 'team-settings';
  }

  if (screen === 'notifications') {
    return 'notifications';
  }

  if (screen === 'join-team') {
    return 'join-team';
  }

  return null;
}
