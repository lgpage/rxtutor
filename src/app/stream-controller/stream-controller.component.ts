import { Component } from '@angular/core';
import { StreamBuilder } from '../stream.builder';

@Component({
  selector: 'app-stream-controller',
  templateUrl: './stream-controller.component.html',
})
export class StreamControllerComponent {
  stream = this._streamBuilder.create([3, 5, 7], 7);

  constructor(
    protected _streamBuilder: StreamBuilder,
  ) { }
}

// TODO: Create stream controller component
// - Add incrementor to add additional circles
// - Add input to add character prefix