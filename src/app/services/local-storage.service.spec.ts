import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';

@Injectable()
class LocalStorageServiceExposed extends LocalStorageService {
  storageMock = jasmine.createSpyObj<Storage>('Storage', ['getItem', 'setItem', 'removeItem', 'clear']);

  get _storage(): Storage {
    return this.storageMock;
  }
}

describe('LocalStorageService', () => {
  let exposed: LocalStorageServiceExposed;
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalStorageServiceExposed],
    });

    exposed = TestBed.inject(LocalStorageServiceExposed);
    service = exposed;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should wrap local storage', () => {
    service.clear();
    expect(exposed.storageMock.clear).toHaveBeenCalled();

    service.getValue('key');
    expect(exposed.storageMock.getItem).toHaveBeenCalledWith('key');

    service.removeEntry('key');
    expect(exposed.storageMock.removeItem).toHaveBeenCalledWith('key');

    service.saveValue('key', 'value');
    expect(exposed.storageMock.setItem).toHaveBeenCalledWith('key', 'value');
  });
});
