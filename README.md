# bench-idb-blocks

test how fast I can write to indexeddb.

indexeddb is a lot slower than I hoped, but I discovered
that if I just use buffers to store binary data.
(i.e. use it more like a file system) then I can get
_good enough_ performance.

This script dumps buffers into the database,
with various buffer and block sizes, ranging from 1k blocks
to 32k blocks, at about 800k per go. 8k-16k blocks seems best.

to run this in your browser, open [http://dominictarr.github.io/bench-idb-blocks](http://dominictarr.github.io/bench-idb-blocks)

## License

MIT
