# livetrak-web

Livetrak-web is a web-based multitrack audio player, designed to work with recordings from Zoom(r) LiveTrak L-12 (and likely L-8 and L-20 as well).

## The use case
We, as a band, use the LiveTrak extensively both as a mixer and a rehearsal multitrack recorder. The recordings get uploaded for everyone to play with.
Playing back multitrack audio requires a specialized DAW, however, as well as downloading the entire multi-hundred-MiB rehearsal recording to disk.
To help with this, I've created this project. It connects directly to the storage server to allow for easy streaming and skipping to any part of the recording,
also enabling the listener to use the mixer interface to recreate their favorite personal mix.

The UI is mimicked after the L-12, but I opted to have EQ controls per channel in lieu of select buttons; the digital encoders don't cost money, after all.

The player is entirely frontend based, and uses HTML5 `<audio>` elements to stream the data, and WebAudio stack for processing of EQ, panning and
(coming soon) reverb. As such, it's compatible with a wide variety of formats other than plain .WAV - we use AAC in M4A container, and it works very 
well for instant skipping to any part of the recording.

## Features

### Done so far

* Playback of multitrack audio
* Skipping and instant streaming from any point
* Volume control per track + mute per track
* Channel strip per track - EQ with low cut, low/mid/high, bypass and panning

### Planned

See the Issues on GitHub.