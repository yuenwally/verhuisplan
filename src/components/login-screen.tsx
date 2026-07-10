'use client';

import { motion } from 'motion/react';
import { AvatarGlyph } from '@/components/avatar-glyph';
import type { KnownUser } from '@/lib/types';

type LoginScreenProps = {
  knownUsers: readonly KnownUser[];
  onLogin: (name: string) => void;
};

export function LoginScreen({ knownUsers, onLogin }: LoginScreenProps) {
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
          Het gedeelde werkdocument van Wally, WJ &amp; Joyce. Maar dan leuk.
        </p>

        <p
          className="mb-3 text-sm font-extrabold tracking-[0.08em] text-secondary-foreground
            uppercase"
        >
          Wie ben je?
        </p>

        <div className="flex flex-wrap gap-2.5">
          {knownUsers.map((user) => (
            <button
              key={user.name}
              type="button"
              onClick={() => onLogin(user.name)}
              className="flex cursor-pointer items-center gap-2 rounded-[10px] border-2
                border-border-strong bg-card px-4 py-3 text-[17px] font-bold text-foreground
                transition-transform hover:-translate-y-0.5"
            >
              <AvatarGlyph avatar={user.avatar} className="size-[22px] text-[20px]" />
              {user.name}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
