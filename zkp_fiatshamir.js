const prime = BigInt('273389558745553615023177755634264971227');
const gen = BigInt('191981998178538467192271372964660528157');
const PARALLELS = 100;

function bigExponentiate(base, exp, mod) {
  // base: BigInt
  // exp: int
  // mod: BigInt
  if (exp == 0) {
    return BigInt(1);
  } else if (exp == 1) {
    return base % mod;
  } else if (exp % 2 == 0) {
    const half = bigExponentiate(base, exp / 2, mod);
    return (half * half) % mod;
  } else {
    const half = bigExponentiate(base, Math.floor(exp / 2), mod);
    return (half * half * base) % mod;
  }
}

function jankHash(arr) {
  // arr: array[int]
  const s = arr.reduce((a, b) => a + b, 0);
  return bigExponentiate(gen, s, prime);
}

function pseudoRandomBits(t) {
  // t: array[int]
  // return: array[int] of bits
  // pseudorandom [b1,...,bPARALLELS] from [t1,...,tPARALLELS]
  const H = jankHash(t);
  var b = [];
  for (var i = 0; i < PARALLELS; i++) {
    const pow2 = BigInt(2) ** BigInt(i);
    b.push((H & pow2) > BigInt(0) ? 1 : 0);
  }
  return b;
}

function dLogProof(x, g, p) {
  // x: int
  // g: int
  // p: int
  // return: [array[int], array[int]], each of length PARALLELS
  // ZK proof of knowledge of x such that g^x = y mod p
  var r = [];
  for (var i = 0; i < PARALLELS; i++) {
    r.push(Math.floor(Math.random() * (p - 1)));
  }
  const gBig = BigInt(g);
  const pBig = BigInt(p);
  var t = r.map(ri => Number(bigExponentiate(gBig, ri, pBig)));
  var b = pseudoRandomBits(t);
  var s = [];
  for (var i = 0; i < PARALLELS; i++) {
    s.push(r[i] + b[i] * x);
  }
  return [t, s];
}

function verify(y, g, p, t, s) {
  // y: int
  // g: int
  // p: int
  // t: array[int] of length PARALLELS
  // s: array[int] of length PARALLELS
  // Verify ZK proof (t,s) of knowledge x such that g^x = y mod p
  const b = pseudoRandomBits(t);
  const gBig = BigInt(g);
  const yBig = BigInt(y);
  const pBig = BigInt(p);
  const oneBig = BigInt(1);
  for (var i = 0; i < PARALLELS; i++) {
    const lhs = bigExponentiate(gBig, s[i], pBig);
    const rhs = ((b[i] == 1 ? yBig : oneBig) * BigInt(t[i])) % pBig;
    if (lhs != rhs) {
      return false;
    }
  }
  return true;
}

function test() {
  const p = 31;
  const g = 3;
  const x = 17;
  const y = 22;
  // Let's prove we know x such that g^x = y mod p

  proof = dLogProof(x, g, p);
  t = proof[0];
  s = proof[1];
  goodResult = verify(y, g, p, t, s);
  console.log('This should be true: ' + goodResult);
  badResult = verify(23, g, p, t, s);
  console.log('This should be false: ' + badResult);
}
