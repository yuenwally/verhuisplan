import { LiveList, LiveObject } from '@liveblocks/client';
import { SEED_DELIVERIES, SEEDED_USERS } from '@/lib/plan-config';
import type {
  ActivityEntry,
  Comment,
  Cost,
  Delivery,
  KnownUser,
  PhaseId,
  Question,
  Task,
} from '@/lib/types';

type SeedTask = [phase: PhaseId, title: string, who: string[]];

const BOTH = ['Wally', 'WJ'];

const SEED_TASKS: readonly SeedTask[] = [
  [1, 'Zwager contacteren over mankracht (spuiten, badkamer, sloop)', ['Wally']],
  [1, 'Kostenindicatie opvragen bij zwager/gasten', ['Wally']],
  [1, 'Vragen of zwager weekendmensen kan leveren', ['Wally']],
  [2, 'Alles inpakken in dozen (begin nu)', ['Wally']],
  [2, 'Spullen wegdoen/weggeven die niet mee hoeven', ['Wally']],
  [2, 'Vanaf 15 juli: dozen naar de nieuwe opslag brengen', ['Wally']],
  [2, 'Samen zoveel mogelijk verhuizen met de kar/aanhanger', BOTH],
  [2, 'Huis zo leeg mogelijk maken vóór het spuiten', ['Wally']],
  [3, 'Weekend/moment prikken voor afplakken + spuiten', BOTH],
  [3, 'Keuken verwijderen vóór het spuiten', []],
  [3, 'Douchecabine verwijderen', []],
  [3, 'Afplakken en spuiten (schilderwerk)', []],
  [3, 'Tijdelijke kookplek inrichten', ['WJ']],
  [3, 'Sloopwerk: afvoer regelen (waar gaat het puin heen?)', []],
  [3, 'Op basis van prijs beslissen: zelf doen vs. uitbesteden', BOTH],
  [4, 'Samen keuken uitzoeken', BOTH],
  [4, 'Samen douchecabine uitzoeken (WJ zoekt cabine incl. wanden)', BOTH],
  [4, 'Kurk-ontwerpje maken voor prijsindicatie', ['WJ']],
  [4, 'Onderverdieping tot washok maken (aan aannemer vragen)', []],
  [4, 'Onderzoek: stille airco/warmtepomp (evt. balkon)', ['WJ']],
  [5, 'Kostenindicaties verzamelen (mankracht, keuken, badkamer, airco)', BOTH],
  [5, 'Samen bepalen hoe we de kosten verdelen/betalen', BOTH],
] as const;

const SEED_QUESTIONS: readonly string[] = [
  'Mag er door de muur naar buiten voor een afzuigkap?',
  'Kan de onderverdieping een washok worden?',
  'Wat kost het sloopwerk, en waar kan de afvoer heen?',
  'Prijsindicatie voor spuiten en badkamer?',
] as const;

const SEED_COSTS: readonly string[] = [
  'Mankracht / spuiten',
  'Keuken',
  'Badkamer / douchecabine',
  'Airco / warmtepomp',
  'Sloop & afvoer',
] as const;

/**
 * The room's contents on first connect. Liveblocks applies this only when the
 * room has no storage yet, so it is safe to keep calling on every mount.
 */
export function initialStorage() {
  return {
    tasks: new LiveList(
      SEED_TASKS.map(([phase, title, who], index) => new LiveObject<Task>({
        id: `t${index + 1}`,
        phase,
        title,
        // A fresh array per task: BOTH is shared, and storage must not alias it.
        who: [...who],
        deadline: '',
        done: false,
        doneBy: '',
      })),
    ),
    questions: new LiveList(
      SEED_QUESTIONS.map((text, index) => new LiveObject<Question>({
        id: `q${index + 1}`,
        text,
        done: false,
      })),
    ),
    costs: new LiveList(
      SEED_COSTS.map((label, index) => new LiveObject<Cost>({
        id: `c${index + 1}`,
        label,
        amount: '',
      })),
    ),
    activity: new LiveList<LiveObject<ActivityEntry>>([]),
    users: new LiveList(SEEDED_USERS.map((user) => new LiveObject<KnownUser>({ ...user }))),
    deliveries: seedDeliveries(),
    comments: new LiveList<LiveObject<Comment>>([]),
  };
}

/** Also used by the migration, for rooms created before deliveries existed. */
export function seedDeliveries() {
  return new LiveList(
    SEED_DELIVERIES.map((delivery, index) => new LiveObject<Delivery>({
      id: `d${index + 1}`,
      ...delivery,
    })),
  );
}
