'use client';

import { useUpdateMyPresence } from '@liveblocks/react/suspense';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { KeyboardEvent } from 'react';

type AddInputProps = {
  placeholder: string;
  onSubmit: (value: string) => void;
  /** When set, keystrokes are published as presence so others see a ghost row. */
  typingPhase?: number;
  buttonLabel?: string;
  className?: string;
  inputClassName?: string;
};

export function AddInput({
  placeholder,
  onSubmit,
  typingPhase,
  buttonLabel,
  className,
  inputClassName,
}: AddInputProps) {
  const [value, setValue] = useState('');
  const updateMyPresence = useUpdateMyPresence();

  const publishTyping = (text: string) => {
    if (typingPhase === undefined) {
      return;
    }

    updateMyPresence({
      typingPhase: text ? typingPhase : null,
      typingText: text,
    });
  };

  const submit = () => {
    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    onSubmit(trimmed);
    setValue('');
    publishTyping('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      submit();
    }
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          setValue(event.target.value);
          publishTyping(event.target.value);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => publishTyping('')}
        className={cn(
          `min-w-0 flex-1 rounded-[10px] border-2 border-dashed border-[#D8C6A0] bg-transparent
          px-3 py-2.5 text-sm font-semibold text-foreground transition-colors outline-none
          focus:border-primary/60`,
          inputClassName,
        )}
      />
      {buttonLabel ? (
        <Button
          type="button"
          onClick={submit}
          className="h-auto cursor-pointer rounded-[10px] px-4 py-2.5 text-sm font-extrabold"
        >
          {buttonLabel}
        </Button>
      ) : null}
    </div>
  );
}
