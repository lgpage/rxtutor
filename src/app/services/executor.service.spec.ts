import { MockService } from 'ng-mocks';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExecutorService } from './executor.service';

describe('ExecutorService', () => {
  let service: ExecutorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MatSnackBar, useValue: MockService(MatSnackBar) },
      ]
    });

    service = TestBed.inject(ExecutorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
