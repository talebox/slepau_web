/* ===== shared constant (16 MiB hard ceiling) ================= */
const MAX_SIZE = 16 * 1024 * 1024;           // 16 777 216 bytes

/* ============================================================= */
/*                         BufferWriter                          */
/* ============================================================= */
export class BufferWriter {
  #view; #u8; #length = 0; #little;

  constructor(capacity = 1024, littleEndian = true) {
    if (capacity > MAX_SIZE) throw RangeError('initial capacity > 16 MiB');
    this.#little = littleEndian;
    this.#reset(capacity);
  }

  /* ---------- public info ---------- */
  size()     { return this.#length; }          // bytes currently written
  capacity() { return this.#u8.byteLength; }   // backing-store capacity

  /* ---------- private helpers ---------- */
  #reset(arg) {
    const buf = typeof arg === 'number' ? new ArrayBuffer(arg) : arg;
    this.#u8   = new Uint8Array(buf);
    this.#view = new DataView(buf);
  }
  #grow(extra) {
    const need = this.#length + extra;
    if (need > MAX_SIZE) throw RangeError(`BufferWriter exceeds 16 MiB cap (need ${need})`);
    if (need <= this.#u8.byteLength) return;

    let cap = this.#u8.byteLength;
    while (cap < need) cap <<= 1;
    if (cap > MAX_SIZE) cap = MAX_SIZE;

    const buf = new ArrayBuffer(cap);
    new Uint8Array(buf).set(this.#u8);
    this.#reset(buf);
  }

  /* ---------- 8 / 16 / 32-bit primitives ---------- */
  writeU8(v){this.#grow(1); this.#view.setUint8(this.#length,v); this.#length+=1; return this;}
  writeI8(v){this.#grow(1); this.#view.setInt8(this.#length,v);  this.#length+=1; return this;}
  writeU16(v){this.#grow(2); this.#view.setUint16(this.#length,v,this.#little); this.#length+=2; return this;}
  writeI16(v){this.#grow(2); this.#view.setInt16(this.#length,v,this.#little);  this.#length+=2; return this;}
  writeU32(v){this.#grow(4); this.#view.setUint32(this.#length,v,this.#little); this.#length+=4; return this;}
  writeI32(v){this.#grow(4); this.#view.setInt32(this.#length,v,this.#little);  this.#length+=4; return this;}
  writeF32(v){this.#grow(4); this.#view.setFloat32(this.#length,v,this.#little);this.#length+=4; return this;}
  writeF64(v){this.#grow(8); this.#view.setFloat64(this.#length,v,this.#little);this.#length+=8; return this;}

  /* ---------- 64-bit primitives ---------- */
  writeU64(v){this.#grow(8); this.#view.setBigUint64(this.#length,BigInt(v),this.#little); this.#length+=8; return this;}
  writeI64(v){this.#grow(8); this.#view.setBigInt64 (this.#length,BigInt(v),this.#little); this.#length+=8; return this;}

  /* ---------- varuint (≤ 32 bits) ---------- */
  writeVarUint(v){
    if (v>>>0 !== v) throw TypeError('writeVarUint expects unsigned 32-bit int');
    do{ let b=v&0x7F; v>>>=7; this.writeU8(v?b|0x80:b);}while(v);
    return this;
  }

  /* ---------- high-level helpers ---------- */
  writeBuffer(buf){                         // Buffer | Uint8Array | ArrayBuffer
    if (!(buf instanceof Uint8Array)) buf = new Uint8Array(buf);
    this.writeVarUint(buf.length);
    this.#grow(buf.length);
    this.#u8.set(buf, this.#length);
    this.#length += buf.length;
    return this;
  }
  writeString(str){                         // UTF-8 string with length prefix
    const bytes = new TextEncoder().encode(str);
    return this.writeBuffer(bytes);
  }
  /* legacy aliases */
  writeBytes(u8){ return this.writeBuffer(u8); }
  writeUTF8(str){ return this.writeString(str); }

  /* ---------- finish ---------- */
  toUint8Array(){ return this.#u8.subarray(0, this.#length); }
}

/* ============================================================= */
/*                         BufferReader                          */
/* ============================================================= */
export class BufferReader {
  #view; #u8; #pos = 0; #little;

  constructor(buf, littleEndian = true) {
    if (buf.byteLength > MAX_SIZE) throw RangeError('Reader buffer > 16 MiB');
    if (buf instanceof Uint8Array) {
      this.#u8   = buf;
      this.#view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    } else {                               // ArrayBuffer
      this.#u8   = new Uint8Array(buf);
      this.#view = new DataView(buf);
    }
    this.#little = littleEndian;
  }

  /* ---------- public info ---------- */
  size()       { return this.#u8.byteLength; }              // total bytes
  capacity()   { return this.#u8.byteLength; }              // alias
  remaining()  { return this.#u8.byteLength - this.#pos; }
  tell()       { return this.#pos; }

  /* ---------- navigation ---------- */
  #need(n){ if (this.#pos + n > this.#u8.byteLength) throw RangeError('read past end'); }
  seek(o){ this.#need(0); this.#pos = o; return this; }
  skip(n){ this.#need(n); this.#pos += n; return this; }
  slice(n){ this.#need(n); const out=this.#u8.subarray(this.#pos, this.#pos+=n); return out; }

  /* ---------- 8 / 16 / 32-bit primitives ---------- */
  readU8(){this.#need(1); return this.#view.getUint8(this.#pos++);}
  readI8(){this.#need(1); return this.#view.getInt8 (this.#pos++);}
  readU16(){this.#need(2); const v=this.#view.getUint16(this.#pos,this.#little); this.#pos+=2; return v;}
  readI16(){this.#need(2); const v=this.#view.getInt16 (this.#pos,this.#little); this.#pos+=2; return v;}
  readU32(){this.#need(4); const v=this.#view.getUint32(this.#pos,this.#little); this.#pos+=4; return v;}
  readI32(){this.#need(4); const v=this.#view.getInt32 (this.#pos,this.#little); this.#pos+=4; return v;}
  readF32(){this.#need(4); const v=this.#view.getFloat32(this.#pos,this.#little); this.#pos+=4; return v;}
  readF64(){this.#need(8); const v=this.#view.getFloat64(this.#pos,this.#little); this.#pos+=8; return v;}

  /* ---------- 64-bit primitives ---------- */
  readU64(){this.#need(8); const v=this.#view.getBigUint64(this.#pos,this.#little); this.#pos+=8; return v;}
  readI64(){this.#need(8); const v=this.#view.getBigInt64 (this.#pos,this.#little); this.#pos+=8; return v;}

  /* ---------- varuint (≤ 32 bits) ---------- */
  readVarUint(){
    let v = 0, shift = 0, byte;
    do{ byte=this.readU8(); v |= (byte & 0x7F) << shift; shift += 7; } while (byte & 0x80);
    return v >>> 0;
  }

  /* ---------- high-level helpers ---------- */
  readBuffer(){
    const len = this.readVarUint();
    const bytes = this.slice(len);
    if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function')
      return Buffer.from(bytes);            // Node convenience
    return bytes;
  }
  readString(){
    const bytes = this.readBuffer();
    return new TextDecoder().decode(bytes instanceof Uint8Array
      ? bytes
      : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength));
  }
  /* legacy aliases */
  readBytes(){ return this.readBuffer(); }
  readUTF8(){ return this.readString(); }
}


/**
 * Tests
 */

/* ---------- tiny assertion helpers ---------- */
const eq = (a, b, msg = '') => {
  if (Object.is(a, b)) return;
  throw new Error(`ASSERT-EQUAL FAIL: ${msg}\n  expected: ${String(b)}\n  received: ${String(a)}`);
};
const ok = (cond, msg = '') => { if (!cond) throw new Error(`ASSERT-OK FAIL: ${msg}`); };
const throws = (fn, msg = '') => {
  try { fn(); }
  catch { return; }
  throw new Error(`ASSERT-THROWS FAIL: ${msg}`);
};

/* ---------- deterministic pseudo-random helper ---------- */
function* lcg(seed = 0xDEADBEEF) {           // 32-bit LCG
  while (true) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    yield seed;
  }
}

/* ---------- main battery ---------- */
export function _runAllTests() {
  const prng = lcg();
  let passed = 0, failed = 0;

  /* --- 1. 8/16/32-bit primitives --- */
  (() => {
    const w = new BufferWriter();
    const nums = [];
    for (let i = 0; i < 1000; i++) nums.push(prng.next().value >>> 0);
    nums.forEach(v => w.writeU32(v).writeI32(v | 0));
    const r = new BufferReader(w.toUint8Array());
    nums.forEach(v => {
      eq(r.readU32(), v, 'U32 mismatch');
      eq(r.readI32(), (v | 0), 'I32 mismatch');
    });
  })();  ++passed;

  /* --- 2. 64-bit round-trips --- */
  (() => {
    const w = new BufferWriter();
    const bigs = [0n, 1n, 0xFFFF_FFFFn, 2n ** 53n, 2n ** 63n - 1n];
    bigs.forEach(b => w.writeU64(b).writeI64(-b));
    const r = new BufferReader(w.toUint8Array());
    bigs.forEach(b => {
      eq(r.readU64(), b, 'U64 mismatch');
      eq(r.readI64(), -b, 'I64 mismatch');
    });
  })();  ++passed;

  /* --- 3. VarUint boundaries --- */
  (() => {
    const vals = [0, 1, 127, 128, 255, 16383, 65535, 0x7FFF_FFFF];
    const w = new BufferWriter();
    vals.forEach(v => w.writeVarUint(v));
    const r = new BufferReader(w.toUint8Array());
    vals.forEach(v => eq(r.readVarUint(), v, `VarUint ${v}`));
  })();  ++passed;

  /* --- 4. UTF-8 strings & blobs --- */
  (() => {
    const w = new BufferWriter();
    const strs = ['', 'ascii', 'π≈3.14', '👩‍🚀🚀', '𠜎𠜱𡿺'];
    const blobs = strs.map(s => new TextEncoder().encode(s).reverse());
    strs.forEach(s => w.writeUTF8(s));
    blobs.forEach(b => w.writeBytes(b));
    const r = new BufferReader(w.toUint8Array());
    strs.forEach(s => eq(r.readUTF8(), s, 'UTF8 mismatch'));
    blobs.forEach(b => {
      const got = r.readBytes();
      ok(got.every((x, i) => x === b[i]), 'blob mismatch');
    });
  })();  ++passed;

  /* --- 5. Endianness toggle --- */
  (() => {
    const w = new BufferWriter(16, /*little*/ false);
    w.writeU16(0x1234);
    const r = new BufferReader(w.toUint8Array(), /*little*/ false);
    eq(r.readU16(), 0x1234, 'big-endian fail');
  })();  ++passed;

  /* --- 6. Seeking / slicing helpers --- */
  (() => {
    const w = new BufferWriter();
    w.writeU8(1).writeU8(2).writeU8(3).writeU8(4);
    const r = new BufferReader(w.toUint8Array());
    r.seek(2);
    eq(r.readU8(), 3);
    r.seek(0);
    const slice = r.slice(2);
    ok(slice[0] === 1 && slice[1] === 2, 'slice wrong bytes');
    eq(r.remaining(), 2);
  })();  ++passed;

  /* --- 7. Size cap (writer & reader) --- */
(() => {
  /* constructor guards */
  throws(() => new BufferWriter(MAX_SIZE + 1), 'Writer ctor >16MB');
  const bigBuf = new Uint8Array(MAX_SIZE + 1);
  throws(() => new BufferReader(bigBuf), 'Reader >16MB');

  /* writer: fill to the brim, then overflow */
  const w = new BufferWriter();                // start small, let it grow
  const varSize = n => {                       // bytes LEB128 would occupy
    let c = 0; do { c++; n >>>= 7; } while (n); return c;
  };

  /* choose a blob length so (length + varintPrefix) === MAX_SIZE */
  let blobLen = MAX_SIZE - 1;                  // start close
  while (blobLen + varSize(blobLen) !== MAX_SIZE) blobLen--;

  const blob = new Uint8Array(blobLen);        // all zeros
  w.writeBytes(blob);                          // should succeed (exact cap)
  eq(w.toUint8Array().length, MAX_SIZE, 'writer did not reach cap');

  /* one extra byte must now fail */
  throws(() => w.writeU8(0), 'grow past cap');
})();  ++passed;

  /* --- 8. Out-of-bounds read --- */
  (() => {
    const r = new BufferReader(new Uint8Array([0xFF]));
    r.readU8();                        // ok
    throws(() => r.readU8(), 'read past end');
  })();  ++passed;

/* --- 9. UTF-8 String round-trip --- */
  (() => {
    const w       = new BufferWriter();
    const strings = [];

    for (let i = 0; i < 500; i++) {
      const len = prng.next().value % 64;          // 0‒63 chars
      let s = '';
      for (let j = 0; j < len; j++) {
        const code = 32 + (prng.next().value % 95); // printable ASCII
        s += String.fromCharCode(code);
      }
      strings.push(s);
      w.writeString(s);             // length-prefixed varint
    }

    const r = new BufferReader(w.toUint8Array());
    strings.forEach(s => eq(r.readString(), s, 'String mismatch'));
  })(); ++passed;

  /* --- 10. Buffer / Uint8Array round-trip --- */
  (() => {
    const w      = new BufferWriter();
    const blobs  = [];

    for (let i = 0; i < 400; i++) {
      const len = prng.next().value % 256;
      const arr = new Uint8Array(len);
      for (let j = 0; j < len; j++) arr[j] = prng.next().value & 0xFF;
      blobs.push(arr);
      w.writeBuffer(arr);           // length-prefixed varint
    }

    const r = new BufferReader(w.toUint8Array());
    blobs.forEach(orig => {
      const out = r.readBuffer();
      ok(
        out.length === orig.length &&
        out.every((v, idx) => v === orig[idx]),
        'Buffer mismatch'
      );
    });
  })(); ++passed;

  /* ---------------- summary ---------------- */
  console.log(`✔ ${passed} test groups passed, ${failed} failed`);
}


// try { _runAllTests(); }
// catch (e) { console.error(e); process.exit?.(1); }
