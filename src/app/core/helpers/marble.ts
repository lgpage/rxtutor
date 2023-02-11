import { FrameNotification, NotificationType } from '../types';
import { createCompleteNotification, createErrorNotification, createNextNotification } from './notification';

// Code adapted from https://github.com/ReactiveX/rxjs/tree/master/src/internal/testing

interface MarbleNotification<T = any> {
  nextFrame: number;
  notification?: NotificationType<T>;
  nextIndex?: number;
  grouped?: boolean;
}

interface MarbleTimeProgression {
  advanceIndexBy: number;
  advanceFrameBy: number;
}

const getMarbleValue = (values: any, key: string): any | undefined => {
  if (!values) {
    return key;
  }

  if (typeof values === 'number' || typeof values === 'string' || typeof values === 'boolean') {
    return values;
  }

  if (typeof values !== 'object') {
    return key;
  }

  if (values[key]?.messages) {
    return values[key].messages;
  }

  return values[key] ?? key;
};

const getNextMarbleFrame = (frame: number, advanceBy: number, frameSize: number, grouped?: boolean): number => {
  return grouped ? frame : (advanceBy * frameSize) + frame;
};

const getMarbleTimeProgression = (marbles: string[], index: number, frameSize: number): MarbleTimeProgression | null => {
  if (!marbles[index].match(/^[0-9]$/)) {
    return null;
  }

  if (index !== 0 && marbles[index - 1] !== ' ') {
    return null;
  }

  const buffer = marbles.slice(index).join('');
  const match = buffer.match(/^([0-9]+(?:\.[0-9]+)?)(ms|s|m) /);

  if (!match) {
    return null;
  }

  let duration = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'm':
      duration *= (1000 * 60);
      break;

    case 's':
      duration *= 1000;
      break;

    case 'ms':
    default:
      break;
  }

  return {
    advanceIndexBy: match[0].length - 1,
    advanceFrameBy: (duration / frameSize),
  };
};

const getMarbleNotification = (
  marbles: string[],
  index: number,
  frame: number,
  frameSize: number,
  grouped?: boolean,
  values?: any,
  errorValue?: unknown,
): MarbleNotification => {
  const marble = marbles[index];
  const getNextFrame = (advanceBy: number): number => getNextMarbleFrame(frame, advanceBy, frameSize, grouped);

  switch (marble) {
    case ' ':
      return { nextFrame: getNextFrame(0) };

    case '-':
      return { nextFrame: getNextFrame(1) };

    case '(':
      grouped = true;
      return { nextFrame: getNextFrame(1), grouped: true };

    case ')':
      grouped = true;
      return { nextFrame: getNextFrame(1), grouped: false };

    case '|':
      return { nextFrame: getNextFrame(1), notification: createCompleteNotification() };

    case '#':
      return { nextFrame: getNextFrame(1), notification: createErrorNotification(errorValue) };

    case '^':
      return { nextFrame: getNextFrame(1) };

    default: {
      const notification = createNextNotification(getMarbleValue(values, marble));
      const timeProgression = getMarbleTimeProgression(marbles, index, frameSize);

      if (!timeProgression) {
        return { nextFrame: getNextFrame(1), notification };
      }

      return {
        nextFrame: getNextFrame(timeProgression.advanceFrameBy),
        nextIndex: index + timeProgression.advanceIndexBy,
      };
    }
  }
};

export const getMarbleNotifications = (
  marbles: string,
  values?: any,
  errorValue?: unknown,
  frameSize = 10,
): FrameNotification[] => {
  const characters = [...marbles];
  const notifications: FrameNotification[] = [];

  let frame = 0;
  let grouped: boolean | undefined;

  for (let index = 0; index < characters.length; index++) {
    const result = getMarbleNotification(characters, index, frame, frameSize, grouped, values, errorValue);
    if (result?.notification) {
      notifications.push({ frame, notification: result.notification });
    }

    index = result.nextIndex ?? index;
    frame = result.nextFrame;
    grouped = result.grouped;
  }

  return notifications;
};
