# TODO

* Add frame number
* Add checks to exclude delays, debounceTime, etc usage
* Add checking / conversions to ensure output observable type is a string and / or max 2 chars
  * Drive with unit tests on stream.spec.ts

* Add FAQ
  * Add initial FAQ page
  * Grouping and virtual time advancement
  * Why no delay, debounceTime, etc.

* Fix output stream
  * Make output update with the change to input nodes
  * Drive via example unit tests
  * Fix bug
    * visualize -> make no real change -> visualize

* Adjust max chunks for small devices (maybe)

* Add all additional examples
* Review lighthouse output
* Add google analytics
* Publish & make public

## Future

* Add additional unit tests
* Add Scheduler (may need to w8 for v8 refactor of schedulers?)

* Rework stream
  * Update to use types more similar to RxJs
  * Update to (in theory) support "infinite" streams and offsets like 20ms, etc
    * There will be a practical max based on screen size
      * Find, check, and return error if exceeded
    * Create visual for offsets like 20ms and add frame no
    * FrameTimeFactor = 1
  * Use marbles as the source of truth instead of indexes
