'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { KnownUser } from '@/lib/types';

type LoginScreenProps = {
  knownUsers: readonly KnownUser[];
  onLogin: (name: string) => void;
};

export function LoginScreen({ knownUsers, onLogin }: LoginScreenProps) {
  const [name, setName] = useState('');

  return (
    <div className="bg-cardboard flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-[420px] max-w-full rounded-[14px] border-2 border-[#C9AE7C]
          bg-[#E7D3AC] px-9 pt-11 pb-9 shadow-[0_18px_40px_rgba(90,70,40,0.18)]"
      >
        <div
          aria-hidden
          className="absolute -top-3.5 left-1/2 h-[30px] w-[150px] -translate-x-1/2 -rotate-3
            bg-accent/85 shadow-[0_2px_4px_rgba(0,0,0,0.08)]"
        />
        <h1 className="mb-1.5 font-hand text-[44px] leading-none font-bold">Verhuisplan 📦</h1>
        <p className="mb-6 text-[15px] text-secondary-foreground">
          Het gedeelde werkdocument van Wally &amp; WJ — maar dan leuk.
        </p>

        <label
          htmlFor="login-name"
          className="mb-2 block text-sm font-extrabold tracking-[0.08em] text-secondary-foreground
            uppercase"
        >
          Wie ben je?
        </label>
        <div className="flex gap-2.5">
          <input
            id="login-name"
            value={name}
            autoFocus
            placeholder="Typ je naam…"
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && onLogin(name)}
            className="min-w-0 flex-1 rounded-[10px] border-2 border-border-strong bg-card px-4
              py-3 text-[17px] font-bold text-foreground outline-none"
          />
          <Button
            onClick={() => onLogin(name)}
            className="h-auto rounded-[10px] bg-foreground px-5 py-3 text-base font-extrabold
              text-background hover:bg-foreground/90"
          >
            Start →
          </Button>
        </div>

        <p className="mt-3 text-[13px] text-[#8A785C]">
          Wally krijgt een 🦆, Willem Jan een 🐵. Iedereen mag meedoen.
        </p>

        {knownUsers.length > 0 ? (
          <div className="mt-4.5 flex flex-wrap gap-2">
            {knownUsers.map((user) => (
              <button
                key={user.name}
                type="button"
                onClick={() => onLogin(user.name)}
                className="flex cursor-pointer items-center gap-[7px] rounded-full border-2
                  border-[#C9AE7C] bg-card px-3.5 py-2 text-[15px] font-bold text-foreground
                  transition-transform hover:-translate-y-0.5"
              >
                <span className="text-lg">{user.avatar}</span>
                {user.name}
              </button>
            ))}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
