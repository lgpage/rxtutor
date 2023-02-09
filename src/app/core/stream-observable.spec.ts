import { PartialObserver, SchedulerAction, SchedulerLike, Subscriber, Subscription } from 'rxjs';
import { LoggerService } from '../logger.service';
import { StreamObservable } from './stream-observable';
import { FrameNotification, Notification } from './types';

class StreamObservableExposed<T = unknown> extends StreamObservable<T> {
  _logger: LoggerService | undefined;
  _scheduler!: SchedulerLike;

  observeNotification(notification: Notification<T>, observer: PartialObserver<T>): void {
    return super.observeNotification(notification, observer);
  }
}

describe('StreamObservable', () => {
  let message: FrameNotification;
  let schedulerSpy: jasmine.SpyObj<SchedulerLike>;
  let loggerSpy: jasmine.SpyObj<LoggerService>;

  let exposed$: StreamObservableExposed;
  let stream$: StreamObservable<unknown>;

  beforeEach(() => {
    message = { frame: 1, notification: { kind: 'N', value: 'A', symbol: 'a' } };

    schedulerSpy = jasmine.createSpyObj<SchedulerLike>('SchedulerLike', ['schedule']);
    loggerSpy = jasmine.createSpyObj<LoggerService>('LoggerService', ['logDebug']);

    exposed$ = new StreamObservableExposed([message], schedulerSpy, loggerSpy);
    stream$ = exposed$;
  });

  it('should be created', () => {
    expect(stream$).toBeTruthy();
    expect(exposed$._scheduler).toBe(schedulerSpy);
    expect(exposed$._logger).toBe(loggerSpy);
  });

  describe('scheduleMessages', () => {
    let subscriberSpy: jasmine.SpyObj<Subscriber<unknown>>;

    beforeEach(() => {
      subscriberSpy = jasmine.createSpyObj<Subscriber<unknown>>('Subscriber', ['add']);
    });

    it('should call expected methods', () => {
      const subscription = new Subscription();
      const observeNotificationSpy = spyOn(exposed$, 'observeNotification');

      schedulerSpy.schedule.and.callFake((work) => {
        work.bind({} as SchedulerAction<unknown>)({ message, subscriber: subscriberSpy } as any);

        expect(observeNotificationSpy).toHaveBeenCalledWith(message.notification, subscriberSpy);

        return subscription;
      });

      // Act
      stream$.scheduleMessages(subscriberSpy);

      const arg = { message, subscriber: subscriberSpy };
      expect(schedulerSpy.schedule).toHaveBeenCalledWith(jasmine.any(Function), 1, arg);

      expect(subscriberSpy.add).toHaveBeenCalledWith(subscription);
    });
  });
});
