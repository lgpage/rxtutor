import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareButtonComponent } from './share-button.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from "@angular/cdk/clipboard";
import { BehaviorSubject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { MockModule } from "ng-mocks";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from "@angular/material/button";

describe('ShareButtonComponent', () => {
  let component: ShareButtonComponent;
  let fixture: ComponentFixture<ShareButtonComponent>;
  let clipboardSvc: jasmine.SpyObj<Clipboard>;
  let snackBarSvc: jasmine.SpyObj<MatSnackBar>;
  let urlSubject$: BehaviorSubject<string>;

  beforeEach(async () => {
    clipboardSvc = jasmine.createSpyObj<Clipboard>('Clipboard', ['copy']);
    snackBarSvc = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    urlSubject$ = new BehaviorSubject<string>('/url-path?query=string');

    await TestBed.configureTestingModule({
      imports: [
        MockModule(MatIconModule),
        MockModule(MatButtonModule),
      ],
      providers: [
        { provide: Clipboard, useValue: clipboardSvc },
        { provide: MatSnackBar, useValue: snackBarSvc },
      ],
      declarations: [ ShareButtonComponent ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareButtonComponent);
    component = fixture.componentInstance;
    component.url$ = urlSubject$.asObservable();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('copyToClipboard', () => {
    it('should copy the full URL to the clipboard', () => {
      const document = TestBed.inject(DOCUMENT);
      const currentOrigin = document.location.origin;

      component.copyToClipboard();

      expect(clipboardSvc.copy).toHaveBeenCalledWith(`${currentOrigin}/url-path?query=string`);
      expect(snackBarSvc.open).toHaveBeenCalledWith(
        'Copied URL for current example to clipboard',
        'Close',
        { duration: 3000 },
      );
    });
  });
});
