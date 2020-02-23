const bigInt = require('big-integer');

const prime = bigInt('273389558745553615023177755634264971227');
const gen = bigInt('191981998178538467192271372964660528157');

function dLogProof(x, g, p, b) {
  // x: int
  // g: int
  // p: int
  // return: [array[int], array[int]], each of length PARALLELS
  // ZK proof of knowledge of x such that g^x = y mod p
  var r = Math.floor(Math.random() * (p - 1));
  const gBig = bigInt(g);
  const pBig = bigInt(p);
  var t = gBig.modPow(r, pBig).toJSNumber();
  var s = r + b * x;
  return [t, s, b];
}

function verify(y, g, p, t, s, b) {
  // y: int
  // g: int
  // p: int
  // t: array[int] of length PARALLELS
  // s: array[int] of length PARALLELS
  // Verify ZK proof (t,s) of knowledge x such that g^x = y mod p
  const gBig = bigInt(g);
  const yBig = bigInt(y);
  const pBig = bigInt(p);
  const oneBig = bigInt(1);
  const lhs = gBig.modPow(s, pBig).toJSNumber();
  const rhs = ((b == 1 ? yBig : oneBig) * bigInt(t)) % pBig;
  if (lhs !== rhs) {
    return false;
  }
  return true;
}

function test() {
  const p = 31;
  const g = 3;
  const x = 17;
  const y = 22;
  // Let's prove we know x such that g^x = y mod p

  const b = Math.random() > 0.5 ? 1 : 0;
  proof = dLogProof(x, g, p, b);
  t = proof[0];
  s = proof[1];
  goodResult = verify(y, g, p, t, s, b);
  console.log('This should be true: ' + goodResult);
  badResult = verify(23, g, p, t, s, b);
  console.log('This should be false: ' + badResult);
}

test();
