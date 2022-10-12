# TODO

* Test different examples and inputs
  * Compare to RxJs marbles
  * Create integration tests for the examples
* Add additional examples
* Rework stream
  * Update to use types more similar to RxJs
  * Update design to split out options to new dialog
    * Utilize space more efficiently
  * Update to (in theory) support "infinite" streams and offsets like 20ms, etc
    * There will be a practical max based on screen size
      * Find, check, and return error if exceeded
    * Create visual for offsets like 20ms and add frame no
    * FrameTimeFactor = 1
  * Rename stream to something else
* Tweak styling if needed
  * Review primary, secondary, and warn colors
* Add google analytics
* Publish & make public

## Future

* Add footer + FAQ
* Add additional unit tests
* Add Scheduler (may need to w8 for v8 refactor of schedulers?)
