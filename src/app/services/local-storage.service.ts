import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  protected get _storage(): Storage {
    return localStorage;
  }

  public getValue(key: string, defaultValue?: string): string | undefined {
    return this._storage.getItem(key) ?? defaultValue;
  }

  public saveValue(key: string, value: string): void {
    this._storage.setItem(key, value);
  }

  public removeEntry(key: string): void {
    this._storage.removeItem(key);
  }

  public clear(): void {
    this._storage.clear();
  }
}
