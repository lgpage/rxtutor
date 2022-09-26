import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InputStream } from '../../core';
import { Example, EXAMPLE, ExampleSection, START_EXAMPLE } from '../../types';
import { SideNavComponent } from './side-nav.component';

class MockExample implements Example {
  name = 'MockExample';
  section: ExampleSection = 'combination';

  getSources: () => InputStream[];
  getCode: () => string;
}

describe('SideNavComponent', () => {
  let component: SideNavComponent;
  let fixture: ComponentFixture<SideNavComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        NoopAnimationsModule,
      ],
      declarations: [SideNavComponent],
      providers: [
        { provide: START_EXAMPLE, useClass: MockExample, multi: true },
        { provide: EXAMPLE, useClass: MockExample, multi: true },
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
});