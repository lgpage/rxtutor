# TODO

* Implement routing instead of render example service
  * Remove extra code for app insights

* Adjust max chunks for small devices
* Mobile -> fix moving svg nodes

* Figure out payload / node display vs node value
* Add checking / conversions to ensure output observable type is a string and / or max 2 chars
  * Drive with unit tests on stream.spec.ts

* Fix output stream
  * Make output update with the change to input nodes
  * Drive via example unit tests
  * Fix bug
    * visualize -> make no real change -> visualize

* Add additional examples
* Review lighthouse output
* Update README, LICENSE, etc.
* Publish to Azure & make repo public
* Test and bugfixes

## Testing

* Delay / throttle time / debounce time, etc
  * Add checks to exclude if it doesn't work
  * Update FAQ if it doesn't work

## Future

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
