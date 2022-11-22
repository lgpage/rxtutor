# TODO

* Fix output stream
  * Make output update with the change to input nodes
  * Move relevant logic from builder to executor service
  * Drive via example unit tests
  * Fix bug
    * visualize -> make no real change -> visualize

* Add additional examples
* Review lighthouse output
* Update README, LICENSE, etc.
* Test and bugfixes
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

* Fix @angular/material scss bundle warning
* Add additional unit tests
* Add Scheduler (may need to w8 for v8 refactor of schedulers?)

* Rework stream
  * Update to use types more similar to RxJS
  * Update to (in theory) support "infinite" streams and offsets like 20ms, etc
    * There will be a practical max based on screen size
      * Find, check, and return error if exceeded
    * Create visual for offsets like 20ms
    * FrameTimeFactor = 1
  * Use marbles as the source of truth instead of indexes
