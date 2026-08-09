# Showcase video source backup

This directory is an additive backup of the Replit Design animation project
**Glee-fully Chai Chasers — Showcase Video**, retrieved on 2026-08-07.
It is not part of the shipped game bundle and does not change `public/assets/`.

## Scope and provenance

- The Replit project assembled a 45-second Designathon video from original
  game material, generated visual motifs, and a generated background track.
- `audio/bg_music.mp3` is the Replit Design project's background music.
- `images/generated/` contains the Replit-generated chai-cup, firefly-jar,
  and UniGlee visual motifs in original PNG, optimized PNG, and JPEG forms.
- `images/glee-fully-game.*` and `images/glee-fully-arcade.*` are the video
  project's copies of the game and Arcade-page captures, again retained in
  original PNG, optimized PNG, and JPEG forms.

These files are preserved for the video and possible future review. They are
**not approved as live game assets**. Any future move into `public/assets/`
requires a dedicated provenance row in `docs/ASSET-CHECKLIST.md`, IP review,
and the normal implementation validation.

## Recovery boundary

The Replit project URL is:

`https://replit.com/t/glee-fullytools/repls/Chai-Chasers-Showcase?initialEditorMode=design`

The source animation remains in that project. No MP4 is included here: the
high-definition export was retried after a render-stability repair but was
cancelled when the encoder stopped at 70 percent. This backup preserves the
media required to recreate a future render.

## Integrity manifest

SHA-256 values at retrieval:

```text
b12a6023d5f9e59f209954e727b2cba4099035700e295c94f2a7a85365fa90c6  audio/bg_music.mp3
6ad687a2ef7637160da96d0be0d474962bbc76b40020c68d2a2dc02f4b4dac3c  images/generated/chai-cup-opt.png
27a4ed3109e003464c9a268053721cd3e817330ad449e1dc57da59e9eca5d834  images/generated/chai-cup.jpg
f2518831ae2a67c374a4e209e085b67c6955673e865d2280c7e84ad10aca2ec2  images/generated/chai-cup.png
79fe4dd1a6c9fa3e92c518c9c8edea69a85741d1933dc14f1528a68c9cc01290  images/generated/firefly-jar-opt.png
08fc05c64921b0825f570503e95fc0183d7bb3337f3c3a7d92a0e5f8b8337f2f  images/generated/firefly-jar.jpg
da0c02225d2d2c2534c268934cb8762fb55d64b5d5b036c1c7ee27c620df299d  images/generated/firefly-jar.png
b67a526527ce0e802a6fc2ce4f1a5556403aa3ff8cc3f2b21f815d340783af86  images/generated/uniglee-opt.png
0a78be7daf734f78113e6c475801ee685e47aa09d8606aa6ef53ea40b9fe30f1  images/generated/uniglee.jpg
e79a60b7652e6eec072d27cd2455532140862a54229a7cd7c95601a0bde8229f  images/generated/uniglee.png
2e68a775fb9126eb82656d0aa5550cbd2e55b3a9cee2bed19574512278afacf8  images/glee-fully-arcade-opt.png
dd99974645ae70ae0c62d339996ec0e3f7f223b6003547ad5dacbf5c9ccb8311  images/glee-fully-arcade.jpg
8e8a8d21be9c19c907ed17ec651509723b16341e1747f3dbfa2ae625cdbfbab4  images/glee-fully-arcade.png
b0f60179b0c4a5dbe0eebacbf00a338236b84ddc48d569aa31f4c2ca85dee326  images/glee-fully-game-opt.png
5f7607d177c511067d07d31b3c40776a7df439f5a5971dc14951b896373b19ba  images/glee-fully-game.jpg
7a9e7f013e0de2ec89601703ca03e5473fd89887e7fdb99aa88f58a88ce91a3e  images/glee-fully-game.png
```
