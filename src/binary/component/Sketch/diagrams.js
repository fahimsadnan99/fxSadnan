/**
 * Lesson sketches. Coordinates are [candle index, price 0 to 100].
 * Candles are [open, close, high, low, options]. Green when close >= open.
 * Every sketch is drawn from the rule stated in the lesson it belongs to.
 */

// Number candles from `start`, one step apart.
const seq = (list, start = 0) =>
  list.map(([o, c, h, l], k) => [o, c, h, l, { i: start + k }]);

// Mirror a candle list top to bottom (a bullish idea becomes a bearish one).
const flip = (list) => list.map(([o, c, h, l, opt]) => [100 - o, 100 - c, 100 - l, 100 - h, opt]);

// Mirror and renumber in one go.
const mirrorSeq = (list, start = 0) => flip(seq(list, start));


/* ------------------------------------------------------------------ */
/* Candles, patterns and levels                                        */
/* ------------------------------------------------------------------ */

const anatomy = {
  alt: "A bullish candle and a bearish candle with open, close, high, low, body and wicks named",
  cap: "The parts of a candle: the body runs from open to close, the wicks show the high and the low.",
  dx: 70,
  x0: 70,
  bw: 28,
  c: [
    [30, 70, 86, 18, { i: 0.5 }],
    [70, 30, 84, 16, { i: 3.2 }],
  ],
  t: [
    { a: [0.5, 104], t: "Bullish (green): price went up", tone: "bull", big: true },
    { a: [3.2, 104], t: "Bearish (red): price went down", tone: "bear", big: true },
    { a: [0.5, 86], t: "High", anchor: "start", dx: 20, dy: 4 },
    { a: [0.5, 70], t: "Close", anchor: "start", dx: 20, dy: 4 },
    { a: [0.5, 30], t: "Open", anchor: "start", dx: 20, dy: 4 },
    { a: [0.5, 18], t: "Low", anchor: "start", dx: 20, dy: 4 },
    { a: [0.5, 78], t: "Upper wick", anchor: "end", dx: -20, dy: 4 },
    { a: [0.5, 50], t: "Body", anchor: "end", dx: -20, dy: 4, tone: "text" },
    { a: [0.5, 24], t: "Lower wick", anchor: "end", dx: -20, dy: 4 },
    { a: [3.2, 84], t: "High", anchor: "start", dx: 20, dy: 4 },
    { a: [3.2, 70], t: "Open", anchor: "start", dx: 20, dy: 4 },
    { a: [3.2, 30], t: "Close", anchor: "start", dx: 20, dy: 4 },
    { a: [3.2, 16], t: "Low", anchor: "start", dx: 20, dy: 4 },
    { a: [3.2, 78], t: "Upper wick", anchor: "end", dx: -20, dy: 4 },
    { a: [3.2, 50], t: "Body", anchor: "end", dx: -20, dy: 4, tone: "text" },
    { a: [3.2, 23], t: "Lower wick", anchor: "end", dx: -20, dy: 4 },
  ],
};

const nested = {
  alt: "One hour candle containing sixty one-minute candles, each containing twelve five-second candles",
  cap: "One candle hides many smaller candles: 1 hour = 60 one-minute candles, 1 minute = 12 five-second candles.",
  bw: 18,
  dx: 42,
  x0: 40,
  c: [
    [20, 80, 88, 12, { i: 0 }],
    ...seq(
      [
        [22, 30, 33, 18],
        [30, 26, 34, 23],
        [26, 46, 50, 24],
        [46, 40, 50, 36],
        [40, 62, 66, 38],
        [62, 80, 88, 58],
      ],
      2.2,
    ),
  ],
  t: [
    { a: [0, 104], t: "1 hour", big: true },
    { a: [4.4, 104], t: "= 60 × 1-minute candles", big: true, tone: "text" },
    { a: [4.4, 6], t: ["and every 1-minute candle is made of 12 five-second candles", "(5 sec × 12 = 60 sec = 1 minute)"], tone: "amber" },
    { a: [0, 2], t: "one candle", dy: 0 },
  ],
  ar: [{ a: [0.6, 52], b: [1.7, 52], tone: "soft" }],
};

const engulfBull = {
  alt: "A small red candle fully covered by a large green candle: bullish engulfing, with the support level marked on the red wick",
  cap: "Bullish engulfing: the green candle swallows the red one. The red candle's low wick (or body if no wick) is the support level.",
  dx: 40,
  x0: 24,
  c: [
    ...seq([
      [80, 70, 82, 66],
      [70, 60, 72, 55],
      [58, 50, 60, 46],
      [48, 72, 76, 44],
    ]),
    ...mirrorSeq(
      [
        [80, 70, 82, 66],
        [70, 60, 72, 55],
        [58, 50, 60, 46],
        [48, 72, 76, 44],
      ],
      5,
    ),
  ],
  l: [
    { a: [1.6, 46], b: [3.7, 46], tone: "bull" },
    { a: [6.6, 54], b: [8.7, 54], tone: "bear" },
  ],
  t: [
    { a: [1.5, 104], t: "Bullish engulfing", tone: "bull", big: true },
    { a: [6.5, 104], t: "Bearish engulfing", tone: "bear", big: true },
    { a: [2.2, 37], t: ["Support:", "red wick"], tone: "bull" },
    { a: [7.1, 63], t: ["Resistance:", "green wick"], tone: "bear" },
    { a: [3.5, 88], t: "Up trade", tone: "bull", anchor: "start", dy: 0 },
    { a: [8, -4], t: "Down trade", tone: "bear" },
  ],
  ar: [
    { a: [3, 82], b: [3, 94], tone: "bull" },
    { a: [8, 18], b: [8, 6], tone: "bear" },
  ],
};

const insideBar = {
  alt: "A large red candle followed by a small red candle inside it, with a sell zone drawn from the small candle's upper wick to its body; price leaves and returns to the zone",
  cap: "Inside bar: the small second candle is under 50% of the first. Draw a box from its upper wick to the bottom of its body. When price returns after at least five candles, trade the reversal.",
  dx: 40,
  x0: 24,
  c: seq([
    [86, 40, 90, 34],
    [66, 58, 72, 54],
    [58, 50, 60, 46],
    [50, 42, 52, 38],
    [42, 34, 44, 30],
    [34, 28, 36, 24],
    [28, 40, 44, 26],
    [40, 56, 60, 38],
    [56, 68, 72, 54],
  ]),
  z: [{ a: [0.5, 72], b: [8.7, 58], tone: "bear" }],
  t: [
    { a: [4.3, 104], t: "Inside bar → sell zone", tone: "bear", big: true },
    { a: [1, 14], t: ["Small candle", "inside the big one"] },
    { a: [4.5, 14], t: "5+ candles move away" },
    { a: [6, 80], t: "Zone: upper wick to body", tone: "bear" },
    { a: [8, 96], t: "Sell", tone: "bear" },
  ],
  ar: [{ a: [8, 90], b: [8, 77], tone: "bear" }],
};

const outsideBar = {
  alt: "A small green candle followed by a much larger green candle that covers it, with a buy zone drawn from the small candle's lower wick to its body; price leaves and returns to the zone",
  cap: "Outside bar: the first candle is small and the second is much bigger. For a small green candle the box runs from its lower wick to where the body closes. Return after five or more candles, then buy.",
  dx: 40,
  x0: 24,
  c: seq([
    [30, 36, 42, 26],
    [28, 66, 72, 24],
    [66, 72, 76, 62],
    [72, 78, 82, 70],
    [78, 84, 88, 76],
    [84, 80, 88, 76],
    [80, 70, 84, 66],
    [70, 52, 74, 48],
    [52, 38, 56, 30],
  ]),
  z: [{ a: [-0.5, 26], b: [8.7, 36], tone: "bull" }],
  t: [
    { a: [4.3, 104], t: "Outside bar → buy zone", tone: "bull", big: true },
    { a: [0, 14], t: ["Small candle,", "then a much", "bigger one"], anchor: "start", dx: -8 },
    { a: [5.5, 14], t: "5+ candles move away" },
    { a: [8, 8], t: "Buy", tone: "bull" },
  ],
  ar: [{ a: [8, 4], b: [8, 22], tone: "bull" }],
};

const gapLevel = {
  alt: "Two cases of a candle opening with a gap near a resistance level: gap above the level gives an up trade, gap that opens still below the level is likely to close red",
  cap: "Gap at a level: if the candle opens above the level, trade up. If it gaps but still opens under the level, a red candle is more likely.",
  dx: 40,
  x0: 24,
  c: [
    ...seq([
      [30, 40, 44, 28],
      [40, 50, 54, 38],
      [50, 54, 58, 46],
      [68, 80, 84, 66],
    ]),
    ...seq(
      [
        [30, 40, 44, 28],
        [40, 46, 50, 36],
        [46, 48, 52, 42],
        [57, 52, 59, 50],
      ],
      5,
    ),
  ],
  l: [
    { a: [-0.4, 62], b: [3.7, 62], tone: "amber" },
    { a: [4.6, 62], b: [8.7, 62], tone: "amber" },
  ],
  t: [
    { a: [1.6, 104], t: "Gap above the level", tone: "bull", big: true },
    { a: [6.6, 104], t: "Gap, still under it", tone: "bear", big: true },
    { a: [0.6, 70], t: "Resistance", tone: "amber", anchor: "start" },
    { a: [5.6, 70], t: "Resistance", tone: "amber", anchor: "start" },
    { a: [2.5, 90], t: "gap", tone: "soft" },
    { a: [7.5, 70], t: "gap", tone: "soft" },
    { a: [3, 14], t: "Up trade", tone: "bull" },
    { a: [8, 26], t: ["Likely", "red"], tone: "bear" },
  ],
  ar: [
    { a: [3, 90], b: [3, 98], tone: "bull" },
    { a: [8, 46], b: [8, 36], tone: "bear" },
  ],
};

const star = (flipIt) => {
  const base = [
    [88, 56, 92, 52],
    [50, 46, 54, 42],
    [48, 82, 86, 44],
  ];
  const cs = flipIt ? mirrorSeq(base) : seq(base);
  const lvl = flipIt ? 46 : 54;
  const top = flipIt ? [8, 12] : [88, 92];
  const bull = !flipIt;
  const tone = bull ? "bull" : "bear";
  return {
    alt: bull
      ? "Morning star: a big red candle, a small candle, then a big green candle, with two support levels marked"
      : "Evening star: a big green candle, a small candle, then a big red candle, with two resistance levels marked",
    cap: bull
      ? "Morning star (price likely up): the small candle's upper wick and the big red candle's top wick-to-body are two support levels. Trade it in an uptrend or a range."
      : "Evening star (price likely down): the small candle's lower wick and the big green candle's bottom wick-to-body are two resistance levels. Trade it in a downtrend or a range.",
    dx: 60,
    x0: 60,
    c: cs,
    l: [{ a: [0.7, lvl], b: [3.1, lvl], tone }],
    z: [{ a: [-0.45, top[0]], b: [0.45, top[1]], tone }],
    t: [
      { a: [1, bull ? 104 : 104], t: bull ? "Morning star" : "Evening star", tone, big: true },
      { a: [3.2, lvl], t: [bull ? "Support 1" : "Resistance 1", "small candle's", bull ? "upper wick" : "lower wick"], tone, anchor: "start", dy: bull ? -22 : 6 },
      {
        a: [-0.45, bull ? 94 : 1],
        t: bull ? "Support 2: big red candle's top wick to body" : "Resistance 2: big green candle's bottom wick to body",
        tone,
        anchor: "start",
      },
    ],
  };
};

const momentum = {
  alt: "Three green candles in a row labelled buyer momentum, and three red candles in a row labelled seller momentum",
  cap: "Momentum: three candles of the same colour in a row. Three green = buyer momentum, three red = seller momentum.",
  dx: 44,
  x0: 40,
  c: [
    ...seq([
      [30, 42, 46, 28],
      [42, 56, 60, 40],
      [56, 70, 74, 54],
    ]),
    ...seq(
      [
        [80, 68, 84, 66],
        [68, 54, 70, 52],
        [54, 40, 56, 38],
      ],
      4.8,
    ),
  ],
  l: [
    { a: [-0.4, 14], b: [2.4, 14], k: "thin", tone: "bull" },
    { a: [4.4, 14], b: [7.2, 14], k: "thin", tone: "bear" },
  ],
  t: [
    { a: [1, 5], t: "Buyer momentum", tone: "bull", big: true },
    { a: [5.8, 5], t: "Seller momentum", tone: "bear", big: true },
  ],
};

const supportZone = {
  alt: "Price moving between a support zone at the bottom and a resistance zone at the top; each zone covers the wick and the body",
  cap: "Draw support and resistance as zones, not thin lines: take the wick and the body together, because price reacts across the whole area.",
  dx: 42,
  x0: 34,
  c: seq([
    [60, 40, 62, 34],
    [40, 30, 44, 22],
    [30, 52, 56, 24],
    [52, 70, 74, 48],
    [70, 84, 92, 66],
    [84, 72, 90, 68],
    [72, 56, 76, 52],
    [56, 38, 58, 34],
    [38, 44, 48, 24],
  ]),
  z: [
    { a: [-0.5, 22], b: [8.7, 34], tone: "bull" },
    { a: [-0.5, 82], b: [8.7, 92], tone: "bear" },
  ],
  t: [
    { a: [8.6, 14], t: "Support zone (wick + body)", tone: "bull", anchor: "end" },
    { a: [8.6, 97], t: "Resistance zone (wick + body)", tone: "bear", anchor: "end" },
  ],
};

const roleReversal = {
  alt: "Left: price breaks above a resistance zone, comes back to it, and bounces so the zone becomes support. Right: the mirror case where support becomes resistance",
  cap: "Resistance that breaks and holds from above becomes support. Support that breaks and rejects from below becomes resistance.",
  dx: 36,
  x0: 22,
  c: [
    ...seq([
      [30, 44, 48, 28],
      [44, 58, 64, 42],
      [58, 72, 76, 56],
      [72, 64, 74, 58],
      [64, 80, 84, 60],
    ]),
    ...mirrorSeq(
      [
        [30, 44, 48, 28],
        [44, 58, 64, 42],
        [58, 72, 76, 56],
        [72, 64, 74, 58],
        [64, 80, 84, 60],
      ],
      5,
    ),
  ],
  z: [
    { a: [-0.5, 56], b: [4.6, 62], tone: "amber" },
    { a: [4.5, 38], b: [9.6, 44], tone: "amber" },
  ],
  t: [
    { a: [2, 104], t: "Resistance becomes support", tone: "bull", big: true },
    { a: [7, 104], t: "Support becomes resistance", tone: "bear", big: true },
  ],
};

const singleLevels = {
  alt: "A candle with wicks showing the upper wick as resistance and the lower wick as support, and a candle without wicks using the body edges as levels",
  cap: "Single candle levels: the upper wick is resistance and the lower wick is support. With no wicks, the top of the body is resistance and the bottom of the body is support.",
  dx: 90,
  x0: 90,
  c: [
    [40, 62, 82, 22, { i: 0 }],
    [74, 40, 74, 40, { i: 2.5 }],
  ],
  z: [
    { a: [-0.7, 82], b: [0.7, 62], tone: "bear" },
    { a: [-0.7, 22], b: [0.7, 40], tone: "bull" },
  ],
  l: [
    { a: [1.8, 74], b: [3.2, 74], tone: "bear" },
    { a: [1.8, 40], b: [3.2, 40], tone: "bull" },
  ],
  t: [
    { a: [0, 98], t: "With wicks", big: true, tone: "text" },
    { a: [2.5, 98], t: "No wicks", big: true, tone: "text" },
    { a: [0.9, 72], t: ["Upper wick", "= resistance"], tone: "bear", anchor: "start" },
    { a: [0.9, 31], t: ["Lower wick", "= support"], tone: "bull", anchor: "start" },
    { a: [2.5, 82], t: "Body top = resistance", tone: "bear" },
    { a: [2.5, 30], t: "Body bottom = support", tone: "bull" },
  ],
};

const fiftyLevel = {
  alt: "A large green candle with its 50 percent line acting as support and a large red candle with its 50 percent line acting as resistance",
  cap: "The 50% level: half of a big candle's body (from upper body to lower body). On a big green candle it works as support, on a big red candle as resistance.",
  dx: 110,
  x0: 80,
  c: [
    [20, 76, 80, 16, { i: 0 }],
    [88, 32, 92, 28, { i: 2.4 }],
  ],
  l: [
    { a: [-0.5, 48], b: [1.2, 48], tone: "bull" },
    { a: [1.6, 60], b: [2.9, 60], tone: "bear" },
  ],
  t: [
    { a: [0.18, 48], t: ["50% of the body", "= support"], tone: "bull", anchor: "start", dx: 20, dy: 18 },
    { a: [2.4, 60], t: ["50% of the body", "= resistance"], tone: "bear", anchor: "end", dx: -20, dy: -26 },
    { a: [0, 99], t: "Big green candle", tone: "bull", big: true },
    { a: [2.4, 99], t: "Big red candle", tone: "bear", big: true },
  ],
};

const internalStructure = {
  alt: "A large uptrend with, inside one pullback, a small downtrend drawn in amber",
  cap: "Internal structure: the small opposite trend inside a pullback of the big trend. Give the external (main) structure the most weight.",
  dx: 40,
  x0: 24,
  p: [
    { pts: [[0, 10], [2, 50]], tone: "bull" },
    { pts: [[4.6, 32], [7, 80]], tone: "bull" },
    { pts: [[2, 50], [2.6, 43], [3, 47], [3.6, 38], [4, 41], [4.6, 32]], tone: "amber" },
  ],
  l: [{ a: [2, 50], b: [4.6, 32], k: "thin", tone: "soft" }],
  t: [
    { a: [3.5, 100], t: "External structure: uptrend (main weight)", tone: "bull", big: true },
    { a: [3.3, 16], t: ["Internal structure:", "a small downtrend inside the pullback"], tone: "amber" },
  ],
};

const wickZone = (flipIt) => {
  const base = [
    [52, 58, 80, 50],
    [58, 52, 82, 48],
    [54, 60, 81, 52],
    [58, 46, 60, 44],
    [46, 38, 48, 36],
    [38, 30, 40, 28],
    [30, 24, 32, 22],
    [24, 30, 34, 22],
    [30, 46, 50, 28],
    [46, 64, 70, 44],
  ];
  const cs = flipIt ? mirrorSeq(base) : seq(base);
  const tone = flipIt ? "bull" : "bear";
  return {
    alt: flipIt
      ? "Several candles with long lower wicks form a buying zone; five or more candles later price returns to it and moves up"
      : "Several candles with long upper wicks form a selling zone; five or more candles later price returns to it and moves down",
    cap: flipIt
      ? "Buying zone: many candles with long lower wicks show buying pressure. If price comes back after at least five candles, it should reverse up."
      : "Selling zone: many candles with long upper wicks show selling pressure. If price comes back after at least five candles, it should reverse down.",
    dx: 38,
    x0: 28,
    c: cs,
    z: [flipIt ? { a: [-0.5, 18], b: [9.6, 34], tone } : { a: [-0.5, 66], b: [9.6, 82], tone }],
    t: [
      { a: [4.5, flipIt ? 8 : 92], t: flipIt ? "Buying zone: long lower wicks" : "Selling zone: long upper wicks", tone, big: true },
      { a: [5, flipIt ? 92 : 8], t: "5+ candles later, price returns", tone: "soft" },
      flipIt ? { a: [9, -4], t: "Buy", tone } : { a: [9, 104], t: "Sell", tone },
    ],
    ar: [flipIt ? { a: [9, 3], b: [9, 15], tone } : { a: [9, 98], b: [9, 85], tone }],
  };
};

const bounceBuy = {
  alt: "Price falls to a support zone and stops there again and again, then a large bullish candle forms: a possible buy signal",
  cap: "Price Action in one picture: price keeps stopping at a support zone, then a big bullish candle appears — a possible buy signal.",
  dx: 44,
  x0: 34,
  c: seq([
    [78, 66, 80, 62],
    [66, 54, 68, 50],
    [54, 40, 56, 36],
    [40, 46, 52, 30],
    [46, 38, 50, 30],
    [38, 44, 46, 29],
    [42, 72, 76, 40],
  ]),
  z: [{ a: [-0.5, 28], b: [6.7, 40], tone: "bull" }],
  t: [
    { a: [1.5, 18], t: "Support zone: price stops here again and again", tone: "bull", anchor: "start", dx: -20 },
    { a: [4.2, 100], t: "Big bullish candle → possible buy", tone: "bull", big: true },
  ],
  ar: [{ a: [6, 80], b: [6, 94], tone: "bull" }],
};

/* ------------------------------------------------------------------ */
/* Candle strength, order flow and markets                              */
/* ------------------------------------------------------------------ */

const strongCandle = {
  alt: "Strong candles: equal wicks on both sides, no wicks at all, and for buyers a long lower wick or for sellers a long upper wick",
  cap: "Strong candles: equal wicks on both sides, or no wicks (marubozu). A long lower wick on a green candle (buyer) or a long upper wick on a red candle (seller) is also strong.",
  dx: 66,
  x0: 34,
  c: [
    [40, 66, 74, 32, { i: 0 }],
    [38, 72, 72, 38, { i: 1 }],
    [55, 70, 72, 20, { i: 2 }],
    [66, 40, 74, 32, { i: 3 }],
    [72, 38, 72, 38, { i: 4 }],
    [45, 30, 80, 28, { i: 5 }],
  ],
  t: [
    { a: [1, 104], t: "Strong buyer candles", tone: "bull", big: true },
    { a: [4, 104], t: "Strong seller candles", tone: "bear", big: true },
    { a: [0, 12], t: ["Equal", "wicks"] },
    { a: [1, 12], t: ["No wicks", "(marubozu)"] },
    { a: [2, 12], t: ["Long lower", "wick = buyer", "strong"] },
    { a: [3, 12], t: ["Equal", "wicks"] },
    { a: [4, 12], t: ["No wicks", "(marubozu)"] },
    { a: [5, 12], t: ["Long upper", "wick = seller", "strong"] },
  ],
};

const weakCandle = {
  alt: "A green candle with an upper wick at least one and a half times its body, and a red candle with a lower wick at least one and a half times its body: both weak",
  cap: "Weak candle: the other side's pressure sits inside it. A buyer candle with a long upper wick (1.5× the body or more) is weak; a seller candle with a long lower wick is weak.",
  dx: 210,
  x0: 95,
  c: [
    [40, 52, 80, 38, { i: 0 }],
    [60, 48, 62, 20, { i: 1 }],
  ],
  t: [
    { a: [0, 14], t: ["Upper wick ≥ 1.5 × body", "seller pressure inside", "a buyer candle = weak"], tone: "bear" },
    { a: [1, 14], t: ["Lower wick ≥ 1.5 × body", "buyer pressure inside", "a seller candle = weak"], tone: "bull" },
    { a: [0, 99], t: "Weak buyer candle", tone: "bull", big: true },
    { a: [1, 99], t: "Weak seller candle", tone: "bear", big: true },
  ],
};

const symmetrical = {
  alt: "A symmetrical candle whose upper half mirrors its lower half, next to a candle whose halves differ",
  cap: "Symmetrical means one half mirrors the other. Cut a strong candle in the middle: the upper half looks like the lower half. That balance is what makes it powerful.",
  dx: 200,
  x0: 100,
  c: [
    [40, 66, 80, 26, { i: 0 }],
    [40, 56, 60, 8, { i: 1 }],
  ],
  l: [
    { a: [-0.4, 53], b: [0.4, 53], tone: "amber" },
    { a: [0.6, 34], b: [1.4, 34], tone: "amber" },
  ],
  t: [
    { a: [0, 14], t: ["Upper half = lower half", "symmetrical = powerful"], tone: "bull" },
    { a: [1, 14], t: ["The halves differ", "not symmetrical"], tone: "soft" },
  ],
};

const orderFlow = {
  alt: "Four candles each bigger than the last (order flow increment) and four candles each smaller than the last (order flow decrement)",
  cap: "A candle is an order and its size is the flow. Each candle bigger than the one before = order flow increment; each smaller = decrement.",
  dx: 38,
  x0: 24,
  c: [
    ...seq([
      [10, 16, 18, 8],
      [16, 26, 28, 14],
      [26, 42, 45, 24],
      [42, 66, 69, 40],
    ]),
    ...seq(
      [
        [20, 50, 52, 18],
        [50, 70, 72, 48],
        [70, 82, 84, 68],
        [82, 88, 90, 80],
      ],
      5,
    ),
  ],
  t: [
    { a: [1.5, 104], t: "Increment", tone: "bull", big: true },
    { a: [6.5, 104], t: "Decrement", tone: "bear", big: true },
    { a: [1.5, 3], t: "each candle bigger" },
    { a: [6.5, 3], t: "each candle smaller" },
  ],
};

const disorderFlow = {
  alt: "Three green candles that go small, big, small and three red candles that go big, small, big: order flow is not kept, so it is disorder flow",
  cap: "Disorder flow: the candles are not steadily growing or shrinking — small, big, small (or big, small, big). The flow is not maintained.",
  dx: 42,
  x0: 40,
  c: [
    ...seq([
      [30, 38, 40, 28],
      [38, 60, 63, 36],
      [60, 66, 69, 58],
    ]),
    ...seq(
      [
        [86, 60, 89, 58],
        [60, 54, 62, 52],
        [54, 24, 57, 22],
      ],
      5,
    ),
  ],
  t: [
    { a: [3.5, 104], t: "Order flow broken → disorder flow", tone: "amber", big: true },
    { a: [1, 8], t: "small → big → small" },
    { a: [6, 8], t: "big → small → big" },
  ],
};

const strongMarket = {
  alt: "Four strong green candles in a row and four strong red candles in a row, each group marked as a strong market",
  cap: "Strong market: at least three strong candles together. One strong candle proves little, like a single stick; several together are hard to break.",
  dx: 38,
  x0: 28,
  c: [
    ...seq([
      [20, 32, 36, 16],
      [32, 46, 50, 28],
      [46, 62, 66, 42],
      [62, 76, 80, 58],
    ]),
    ...mirrorSeq(
      [
        [20, 32, 36, 16],
        [32, 46, 50, 28],
        [46, 62, 66, 42],
        [62, 76, 80, 58],
      ],
      5,
    ),
  ],
  l: [
    { a: [-0.4, 8], b: [3.4, 8], k: "thin", tone: "bull" },
    { a: [4.6, 8], b: [8.4, 8], k: "thin", tone: "bear" },
  ],
  t: [
    { a: [1.5, 104], t: "Strong buyer market", tone: "bull", big: true },
    { a: [6.5, 104], t: "Strong seller market", tone: "bear", big: true },
    { a: [1.5, 0], t: "3 or more strong candles", tone: "bull" },
    { a: [6.5, 0], t: "3 or more strong candles", tone: "bear" },
  ],
};

const pressureMarket = {
  alt: "Three green candles with long lower wicks and three red candles with long upper wicks, each group a pressure market",
  cap: "Pressure candles: a buyer candle with a long lower wick, a seller candle with a long upper wick. Three or more together make a pressure market.",
  dx: 42,
  x0: 56,
  c: [
    ...seq([
      [30, 42, 46, 12],
      [42, 54, 57, 24],
      [54, 66, 69, 36],
    ]),
    ...mirrorSeq(
      [
        [30, 42, 46, 12],
        [42, 54, 57, 24],
        [54, 66, 69, 36],
      ],
      5,
    ),
  ],
  l: [
    { a: [-0.4, 4], b: [2.4, 4], k: "thin", tone: "bull" },
    { a: [4.6, 4], b: [7.4, 4], k: "thin", tone: "bear" },
  ],
  t: [
    { a: [1, 108], t: ["Buyer pressure market", "long lower wicks"], tone: "bull", big: true },
    { a: [6, 108], t: ["Seller pressure market", "long upper wicks"], tone: "bear", big: true },
    { a: [1, -4], t: "3 or more pressure candles", tone: "bull" },
    { a: [6, -4], t: "3 or more pressure candles", tone: "bear" },
  ],
};

const weakMarket = {
  alt: "Three weak green candles with long upper wicks and three weak red candles with long lower wicks, each group a weak market",
  cap: "Weak market: three or more weak candles together. A buyer market made of weak buyer candles is a weak buyer side, and the same for sellers.",
  dx: 38,
  x0: 28,
  c: [
    ...seq([
      [30, 36, 60, 28],
      [36, 42, 66, 34],
      [42, 48, 72, 40],
    ]),
    ...mirrorSeq(
      [
        [30, 36, 60, 28],
        [36, 42, 66, 34],
        [42, 48, 72, 40],
      ],
      5,
    ),
  ],
  l: [
    { a: [-0.4, 14], b: [2.4, 14], k: "thin", tone: "bull" },
    { a: [4.6, 14], b: [7.4, 14], k: "thin", tone: "bear" },
  ],
  t: [
    { a: [1, 104], t: "Weak buyer market", tone: "bull", big: true },
    { a: [6, 104], t: "Weak seller market", tone: "bear", big: true },
    { a: [1, 5], t: "3 or more weak candles", tone: "bull" },
    { a: [6, 5], t: "3 or more weak candles", tone: "bear" },
  ],
};

const marketStrength = {
  alt: "Two groups of five candles with example scores: an average above 6.5 is a strong market, an average below 6 is a weak market",
  cap: "Market strength by numbering (example scores): a strong or pressure candle is worth 10, weaker candles get fewer points. Average above 6.5 = strong market, below 6 = weak market.",
  dx: 36,
  x0: 24,
  c: [
    ...seq([
      [20, 32, 36, 16],
      [32, 46, 52, 28],
      [46, 50, 70, 44],
      [50, 64, 68, 46],
      [64, 72, 80, 60],
    ]),
    ...seq(
      [
        [70, 60, 76, 52],
        [60, 58, 74, 56],
        [58, 46, 62, 44],
        [46, 44, 62, 40],
        [44, 36, 50, 32],
      ],
      5.5,
    ),
  ],
  t: [
    { a: [2, 104], t: "Average 7.8 → strong market", tone: "bull", big: true },
    { a: [7.5, 104], t: "Average 5.2 → weak market", tone: "bear", big: true },
    ...[10, 8, 5, 9, 7].map((n, k) => ({ a: [k, 6], t: String(n), tone: "text" })),
    ...[6, 4, 8, 3, 5].map((n, k) => ({ a: [5.5 + k, 6], t: String(n), tone: "text" })),
  ],
};

const trend = {
  alt: "An uptrend with higher highs and higher lows, a downtrend with lower highs and lower lows, and a sideways trend",
  cap: "Trend: price moving mainly up (higher highs, higher lows), down (lower highs, lower lows), or sideways.",
  dx: 38,
  x0: 18,
  p: [
    { pts: [[0, 12], [0.8, 38], [1.3, 26], [2.2, 56], [2.7, 44], [3.4, 76]], tone: "bull" },
    { pts: [[4.1, 80], [4.7, 56], [5.2, 66], [5.9, 38], [6.4, 48], [7, 22]], tone: "bear" },
    { pts: [[7.6, 50], [8, 70], [8.4, 44], [8.8, 70], [9.2, 44], [9.5, 58]], tone: "soft" },
  ],
  t: [
    { a: [1.7, 100], t: "Uptrend", tone: "bull", big: true },
    { a: [5.5, 100], t: "Downtrend", tone: "bear", big: true },
    { a: [8.5, 100], t: "Sideways", big: true },
    { a: [0.8, 38], t: "H", dy: -7 },
    { a: [1.3, 26], t: "HL", tone: "bull", dy: 16 },
    { a: [2.2, 56], t: "HH", tone: "bull", dy: -7 },
    { a: [2.7, 44], t: "HL", tone: "bull", dy: 16 },
    { a: [3.4, 76], t: "HH", tone: "bull", dy: -7 },
    { a: [5.2, 66], t: "LH", tone: "bear", dy: -7 },
    { a: [5.9, 38], t: "LL", tone: "bear", dy: 16 },
    { a: [6.4, 48], t: "LH", tone: "bear", dy: -7 },
    { a: [7, 22], t: "LL", tone: "bear", dy: 16 },
  ],
};

const openArea = {
  alt: "In an uptrend the open area is the empty space ahead above the last high; in a downtrend it is the empty space below the last low",
  cap: "Open area: the empty space ahead of the trend that price tends to go and fill. Up trend: above the last high. Down trend: below the last low.",
  dx: 36,
  x0: 16,
  p: [
    { pts: [[0, 12], [0.8, 38], [1.3, 28], [2.1, 56], [2.6, 46], [3.4, 76]], tone: "bull" },
    { pts: [[5.3, 90], [6, 66], [6.5, 74], [7.3, 46], [7.8, 54], [8.5, 28]], tone: "bear" },
  ],
  z: [
    { a: [3.6, 66], b: [4.9, 96], tone: "amber" },
    { a: [8.7, 6], b: [9.9, 34], tone: "amber" },
  ],
  ar: [
    { a: [3.4, 76], b: [3.9, 83], tone: "amber" },
    { a: [8.5, 28], b: [9, 20], tone: "amber" },
  ],
  t: [
    { a: [2, 104], t: "Uptrend → open area above", tone: "bull", big: true },
    { a: [7.4, 104], t: "Downtrend → open area below", tone: "bear", big: true },
    { a: [4.25, 81], t: ["OPEN", "AREA"], tone: "amber" },
    { a: [9.3, 22], t: ["OPEN", "AREA"], tone: "amber" },
  ],
};

const reflection = (() => {
  const lo = (i) => 10 + 4.667 * i;
  const up = (i) => 42 + 4.667 * i;
  const B = [0.6, 3, 5.7, 8.4].map((i) => [i, lo(i)]);
  const S = [1.8, 4.4, 7.2].map((i) => [i, up(i)]);
  return {
    alt: "Two rising trend lines with price bouncing between them: buyers at the lower line, sellers at the upper line; the strong structure on the left repeats on the right",
    cap: "Reflection: a strong structure on the left (B = buyer, S = seller) shows up again on the right when price returns to the trend line.",
    dx: 40,
    x0: 20,
    l: [
      { a: [0, lo(0)], b: [9.2, lo(9.2)], k: "trend", tone: "soft" },
      { a: [0, up(0)], b: [9.2, up(9.2)], k: "trend", tone: "soft" },
    ],
    p: [{ pts: [B[0], S[0], B[1], S[1], B[2], S[2], B[3]], tone: "text" }],
    o: [
      { a: B[2], r: 11, tone: "amber" },
      { a: B[3], r: 11, tone: "amber" },
    ],
    t: [
      ...B.map((p) => ({ a: p, t: "B", tone: "bull", dy: 18, big: true })),
      ...S.map((p) => ({ a: p, t: "S", tone: "bear", dy: -10, big: true })),
      { a: [0.1, 104], t: ["Strong structure on the left (B, S, B, S...)", "reflects on the right at the trend line"], anchor: "start", tone: "amber" },
    ],
  };
})();

const pressureReflection = {
  alt: "Three buyer pressure candles with long lower wicks pushing straight through a resistance level without bouncing",
  cap: "Pressure reflection: unlike a normal reflection, a buyer pressure market does not bounce off resistance — it breaks the level and goes through, so its reflection comes much later.",
  dx: 44,
  x0: 34,
  c: seq([
    [30, 42, 46, 12],
    [42, 54, 57, 24],
    [54, 70, 73, 36],
    [70, 80, 84, 64],
    [80, 90, 94, 76],
  ]),
  l: [{ a: [-0.5, 62], b: [5, 62], tone: "amber" }],
  t: [
    { a: [2, 104], t: "Buyer pressure market", tone: "bull", big: true },
    { a: [4.9, 62], t: "Resistance", tone: "amber", anchor: "end", dy: 14 },
    { a: [1.6, 22], t: ["Pressure breaks the level and keeps going;", "its reflection comes much later"], tone: "soft", anchor: "start" },
  ],
  ar: [{ a: [3.2, 60], b: [3.8, 80], tone: "bull" }],
};

const weakReflection = {
  alt: "Left: a weak market followed by a strong entry, which is skipped because the reference was weak. Right: a strong market, a small pullback and a strong entry, which can be traded",
  cap: "Weak reflection: if the structure behind is weak, a strong entry on the right is not traded — the reference was weak. If the structure behind is strong, it can be traded with the open area and time filter.",
  dx: 38,
  x0: 22,
  c: [
    ...seq([
      [30, 36, 60, 28],
      [36, 42, 66, 34],
      [42, 46, 70, 38],
      [40, 64, 68, 36],
    ]),
    ...seq(
      [
        [20, 32, 36, 16],
        [32, 46, 50, 28],
        [46, 60, 64, 42],
        [60, 54, 62, 52],
        [54, 76, 80, 50],
      ],
      4.8,
    ),
  ],
  o: [
    { a: [3, 52], r: 15, tone: "bear" },
    { a: [8.8, 66], r: 15, tone: "bull" },
  ],
  t: [
    { a: [1.5, 104], t: "Weak behind → skip", tone: "bear", big: true },
    { a: [6.8, 104], t: "Strong behind → trade", tone: "bull", big: true },
    { a: [1.5, 12], t: ["weak candles, then a strong entry", "reference was weak"], tone: "bear" },
    { a: [6.8, 8], t: ["strong market, pullback,", "strong entry"], tone: "bull" },
  ],
};

const direction = {
  alt: "Time frame filter: to trade the 1 minute chart, check 15 and 30 minutes; to trade the 5 minute chart, check 1 hour and 4 hours",
  cap: "Directionalism: the confirmation time frames are about 15× the trading time frame. Confirm direction and open area there first, then trade the small time frame.",
  rects: [
    { x: 20, y: 52, w: 92, h: 44, t: ["15 min", "trend + open area"], tone: "text" },
    { x: 124, y: 52, w: 92, h: 44, t: ["30 min", "trend + open area"], tone: "text" },
    { x: 258, y: 52, w: 122, h: 44, t: ["Trade on", "the 1 min chart"], tone: "bull" },
    { x: 20, y: 134, w: 92, h: 44, t: ["1 hour", "trend + open area"], tone: "text" },
    { x: 124, y: 134, w: 92, h: 44, t: ["4 hour", "trend + open area"], tone: "text" },
    { x: 258, y: 134, w: 122, h: 44, t: ["Trade on", "the 5 min chart"], tone: "bull" },
  ],
  ar: [
    { px: true, a: [218, 74], b: [254, 74], tone: "amber" },
    { px: true, a: [218, 156], b: [254, 156], tone: "amber" },
  ],
  t: [
    { px: true, a: [200, 26], t: "Check the bigger time frames first (about 15× the trading one)", tone: "amber", big: true },
    { px: true, a: [200, 112], t: "Both agree on direction and open area → trade that way", tone: "soft" },
    { px: true, a: [200, 208], t: "If they disagree, no trade", tone: "bear" },
  ],
};

/* ------------------------------------------------------------------ */
/* Traps                                                               */
/* ------------------------------------------------------------------ */

const trapOne = {
  alt: "A green candle with a long upper wick where sellers are exhausted (trade), and a green candle whose body is only a sliver of the wick (skip)",
  cap: "Trap 1: a buyer candle's upper wick means the sellers were exhausted inside it. Trade it with the open area and order flow — but skip it when the body is 30% or less of the wick.",
  dx: 170,
  x0: 100,
  c: [
    [50, 70, 84, 46, { i: 0 }],
    [60, 64, 92, 58, { i: 1 }],
  ],
  t: [
    { a: [0, 24], t: ["Trap 1: sellers exhausted", "in the upper wick", "→ buy side (open area + order flow)"], tone: "bull" },
    { a: [1, 24], t: ["Body ≤ 30% of the wick:", "sellers still pressing", "→ skip"], tone: "bear" },
    { a: [0.16, 82], t: "sellers die here", tone: "amber", anchor: "start", dx: 6 },
    { a: [0, 104], t: "Take", tone: "bull", big: true },
    { a: [1, 104], t: "Skip", tone: "bear", big: true },
  ],
};

const trapAbsent = (() => {
  const lineV = (i) => 44 + 6 * i;
  return {
    alt: "Price rising toward a resistance trend line where sellers are expected, but a small strong green candle appears instead: the seller is absent",
    cap: "Absent trap: sellers should enter at the resistance trend line, but a small strong buyer candle appears instead. The seller is absent, so the buyer wins there. Ignore it if order flow is shrinking or the candle is weak.",
    dx: 40,
    x0: 24,
    c: seq([
      [24, 36, 40, 20],
      [36, 32, 44, 28],
      [32, 50, 54, 30],
      [50, 46, 58, 42],
      [46, 64, 68, 44],
      [64, 60, 72, 56],
      [60, 76, 80, 58],
      [76, 86, 92, 70],
    ]),
    l: [{ a: [0, lineV(0)], b: [8.2, lineV(8.2)], k: "trend", tone: "bear" }],
    o: [{ a: [7, 86], r: 16, tone: "amber" }],
    t: [
      { a: [0, 102], t: "Resistance trend line: a seller is expected here", tone: "bear", anchor: "start", dx: -10 },
      { a: [7, 8], t: ["Small strong buyer candle:", "seller absent"], tone: "amber", anchor: "middle", dx: -10 },
    ],
  };
})();

const trapTwo = {
  alt: "In an uptrend a weak red candle with a small body and an upper wick is exhausted, and price continues up",
  cap: "Trap 2 (dead trap): in an uptrend the weak side dies out. A seller candle with no wick, only an upper wick, or a body of 30% or less is exhausted.",
  dx: 44,
  x0: 34,
  c: seq([
    [20, 34, 38, 16],
    [34, 50, 54, 30],
    [50, 44, 58, 42],
    [44, 62, 66, 42],
    [62, 78, 82, 58],
  ]),
  o: [{ a: [2, 50], r: 17, tone: "amber" }],
  t: [
    { a: [2, 104], t: "Uptrend: buyers strong, sellers weak", tone: "bull", big: true },
    { a: [2, 18], t: ["Weak seller candle: exhausted", "(no wick / upper wick / body ≤ 30%)"], tone: "amber" },
    { a: [4, 90], t: "continues up", tone: "bull" },
  ],
  ar: [{ a: [3.7, 82], b: [4.4, 92], tone: "bull" }],
};

const trapFour = {
  alt: "Candles with long lower wicks show the market went down first and collected liquidity, then pushed up",
  cap: "Trap 4 (liquidity collection): long lower wicks mean the market first went down, collected the orders there, then pushed up.",
  dx: 44,
  x0: 34,
  c: seq([
    [40, 52, 54, 20],
    [52, 46, 56, 22],
    [46, 60, 62, 26],
    [60, 54, 64, 34],
    [54, 72, 76, 50],
    [72, 86, 90, 70],
  ]),
  o: [
    { a: [0, 20], r: 8, tone: "amber" },
    { a: [1, 22], r: 8, tone: "amber" },
    { a: [2, 26], r: 8, tone: "amber" },
  ],
  t: [
    { a: [1, 8], t: "liquidity collected below", tone: "amber" },
    { a: [4, 104], t: "Then price is pushed up", tone: "bull", big: true },
  ],
  ar: [{ a: [4.4, 40], b: [5.4, 64], tone: "bull" }],
};

const trapFive = {
  alt: "A big candle breaks above a seller zone; on the low time frame price takes the liquidity and the structure changes, giving a down trade",
  cap: "Trap 5: a big candle breaks a seller zone or trend line to take liquidity. Check the area chart or 5 seconds: if the structure changes, trade the other way.",
  dx: 40,
  x0: 24,
  c: seq([
    [30, 40, 44, 26],
    [40, 34, 46, 30],
    [34, 46, 50, 32],
    [46, 40, 52, 36],
    [40, 56, 60, 38],
    [50, 86, 92, 46],
  ]),
  z: [
    { a: [-0.5, 70], b: [5.5, 76], tone: "bear" },
    { a: [-0.5, 18], b: [5.5, 24], tone: "bull" },
  ],
  p: [{ pts: [[6.3, 58], [6.7, 76], [7.1, 68], [7.5, 82], [7.9, 74], [8.2, 62], [8.6, 40]], tone: "text" }],
  o: [{ a: [5, 92], r: 14, tone: "amber" }],
  t: [
    { a: [2, 104], t: "Trap 5 candle breaks the zone", tone: "amber", big: true },
    { a: [0.2, 84], t: "Seller zone", tone: "bear", anchor: "start" },
    { a: [0.2, 8], t: "Buyer zone", tone: "bull", anchor: "start" },
    { a: [7.4, 106], t: ["Low time frame:", "liquidity taken,", "structure changes"], tone: "soft", dy: 0 },
    { a: [8.3, 22], t: "Down trade", tone: "bear" },
  ],
  ar: [{ a: [8.6, 34], b: [8.6, 28], tone: "bear" }],
};

const trapSix = {
  alt: "Price climbs in jerks, pushing through a seller zone, then the structure changes and it falls",
  cap: "Trap 6: the same as Trap 5, but the candle is built in jerks, collecting liquidity step by step on the way through the level. Confirm with the area chart or 5 seconds.",
  dx: 40,
  x0: 24,
  z: [{ a: [-0.5, 68], b: [8.8, 74], tone: "bear" }],
  p: [
    { pts: [[0, 20], [1, 38], [1.4, 30], [2.4, 52], [2.8, 44], [3.8, 70], [4.2, 62], [5.2, 86]], tone: "bull" },
    { pts: [[5.2, 86], [5.8, 72], [6.2, 78], [7.2, 46]], tone: "bear" },
  ],
  t: [
    { a: [3, 104], t: "Built in jerks, taking liquidity", tone: "amber", big: true },
    { a: [0.2, 82], t: "Seller zone", tone: "bear", anchor: "start" },
    { a: [7.2, 30], t: "Structure changed → down", tone: "bear" },
  ],
  ar: [{ a: [7.2, 56], b: [7.2, 44], tone: "bear" }],
};

const miniZone = {
  alt: "A small zone where green and red candles alternate, with the rules for strong versus weak sides",
  cap: "Mini zone: when both sides are equally strong (or equally weak), price ranges red-green-red-green. Trade inside it until the zone is filled up.",
  dx: 44,
  x0: 34,
  c: seq([
    [30, 38, 42, 26],
    [38, 30, 42, 26],
    [30, 38, 42, 26],
    [38, 30, 42, 26],
    [30, 38, 42, 26],
    [38, 30, 42, 26],
    [30, 38, 42, 26],
    [38, 30, 42, 26],
  ]),
  z: [{ a: [-0.5, 24], b: [7.5, 44], tone: "amber" }],
  t: [
    { a: [0, 100], t: "strong vs strong → range", anchor: "start", dx: -20 },
    { a: [0, 91], t: "weak vs weak → range", anchor: "start", dx: -20 },
    { a: [0, 82], t: "strong vs weak → price goes the strong way", anchor: "start", dx: -20 },
    { a: [3.5, 12], t: "Mini zone: trade the red-green swings until it is filled", tone: "amber" },
  ],
};

const influence = {
  alt: "Green candles rising toward a seller zone with upper wicks that grow longer, showing buyer weakness; the opposite side is coming",
  cap: "Influence and hints: near a seller zone the buyer candles grow long upper wicks. That weakness is an early warning — do not use buyer traps here; wait for the opposite party.",
  dx: 44,
  x0: 34,
  c: seq([
    [20, 30, 34, 16],
    [30, 40, 48, 28],
    [40, 50, 62, 38],
    [50, 58, 76, 48],
    [58, 64, 86, 56],
  ]),
  z: [{ a: [2.2, 66], b: [8.6, 92], tone: "bear" }],
  t: [
    { a: [5.4, 99], t: "Seller zone", tone: "bear", anchor: "start" },
    { a: [2, 6], t: "Upper wicks grow near the zone = buyer weakness (influence)", tone: "amber", anchor: "start", dx: -40 },
    { a: [8.8, 34], t: ["No buyer trap here:", "wait for the sellers"], tone: "bear", anchor: "end" },
  ],
  ar: [{ a: [7.2, 64], b: [7.2, 46], tone: "bear" }],
};

const liquidityBasic = {
  alt: "Order bars: a liquid market with many buy and sell orders on both sides, and an illiquid market with only a few",
  cap: "Liquidity: how easily you can buy or sell. Many buyers and sellers (many orders) = liquid. Few orders = illiquid and hard to trade.",
  rects: [
    ...[84, 70, 56, 42, 28].map((w, k) => ({ x: 100 - w, y: 56 + k * 22, w, h: 16, tone: "bull", fill: true })),
    ...[28, 42, 56, 70, 84].map((w, k) => ({ x: 104, y: 56 + k * 22, w, h: 16, tone: "bear", fill: true })),
    ...[22, 12].map((w, k) => ({ x: 300 - w, y: 100 + k * 22, w, h: 16, tone: "bull", fill: true })),
    ...[12, 22].map((w, k) => ({ x: 304, y: 100 + k * 22, w, h: 16, tone: "bear", fill: true })),
  ],
  t: [
    { px: true, a: [102, 32], t: "Liquid: many orders", big: true, tone: "text" },
    { px: true, a: [302, 32], t: "Illiquid: few orders", big: true, tone: "text" },
    { px: true, a: [60, 188], t: "buyers", tone: "bull" },
    { px: true, a: [146, 188], t: "sellers", tone: "bear" },
    { px: true, a: [302, 188], t: ["few orders:", "hard to trade"], tone: "soft" },
  ],
};

const sweep = (flipIt) => {
  const base = [
    [48, 56, 60, 44],
    [56, 64, 68, 54],
    [64, 60, 70, 56],
    [60, 68, 72, 58],
    [68, 66, 74, 62],
    [66, 84, 90, 64],
    [84, 60, 86, 56],
    [60, 44, 62, 40],
    [44, 30, 46, 28],
  ];
  const cs = flipIt ? mirrorSeq(base) : seq(base);
  const tone = flipIt ? "bull" : "bear";
  const f = (v) => (flipIt ? 100 - v : v);
  return {
    alt: flipIt
      ? "Retail traders buy at a support zone with stops just below; price is pushed down through the zone to hit the stops, then rises"
      : "Retail traders sell at a resistance zone with stops just above; price is pushed up through the zone to hit the stops, then falls",
    cap: flipIt
      ? "Buy-side hunt: many retail traders buy at support with their stop-loss below. Price is pushed down through the zone, takes those orders (liquidity), then goes up."
      : "Sell-side hunt: many retail traders sell at resistance with their stop-loss above. Price is pushed up through the zone, takes those orders (liquidity), then drops.",
    dx: 40,
    x0: 28,
    c: cs,
    z: [{ a: [-0.5, f(70)], b: [8.6, f(78)], tone }],
    l: [{ a: [4.4, f(86)], b: [8.6, f(86)], tone: "amber" }],
    o: [{ a: [5, f(90)], r: 14, tone: "amber" }],
    t: [
      { a: [0.2, flipIt ? 12 : 86], t: flipIt ? "Support zone: retail buys here" : "Resistance zone: retail sells here", tone, anchor: "start" },
      { a: [8.6, f(92)], t: "stop-losses = liquidity", tone: "amber", anchor: "end", dy: flipIt ? 14 : -4 },
      { a: [4.6, f(12)], t: flipIt ? "then price rises" : "then price drops", tone: "soft" },
    ],
    ar: [flipIt ? { a: [8, 70], b: [8, 84], tone } : { a: [8, 30], b: [8, 16], tone }],
  };
};

const pressureGenerate = {
  alt: "Candles with long upper wicks show selling pressure; price goes up to collect those sells and then moves down",
  cap: "Pressure generate: where long upper wicks show selling pressure, price first goes up to collect those sells (liquidity) and then moves in the pressure's direction — down.",
  dx: 44,
  x0: 34,
  c: seq([
    [50, 58, 76, 48],
    [58, 54, 78, 50],
    [54, 60, 79, 52],
    [60, 76, 84, 58],
    [76, 56, 80, 52],
    [56, 40, 58, 38],
    [40, 28, 42, 26],
  ]),
  o: [{ a: [3, 84], r: 13, tone: "amber" }],
  t: [
    { a: [0, 94], t: "selling pressure (long upper wicks)", tone: "bear", anchor: "start", dx: -12 },
    { a: [3, 100], t: "price goes up and collects those sells", tone: "amber", dx: 40 },
    { a: [4.2, 14], t: ["then it moves the way the", "pressure points: down"], tone: "bear", anchor: "start" },
  ],
  ar: [{ a: [6, 24], b: [6, 14], tone: "bear" }],
};

const measure = (flipIt) => {
  const f = (v) => (flipIt ? 100 - v : v);
  const P = (i, v) => [i, f(v)];
  const tone = flipIt ? "bear" : "bull";
  return {
    alt: flipIt
      ? "In a downtrend the first leg is measured and projected from the next pullback to estimate how far supply will push"
      : "In an uptrend the first leg is measured and projected from the next pullback to estimate how far demand will push",
    cap: flipIt
      ? "Supply measurement (downtrend): measure the size of the leg from A and add it from B to estimate where price may go. Then do the same from B to C."
      : "Demand measurement (uptrend): measure the size of the leg from A and add it from B to estimate where price may go. Then do the same from B to C.",
    dx: 38,
    x0: 20,
    p: [{ pts: [P(0.3, 14), P(2.2, 40), P(3.4, 26), P(5.6, 54), P(6.8, 40)], tone }],
    l: [
      { a: P(3.4, 26), b: P(5.4, 52), k: "level", tone: "amber" },
      { a: P(6.8, 40), b: P(8.8, 68), k: "level", tone: "amber" },
    ],
    o: [
      { a: P(5.4, 52), r: 6, tone: "amber" },
      { a: P(8.8, 68), r: 6, tone: "amber" },
    ],
    t: [
      { a: P(0.3, 14), t: "A", big: true, tone, dy: flipIt ? -10 : 20 },
      { a: P(3.4, 26), t: "B", big: true, tone, dy: flipIt ? -10 : 20 },
      { a: P(6.8, 40), t: "C", big: true, tone, dy: flipIt ? -10 : 20 },
      { a: P(1.2, 44), t: "leg A", tone: "soft", anchor: "end", dx: -6, dy: flipIt ? 14 : -4 },
      { a: P(5.1, 56), t: "target from B", tone: "amber", anchor: "end", dx: -8, dy: flipIt ? 14 : -4 },
      { a: P(8.8, 74), t: "target from C", tone: "amber", anchor: "end", dx: -10, dy: flipIt ? 14 : -4 },
      { a: [4.6, flipIt ? 4 : 100], t: flipIt ? "Measure each leg, project it from the next pullback" : "Measure each leg, project it from the next pullback", tone: "text", big: true },
    ],
  };
};

const areaFill = {
  alt: "Price was expected to reach a measured target but turned back early; the part that was not filled is added to supply above",
  cap: "Area fill-up: if price does not reach the measured demand area and turns down, the part it did not fill is not demand any more — it is added to the supply above.",
  dx: 38,
  x0: 20,
  p: [{ pts: [[0.3, 14], [2.2, 40], [3.4, 26], [5.2, 44], [6.4, 24], [7.6, 10]], tone: "bull" }],
  l: [{ a: [3.4, 26], b: [5.4, 52], k: "level", tone: "amber" }],
  z: [{ a: [4.6, 44], b: [6.2, 52], tone: "amber" }],
  t: [
    { a: [0.3, 14], t: "A", big: true, tone: "bull", dy: 20 },
    { a: [3.4, 26], t: "B", big: true, tone: "bull", dy: 20 },
    { a: [6.6, 56], t: ["unfilled demand:", "added to supply"], tone: "amber", anchor: "start" },
    { a: [3.6, 100], t: "Measured target not reached → price turns down", tone: "text", big: true },
  ],
  ar: [{ a: [6.4, 40], b: [6.9, 22], tone: "bear" }],
};

const fiveSec = {
  alt: "Left: the 1 minute chart says up. Right: the 5 second chart makes lower highs and lower lows, then turns up with a higher high: confirmation for an up trade",
  cap: "5-second confirmation: the 1-minute chart says up but you are unsure about the running candle. Look at 5 seconds — if the structure turns up, take the up trade; if it stays down, skip.",
  dx: 38,
  x0: 20,
  c: seq([
    [20, 34, 38, 16],
    [34, 48, 52, 30],
    [48, 62, 66, 44],
    [62, 76, 80, 58],
  ]),
  l: [{ px: true, a: [190, 30], b: [190, 200], k: "thin", tone: "soft" }],
  p: [{ pts: [[5.5, 80], [6, 60], [6.4, 70], [6.9, 46], [7.3, 56], [7.8, 36], [8.2, 62], [8.6, 52], [9, 78]], tone: "text" }],
  t: [
    { a: [1.5, 104], t: "1 minute: up", tone: "bull", big: true },
    { a: [7.4, 104], t: "5 seconds: structure turns up", tone: "bull", big: true },
    { a: [7, 12], t: ["lower highs, lower lows... then a higher high", "= confirmed, take the up trade"], tone: "soft" },
    { a: [0, 8], t: ["unsure about the running candle?", "go to 5 seconds"], tone: "amber", anchor: "start", dx: -10 },
  ],
  ar: [{ a: [8.6, 60], b: [9, 72], tone: "bull" }],
};

const optimalPressure = {
  alt: "On the 5 second chart the buyer candles are big and the seller pullbacks are small; the trade is taken in the middle of the running green candle",
  cap: "Optimal pressure: one side's candles are big (dominance) and the other side's pullbacks are small. Then you can trade in the middle of the candle; price should close above your entry.",
  dx: 44,
  x0: 40,
  c: seq([
    [20, 40, 44, 18],
    [40, 34, 42, 32],
    [34, 58, 62, 32],
    [58, 52, 60, 50],
    [52, 76, 80, 50],
  ]),
  l: [{ a: [3.5, 64], b: [4.8, 64], tone: "amber" }],
  t: [
    { a: [2, 104], t: "5 seconds: buyers dominate", tone: "bull", big: true },
    { a: [1, 14], t: ["big buyer candles,", "small seller pullbacks"], tone: "soft" },
    { a: [4.6, 64], t: ["Entry: middle", "of the candle"], tone: "amber", anchor: "start", dx: 28, dy: 4 },
  ],
  ar: [{ a: [6.5, 64], b: [4.9, 64], tone: "amber" }],
};

/* ------------------------------------------------------------------ */
/* Price action patterns                                                */
/* ------------------------------------------------------------------ */

const reaction = {
  alt: "Price falls to a level and a long-wick green candle rejects it; later price returns to the same level and buyers act again",
  cap: "Candle reaction: price rejected the level once (a long lower wick). When price comes back to that level, buy — buyers showed up there before.",
  dx: 42,
  x0: 34,
  c: seq([
    [90, 76, 92, 72],
    [76, 64, 78, 60],
    [64, 48, 66, 44],
    [48, 56, 58, 38],
    [56, 52, 58, 40],
    [52, 70, 74, 40],
    [78, 60, 80, 56],
    [60, 44, 62, 40],
  ]),
  l: [{ a: [-0.4, 40], b: [8.4, 40], tone: "amber" }],
  t: [
    { a: [0.6, 30], t: "Level (example: 85)", tone: "amber", anchor: "start" },
    { a: [4, 104], t: "Price rejected the level before", tone: "text", big: true },
    { a: [8.4, 18], t: ["Comes back to the level:", "buyers were here → up trade"], tone: "bull", anchor: "end" },
  ],
  ar: [{ a: [7, 36], b: [7, 24], tone: "bull" }],
};

const roundNumber = {
  alt: "In an uptrend a round number works as resistance; in a downtrend a round number works as support",
  cap: "Round numbers (50, 100, 500, 1000...) act like levels: resistance in an uptrend and in a range, support in a downtrend.",
  dx: 36,
  x0: 16,
  p: [
    { pts: [[0, 20], [1, 45], [1.5, 36], [2.5, 66], [3, 50], [3.8, 64]], tone: "bull" },
    { pts: [[5.6, 80], [6.4, 54], [6.9, 62], [7.8, 34], [8.3, 46], [9.1, 30]], tone: "bear" },
  ],
  l: [
    { a: [0, 70], b: [4.6, 70], tone: "amber" },
    { a: [5.4, 26], b: [9.8, 26], tone: "amber" },
  ],
  t: [
    { a: [2, 104], t: "Uptrend", tone: "bull", big: true },
    { a: [7.6, 104], t: "Downtrend", tone: "bear", big: true },
    { a: [0, 76], t: "round number = resistance", tone: "amber", anchor: "start" },
    { a: [9.8, 16], t: "round number = support", tone: "amber", anchor: "end" },
  ],
};

const mw = (() => {
  const M = [[0, 20], [1.2, 70], [2, 45], [2.8, 70], [4.2, 22]];
  const W = M.map(([i, v]) => [i + 5.3, 100 - v]);
  return {
    alt: "An M pattern: double top then a neckline break with the open point as target. A W pattern: the mirror",
    cap: "M and W patterns: a double top (M) or double bottom (W) and a neckline. First target is the neckline; once it breaks, the target is the open point where the pattern began.",
    dx: 36,
    x0: 16,
    p: [
      { pts: M, tone: "bear" },
      { pts: W, tone: "bull" },
    ],
    l: [
      { a: [1.4, 45], b: [4.4, 45], tone: "amber" },
      { a: [0, 20], b: [4.6, 20], tone: "soft" },
      { a: [6.7, 55], b: [9.7, 55], tone: "amber" },
      { a: [5.3, 80], b: [9.9, 80], tone: "soft" },
    ],
    t: [
      { a: [2, 104], t: "M: double top", tone: "bear", big: true },
      { a: [7.6, 104], t: "W: double bottom", tone: "bull", big: true },
      { a: [4.4, 49], t: "neckline", tone: "amber", anchor: "end", dy: -2 },
      { a: [4.6, 12], t: "open point (final target)", tone: "soft", anchor: "end" },
      { a: [9.7, 51], t: "neckline", tone: "amber", anchor: "end", dy: 14 },
      { a: [9.9, 88], t: "open point (final target)", tone: "soft", anchor: "end" },
    ],
  };
})();

const headShoulders = (flipIt) => {
  const base = [[0, 20], [1, 56], [1.7, 40], [2.8, 76], [3.9, 40], [4.7, 56], [5.7, 24]];
  const f = (v) => (flipIt ? 100 - v : v);
  const pts = base.map(([i, v]) => [i, f(v)]);
  const tone = flipIt ? "bull" : "bear";
  return {
    alt: flipIt
      ? "Inverted head and shoulders: two equal lower shoulders, a deeper head, and a neckline break upward"
      : "Head and shoulders: two equal shoulders and a higher head, with a neckline break downward",
    cap: flipIt
      ? "Inverted head and shoulders: when both shoulders are equal and buyers appear, trade up to the neckline; after the neckline breaks, the target is the open point."
      : "Head and shoulders: when both shoulders are equal and sellers appear, trade down to the neckline; after the neckline breaks, the target is the open point.",
    dx: 50,
    x0: 30,
    p: [{ pts, tone }],
    l: [
      { a: [1.4, f(40)], b: [6.2, f(40)], tone: "amber" },
      { a: [0, f(20)], b: [6.2, f(20)], tone: "soft" },
    ],
    t: [
      { a: [1, f(56)], t: "Left shoulder", dy: flipIt ? 18 : -8 },
      { a: [2.8, f(76)], t: "Head", dy: flipIt ? 18 : -8, tone },
      { a: [4.7, f(56)], t: "Right shoulder", dy: flipIt ? 18 : -8 },
      { a: [6.2, f(40)], t: "neckline", tone: "amber", anchor: "end", dy: flipIt ? -4 : 14 },
      { a: [6.2, f(20)], t: "open point (final target)", tone: "soft", anchor: "end", dy: flipIt ? -4 : 14 },
    ],
  };
};

export const diagrams = {
  anatomy,
  nested,
  engulfBull,
  insideBar,
  outsideBar,
  gapLevel,
  morningStar: star(false),
  eveningStar: star(true),
  momentum,
  supportZone,
  roleReversal,
  singleLevels,
  fiftyLevel,
  internalStructure,
  sellZone: wickZone(false),
  buyZone: wickZone(true),
  bounceBuy,
  strongCandle,
  weakCandle,
  symmetrical,
  orderFlow,
  disorderFlow,
  strongMarket,
  pressureMarket,
  weakMarket,
  marketStrength,
  trend,
  openArea,
  reflection,
  pressureReflection,
  weakReflection,
  direction,
  trapOne,
  trapAbsent,
  trapTwo,
  trapFour,
  trapFive,
  trapSix,
  miniZone,
  influence,
  liquidityBasic,
  sellSweep: sweep(false),
  buySweep: sweep(true),
  pressureGenerate,
  demandMeasure: measure(false),
  supplyMeasure: measure(true),
  areaFill,
  fiveSec,
  optimalPressure,
  reaction,
  roundNumber,
  mw,
  headShoulders: headShoulders(false),
  inverseHeadShoulders: headShoulders(true),
};
