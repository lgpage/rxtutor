import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareButtonComponent } from './share-button.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from "@angular/cdk/clipboard";
import { BehaviorSubject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { MockModule } from "ng-mocks";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from "@angular/material/button";
import { Router } from "@angular/router";

describe('ShareButtonComponent', () => {
  let component: ShareButtonComponent;
  let fixture: ComponentFixture<ShareButtonComponent>;
  let clipboardSvc: jasmine.SpyObj<Clipboard>;
  let snackBarSvc: jasmine.SpyObj<MatSnackBar>;
  let routerSvc: jasmine.SpyObj<Router>;
  let urlSubject$: BehaviorSubject<string>;

  beforeEach(async () => {
    clipboardSvc = jasmine.createSpyObj<Clipboard>('Clipboard', ['copy']);
    snackBarSvc = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    routerSvc = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    urlSubject$ = new BehaviorSubject<string>('/url-path?query=string');

    await TestBed.configureTestingModule({
      imports: [
        MockModule(MatIconModule),
        MockModule(MatButtonModule),
      ],
      providers: [
        { provide: Clipboard, useValue: clipboardSvc },
        { provide: MatSnackBar, useValue: snackBarSvc },
        { provide: Router, useValue: routerSvc },
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
    beforeEach(() => {
      component.copyToClipboard();
    });

    it('should copy the full URL to the clipboard', () => {
      const document = TestBed.inject(DOCUMENT);
      const currentOrigin = document.location.origin;

      expect(clipboardSvc.copy).toHaveBeenCalledWith(`${currentOrigin}/url-path?query=string`);
    });

    it('should display snackbar message', () => {
      expect(snackBarSvc.open).toHaveBeenCalledWith(
        'Current example URL copied to clipboard',
        'Ok',
        { duration: 3000 },
      );
    });

    it('should navigate to the initial URL', () => {
      expect(routerSvc.navigateByUrl).toHaveBeenCalledWith('/url-path?query=string');
    });
  });
});
