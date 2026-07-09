'use client';

import { useState } from 'react';
import { ConfettiProvider } from '@/components/confetti-provider';
import { FlashProvider } from '@/components/flash-provider';
import { LoginScreen } from '@/components/login-screen';
import { Planner } from '@/components/planner';
import { MissingKeyNotice, Room } from '@/components/room';
import { useCurrentUser } from '@/hooks/use-current-user';

export function App({ configured }: { configured: boolean }) {
  const { user, knownUsers, login, logout } = useCurrentUser();
  // Only a fresh login announces itself in the activity feed; a reload stays quiet.
  const [announce, setAnnounce] = useState(false);

  if (!configured) {
    return <MissingKeyNotice />;
  }

  if (!user) {
    return (
      <LoginScreen
        knownUsers={knownUsers}
        onLogin={(name) => {
          setAnnounce(true);
          login(name);
        }}
      />
    );
  }

  return (
    <Room name={user.name}>
      <FlashProvider>
        <ConfettiProvider>
          <Planner
            user={user}
            announce={announce}
            onLogout={() => {
              setAnnounce(false);
              logout();
            }}
          />
        </ConfettiProvider>
      </FlashProvider>
    </Room>
  );
}
