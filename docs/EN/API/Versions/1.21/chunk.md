# Chunk Metadata

```js
{
    pos: V2{ x, z },
    cache: Boolean,
    dimension: Number,
    hash: Array<Unsigned BigInt>,
    subchunksInfo: {
        sub_chunk_count: Number,
        highest_subchunk_count: Number
    }
}
```