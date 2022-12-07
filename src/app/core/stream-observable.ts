import { Observable, SchedulerLike, Subscriber, Subscription } from 'rxjs';
import { LoggerService } from '../services';
import { observeNotification } from './helpers';
import { FrameNotification } from './types';

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

    this._logger = logger
    this._scheduler = scheduler;
  }

  scheduleMessages(subscriber: Subscriber<T>) {
    for (const message of this.messages) {
      subscriber.add(
        this._scheduler.schedule(
          (state) => {
            const { message: { notification }, subscriber: destination } = state!;
            observeNotification(notification, destination);
          },
          message.frame,
          { message, subscriber }
        )
      );
    }
  }
}
