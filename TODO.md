# TODO

* Rework stream
  * Update to use notification types

* Visualize grouped nodes better

* Add unit tests for current examples

* Update README, LICENSE, etc.
* Test and bugfixes
* Delete this file and create issues on GitHub
* Publish to Azure & make repo public

## Testing

* Try break things with return type / value
  * Non observable
  * Observable of non-string
  * Observable of observables
  * etc.

* Delay / throttle time / debounce time, etc
  * Add checks to exclude if it doesn't work
  * Update FAQ if it doesn't work

## Future

* Fix marbles not showing via matToolTip
* Fix @angular/material scss bundle warning

* Add additional unit tests

* Add additional examples with unit tests

* Review lighthouse output

* Update stream
  * Use marbles as the source of truth instead of indexes
  * Allow user to input marbles with values
  * Update to (in theory) support "infinite" streams and offsets like 40ms, etc
    * There will be a practical max based on screen size
      * Find, check, and return error if exceeded
    * Create visual for offsets like 40ms
