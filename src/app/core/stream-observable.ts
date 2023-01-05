import { Observable, PartialObserver, SchedulerLike, Subscriber, Subscription } from 'rxjs';
import { LoggerService } from '../logger.service';
import { observeNotification } from './helpers';
import { FrameNotification, Notification } from './types';

// Code adapted from https://github.com/ReactiveX/rxjs/tree/master/src/internal/testing

export class StreamObservable<T> extends Observable<T> {
  protected _name = 'StreamObservable';
  protected _logger: LoggerService | undefined;
  protected _scheduler: SchedulerLike;

  constructor(
    public messages: FrameNotification[],
    scheduler: SchedulerLike,
    logger?: LoggerService,
  ) {
    // eslint-disable-next-line rxjs/finnish
    super(function (this: Observable<T>, subscriber: Subscriber<T>) {
      const observable$ = this as StreamObservable<T>;
      const subscription = new Subscription();

      observable$.scheduleMessages(subscriber);
      return subscription;
    });

    this._logger = logger;
    this._scheduler = scheduler;
  }

  protected observeNotification(notification: Notification<T>, observer: PartialObserver<T>): void {
    observeNotification(notification, observer);
  }

  scheduleMessages(subscriber: Subscriber<T>): void {
    for (const message of this.messages) {
      subscriber.add(
        this._scheduler.schedule(
          (state) => {
            const { message: { notification }, subscriber: destination } = state!;
            this.observeNotification(notification, destination);
          },
          message.frame,
          { message, subscriber }
        )
      );
    }
  }
}
