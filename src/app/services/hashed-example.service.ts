import { Injectable } from '@angular/core';
import { LoggerService } from "../logger.service";
import { InputMarbles, InputStreamLike } from "../core/types/stream";
import { combineLatest, mergeMap, Observable, of } from "rxjs";
import { ActivatedRoute, Router, UrlTree } from "@angular/router";
import { Example } from "../core/types/example";
import { map } from "rxjs/operators";
import { StreamBuilderService } from "./stream.builder";
import { RouteNames } from "app-constants";

@Injectable({
  providedIn: 'root',
})
export class HashedExampleService {
  protected _name = 'HashedExampleService';

  constructor(
    protected _router: Router,
    protected _streamBuilder: StreamBuilderService,
    protected _logger: LoggerService,
  ) { }

  private createHashExample(code: string, marbles: Array<InputMarbles>): Example {
    const inputStreams = marbles.map((m) => this._streamBuilder.inputStream(m));
    return {
      name: 'Hashed Example',
      links: [],
      section: 'other',
      getCode: () => code,
      getInputStreams: () => ({
        small: inputStreams,
        large: inputStreams,
      }),
    };
  }

  getUrl(code$: Observable<string>, streams$: Observable<InputStreamLike[]>): Observable<string> {
    const hashedMarbles$ = streams$.pipe(
      mergeMap((streams) => combineLatest(streams.map((stream) => stream.marbles$))),
      map((allMarbles) => allMarbles.map(({ marbles }) => ({ marbles }))),
      map((marbles) => btoa(JSON.stringify(marbles))),
      map((hashedMarbles) => ({ marbles: hashedMarbles })),
    );

    const hashedCode$ = code$.pipe(
      map((code) => ({ code: `${btoa(code)}` })),
    );

    return combineLatest([hashedMarbles$, hashedCode$]).pipe(
      map(([{ marbles }, { code }]) => ({ marbles, code })),
      map((queryParams) => this._router.createUrlTree(
        [`/${RouteNames.SharedExample}`],
        { queryParams },
      )),
      map((urlTree) => this._router.serializeUrl(urlTree)),
    );
  }

  getExample(route: ActivatedRoute): Observable<Example | undefined> {
    return route.queryParams?.pipe(
      map((params) => {
        const { marbles, code } = params;
        if (!marbles || !code) {
          return undefined;
        }

        const decodedMarbles = JSON.parse(atob(marbles));
        const decodedCode = atob(code);

        return this.createHashExample(decodedCode, decodedMarbles);
      }),
    ) ?? of(undefined);
  }
}
