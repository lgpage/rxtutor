import { cold } from 'jasmine-marbles';
import { of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { RuntimeService } from './runtime.service';

describe('RuntimeService', () => {
  let service: RuntimeService;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(() => {
    breakpointObserverSpy = jasmine.createSpyObj<BreakpointObserver>('BreakpointObserver', ['observe']);

    breakpointObserverSpy.observe
      .withArgs('(max-width: 799px)').and.returnValue(of({ matches: false, breakpoints: {} }))
      .withArgs('(orientation: landscape)').and.returnValue(of({ matches: true, breakpoints: {} }))
      .withArgs('(max-width: 1023px)').and.returnValue(of({ matches: false, breakpoints: {} }))
      .withArgs('(prefers-color-scheme: dark)').and.returnValue(of({ matches: true, breakpoints: {} }));

    TestBed.configureTestingModule({
      providers: [
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
      ]
    });

    service = TestBed.inject(RuntimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have expected observables', () => {
    expect(service.systemColorScheme$).toBeObservable(cold('(0|)', ['dark']));

    expect(service.layoutMatch$).toBeObservable(cold('(0|)', [{
      mediaSize: 'large',
      orientation: 'landscape',
      exampleSize: 'large',
    }]));

    expect(service.exampleSize$).toBeObservable(cold('(0|)', ['large']));
    expect(service.mediaSize$).toBeObservable(cold('(0|)', ['large']));
    expect(service.orientation$).toBeObservable(cold('(0|)', ['landscape']));
  });
});
