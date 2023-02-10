import { cold } from 'jasmine-marbles';
import { MockService } from 'ng-mocks';
import { of, shareReplay } from 'rxjs';
import { RuntimeService } from 'src/app/services';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Example, EXAMPLE, ExampleSection } from '../../core';
import { SideNavComponent } from './side-nav.component';

describe('SideNavComponent', () => {
  let component: SideNavComponent;
  let fixture: ComponentFixture<SideNavComponent>;

  let routerSpy: jasmine.SpyObj<Router>;
  let exampleSpies: jasmine.SpyObj<Example>[];

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    exampleSpies = (['error', 'combination', 'combination', 'creation'] as ExampleSection[]).map((section, i) => ({
      ...jasmine.createSpyObj<Example>('Example', ['getInputStreams', 'getCode']),
      section,
      name: `${i}-${section}`,
      links: [{ label: 'label', url: 'url' }],
    }));

    TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        MatListModule,
        NoopAnimationsModule,
      ],
      declarations: [SideNavComponent],
      providers: [
        ...exampleSpies.map((example) => ({ provide: EXAMPLE, useValue: example, multi: true })),
        { provide: Router, useValue: routerSpy },
        {
          provide: RuntimeService,
          useValue: MockService(RuntimeService, {
            orientation$: of('landscape'),
            mediaSize$: of('large'),
          } as Partial<RuntimeService>)
        },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('properties', () => {
    it('should be initialized as expected', () => {
      expect(component.mediaSize$).toBeObservable(cold('(0|)', ['large']));
      expect(component.orientation$).toBeObservable(cold('(0|)', ['landscape']));

      expect(component.groupedExamples).toEqual([
        { section: 'Combine Observables', examples: [exampleSpies[1], exampleSpies[2]] },
        { section: 'Create Observables', examples: [exampleSpies[3]] },
        { section: 'Error Handling', examples: [exampleSpies[0]] },
      ]);
    });
  });

  describe('navigate', () => {
    it('should navigate as expected', () => {
      const lastSelectedRoute$ = component.selectedRoute.pipe(
        shareReplay({ refCount: true, bufferSize: 1 }),
      );

      const sub = lastSelectedRoute$.subscribe();

      component.goToHome();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
      expect(lastSelectedRoute$).toBeObservable(cold('0', ['/']));

      component.goToFAQ();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/faq']);
      expect(lastSelectedRoute$).toBeObservable(cold('0', ['/faq']));

      component.goToExample(exampleSpies[0]);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/0-error']);
      expect(lastSelectedRoute$).toBeObservable(cold('0', ['/0-error']));

      sub.unsubscribe();
    });
  });
});
