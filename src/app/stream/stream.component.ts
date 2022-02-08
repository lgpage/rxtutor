import { BehaviorSubject } from 'rxjs';
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})
export class StreamComponent {
  protected _positionSubject$ = new BehaviorSubject<number>(15);
  protected _cycleToDrag: EventTarget = null;

  @ViewChild('svg') svg: ElementRef;

  frames = 10;
  position$ = this._positionSubject$.asObservable();

  protected getX(event: PointerEvent): number {
    const ctm: SVGMatrix = this.svg.nativeElement.getScreenCTM();
    return (event.clientX - ctm.e) / ctm.a;
  }

  range(size: number): number[] {
    return [...Array(size).keys()].map((x) => x);
  }

  startDrag(event: Event): void {
    this._cycleToDrag = event.target;
  }

  drag(event: PointerEvent): void {
    if (!!this._cycleToDrag) {
      event.preventDefault();

      const x = Math.max(15, Math.min(105, this.getX(event)));
      this._positionSubject$.next(x);
    }
  }

  endDrag(event: PointerEvent): void {
    if (!!this._cycleToDrag) {
      const x = 15 + Math.round((this.getX(event) - 15) / 10) * 10;
      this._positionSubject$.next(x);
    }

    this._cycleToDrag = null;
  }

  // TODO: Update position to be an array / dictionary (need ids for each)
  // TODO: Change circle colour and add text
  // TODO: Update to take positions in as an input and color
  // TODO: Create stream controller component
    // - Add incrementor to add additional circles
    // - Add input to add character prefix
}
