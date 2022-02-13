import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Example, EXAMPLE, ExampleSection } from '../examples/interface';
import { Stream } from '../stream';
import { SideNavComponent } from './side-nav.component';

class MockExample implements Example {
  name = 'MockExample';
  section: ExampleSection = 'combination';

  getSources: () => Stream[];
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
