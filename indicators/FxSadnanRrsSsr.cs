// FxSadnan – RRS / SSR setup finder with order-flow confirmation for ATAS.
//
// RRS (BUY):  uptrend → pullback with LOWER HIGHS (R1 = upper, R2 = lower) → the pullback ends in one
//             last RED candle = Order Block → from the OB price breaks BOTH R in one move → peak (= TP)
//             → price returns to the OB = Support zone → BUY. SL 25 pips below the OB.
// SSR (SELL): the exact mirror (higher lows, last GREEN candle, Resistance zone, SELL, SL above).
//
// Confirmation follows the "Perfect SSR & RRS Entry" post:
//   Location  – POC of the breakout leg or of the previous session sits on the zone, or a DOM wall there
//   Reaction  – absorption (big opposite delta, price holds), big volume at the zone, big volume at the
//               candle extreme, DOM wall holding (live only)
//   Trigger   – candle closes beyond the previous candle, delta flips, stacked imbalance
//   TAKE = trend + location + 2 reactions + delta flip + stacked imbalance + RR ≥ min.
//
// Install: put this file into a new Class Library (.NET 8) that references ATAS.Indicators.dll,
// OFT.Attributes.dll and OFT.Rendering.dll from the ATAS install folder, build, and copy the DLL to
// Documents\ATAS\Indicators. Educational only, not financial advice.

namespace ATAS.Indicators.Technical
{
	using System;
	using System.Collections.Generic;
	using System.ComponentModel;
	using System.ComponentModel.DataAnnotations;
	using System.Globalization;
	using System.Linq;

	using ATAS.Indicators.Drawing;

	using OFT.Attributes;
	using OFT.Rendering.Settings;

	using Color = System.Drawing.Color;
	using CrossColor = System.Windows.Media.Color;
	using CrossPen = System.Drawing.Pen;
	using CrossSolidBrush = System.Drawing.SolidBrush;

	[DisplayName("FxSadnan RRS / SSR")]
	public class FxSadnanRrsSsr : Indicator
	{
		#region Nested types

		// The SELL side works on mirrored prices (high → -low, open → -open …), so an SSR is literally an
		// RRS upside down. D = +1 for RRS, -1 for SSR; real price = D * mirrored price.
		private sealed class Side
		{
			public readonly int D;

			public Side(int d)
			{
				D = d;
			}

			public int State; // 0 scan · 1 pullback · 2 broke R2 · 3 armed, waiting return · 4 in zone
			public decimal? LastPiv;
			public int LastPivBar;
			public decimal RU, RL, Lowest, ObH, ObL, ZTop, ZBot, Sl, Peak, LastRedH, LastRedL;
			public int RUBar, RLBar, ArmBar, TouchBar;
			public int ObBar = -1, LastRedBar = -1;
			public bool NearSent, TouchSent, Absorbed, BigVolume, ExtremeAbsorb, DomWall, LegPocInZone;
			public DrawingRectangle Zone;
			public TrendLine SlLine, TpLine;

			public string Name => D == 1 ? "RRS BUY" : "SSR SELL";
		}

		#endregion

		#region Fields

		private readonly ValueDataSeries _buySignal = new("BuySignal", "Buy signal")
		{
			Color = Color.LimeGreen.Convert(),
			VisualType = VisualMode.UpArrow
		};

		private readonly ValueDataSeries _sellSignal = new("SellSignal", "Sell signal")
		{
			Color = Color.Red.Convert(),
			VisualType = VisualMode.DownArrow
		};

		private readonly Color _buyColor = Color.FromArgb(255, 34, 197, 94);
		private readonly Color _sellColor = Color.FromArgb(255, 239, 68, 68);
		private readonly Color _levelColor = Color.FromArgb(255, 245, 158, 11);

		private Side _buy = new(1);
		private Side _sell = new(-1);

		private readonly List<decimal> _emaFast = new();
		private readonly List<decimal> _emaSlow = new();
		private readonly List<decimal> _volumes = new();
		private readonly Dictionary<decimal, decimal> _sessionLevels = new();
		private decimal? _prevSessionPoc;
		private int _lastBar = -1;
		private DateTime _lastDomCheck = DateTime.MinValue;

		private int _pivotLength = 3;
		private int _maxPullbackBars = 60;
		private int _maxImpulseBars = 12;
		private decimal _obNearPct = 35;
		private int _maxWaitBars = 150;
		private int _confirmBars = 8;
		private decimal _pipSize;
		private decimal _slPips = 25;
		private decimal _proximityPips = 10;
		private decimal _invalidPips = 5;
		private decimal _minRr = 1.5m;
		private bool _useTrend = true;
		private int _fastEma = 50;
		private int _slowEma = 200;
		private decimal _absorbDeltaPct = 15;
		private decimal _bigVolumeMult = 1.5m;
		private int _imbalanceRatio = 300;
		private decimal _imbalanceMinVolume = 10;
		private int _stackedCount = 3;
		private int _zoneTolTicks = 4;
		private bool _showBuy = true;
		private bool _showSell = true;

		#endregion

		#region Properties

		[Display(Name = "Swing strength (bars each side)", GroupName = "1. Setup", Order = 10)]
		[Range(1, 50)]
		public int PivotLength { get => _pivotLength; set => Set(ref _pivotLength, value); }

		[Display(Name = "Max bars from R2 to the breakout", GroupName = "1. Setup", Order = 20)]
		[Range(5, 1000)]
		public int MaxPullbackBars { get => _maxPullbackBars; set => Set(ref _maxPullbackBars, value); }

		[Display(Name = "Max bars from OB to breaking both R (one move)", GroupName = "1. Setup", Order = 30)]
		[Range(2, 500)]
		public int MaxImpulseBars { get => _maxImpulseBars; set => Set(ref _maxImpulseBars, value); }

		[Display(Name = "OB must sit in the bottom % of the pullback", GroupName = "1. Setup", Order = 40)]
		[Range(0, 100)]
		public decimal ObNearPct { get => _obNearPct; set => Set(ref _obNearPct, value); }

		[Display(Name = "Max bars to wait for the return to the zone", GroupName = "1. Setup", Order = 50)]
		[Range(5, 5000)]
		public int MaxWaitBars { get => _maxWaitBars; set => Set(ref _maxWaitBars, value); }

		[Display(Name = "Bars to wait for confirmation after the touch", GroupName = "1. Setup", Order = 60)]
		[Range(1, 100)]
		public int ConfirmBars { get => _confirmBars; set => Set(ref _confirmBars, value); }

		[Display(Name = "Pip size (0 = auto)", GroupName = "2. Risk", Order = 10, Description = "GC / XAUUSD 0.1, 6E / EURUSD 0.0001. Set it by hand if auto is wrong for your instrument.")]
		[Range(0, 100000)]
		public decimal PipSize { get => _pipSize; set => Set(ref _pipSize, value); }

		[Display(Name = "SL pips beyond the OB", GroupName = "2. Risk", Order = 20)]
		[Range(0, 100000)]
		public decimal SlPips { get => _slPips; set => Set(ref _slPips, value); }

		[Display(Name = "Alert when price is this many pips from the zone", GroupName = "2. Risk", Order = 30)]
		[Range(0, 100000)]
		public decimal ProximityPips { get => _proximityPips; set => Set(ref _proximityPips, value); }

		[Display(Name = "Setup fails if a candle closes this far through the zone (pips)", GroupName = "2. Risk", Order = 40)]
		[Range(0, 100000)]
		public decimal InvalidPips { get => _invalidPips; set => Set(ref _invalidPips, value); }

		[Display(Name = "Min reward : risk", GroupName = "2. Risk", Order = 50)]
		[Range(0, 100)]
		public decimal MinRr { get => _minRr; set => Set(ref _minRr, value); }

		[Display(Name = "Only RRS in an uptrend / SSR in a downtrend", GroupName = "3. Trend", Order = 10)]
		public bool UseTrend { get => _useTrend; set => Set(ref _useTrend, value); }

		[Display(Name = "Fast EMA", GroupName = "3. Trend", Order = 20)]
		[Range(1, 1000)]
		public int FastEma { get => _fastEma; set => Set(ref _fastEma, value); }

		[Display(Name = "Slow EMA", GroupName = "3. Trend", Order = 30)]
		[Range(1, 1000)]
		public int SlowEma { get => _slowEma; set => Set(ref _slowEma, value); }

		[Display(Name = "Absorption: opposite delta ≥ % of candle volume", GroupName = "4. Order flow", Order = 10)]
		[Range(0, 100)]
		public decimal AbsorbDeltaPct { get => _absorbDeltaPct; set => Set(ref _absorbDeltaPct, value); }

		[Display(Name = "Big volume = this × average of 20 bars", GroupName = "4. Order flow", Order = 20)]
		[Range(0, 100)]
		public decimal BigVolumeMult { get => _bigVolumeMult; set => Set(ref _bigVolumeMult, value); }

		[Display(Name = "Imbalance ratio %", GroupName = "4. Order flow", Order = 30)]
		[Range(100, 10000)]
		public int ImbalanceRatio { get => _imbalanceRatio; set => Set(ref _imbalanceRatio, value); }

		[Display(Name = "Imbalance min volume", GroupName = "4. Order flow", Order = 40)]
		[Range(0, 1000000)]
		public decimal ImbalanceMinVolume { get => _imbalanceMinVolume; set => Set(ref _imbalanceMinVolume, value); }

		[Display(Name = "Stacked imbalance: levels in a row", GroupName = "4. Order flow", Order = 50)]
		[Range(2, 20)]
		public int StackedCount { get => _stackedCount; set => Set(ref _stackedCount, value); }

		[Display(Name = "POC near zone tolerance (ticks)", GroupName = "4. Order flow", Order = 60)]
		[Range(0, 1000)]
		public int ZoneTolTicks { get => _zoneTolTicks; set => Set(ref _zoneTolTicks, value); }

		[Display(Name = "Use live DOM walls", GroupName = "4. Order flow", Order = 70)]
		public bool UseDom { get; set; } = true;

		[Display(Name = "DOM wall = this × average level size", GroupName = "4. Order flow", Order = 80)]
		[Range(1, 100)]
		public decimal DomWallMult { get; set; } = 3;

		[Display(Name = "Show RRS (buy)", GroupName = "5. Display", Order = 10)]
		public bool ShowBuy { get => _showBuy; set => Set(ref _showBuy, value); }

		[Display(Name = "Show SSR (sell)", GroupName = "5. Display", Order = 20)]
		public bool ShowSell { get => _showSell; set => Set(ref _showSell, value); }

		[Display(Name = "Font size", GroupName = "5. Display", Order = 30)]
		[Range(6, 30)]
		public int FontSize { get; set; } = 10;

		[Display(Name = "Use alerts", GroupName = "6. Alerts", Order = 10)]
		public bool UseAlerts { get; set; } = true;

		[Display(Name = "Alert file", GroupName = "6. Alerts", Order = 20)]
		public string AlertFile { get; set; } = "alert1";

		[Display(Name = "Alert text colour", GroupName = "6. Alerts", Order = 30)]
		public CrossColor AlertForeColor { get; set; } = CrossColor.FromArgb(255, 247, 249, 249);

		[Display(Name = "Alert background", GroupName = "6. Alerts", Order = 40)]
		public CrossColor AlertBGColor { get; set; } = CrossColor.FromArgb(255, 75, 72, 72);

		#endregion

		#region ctor

		public FxSadnanRrsSsr()
			: base(true)
		{
			DenyToChangePanel = true;

			DataSeries[0] = _buySignal;
			DataSeries.Add(_sellSignal);
		}

		#endregion

		#region Protected methods

		protected override void OnCalculate(int bar, decimal value)
		{
			if (bar == 0)
				ResetAll();

			// the previous candle just closed: run the setup logic on it
			if (bar > 0 && bar != _lastBar)
			{
				_lastBar = bar;
				ProcessBar(bar - 1);
			}

			if (bar == CurrentBar - 1)
				CheckLive(bar);
		}

		#endregion

		#region Setup logic

		private void ResetAll()
		{
			_buy = new Side(1);
			_sell = new Side(-1);
			_emaFast.Clear();
			_emaSlow.Clear();
			_volumes.Clear();
			_sessionLevels.Clear();
			_prevSessionPoc = null;
			_lastBar = 0;
			Labels.Clear();
			TrendLines.Clear();
			Rectangles.Clear();
		}

		private void ProcessBar(int i)
		{
			var candle = GetCandle(i);

			UpdateEma(_emaFast, i, candle.Close, _fastEma);
			UpdateEma(_emaSlow, i, candle.Close, _slowEma);

			if (i > 0 && IsNewSession(i))
			{
				_prevSessionPoc = Poc(_sessionLevels);
				_sessionLevels.Clear();
			}

			AddLevels(_sessionLevels, i);
			_volumes.Add(candle.Volume);

			foreach (var side in new[] { _buy, _sell })
			{
				if (side.D == 1 ? _showBuy : _showSell)
					Step(side, i);

				if (C(side, i) < O(side, i))
				{
					side.LastRedBar = i;
					side.LastRedH = H(side, i);
					side.LastRedL = L(side, i);
				}
			}
		}

		private void Step(Side s, int i)
		{
			var h = H(s, i);
			var l = L(s, i);
			var o = O(s, i);
			var c = C(s, i);
			var eSlow = s.D * _emaSlow[i];
			var eFast = s.D * _emaFast[i];
			var pip = Pip();

			// 1) a new swing high: two lower highs in a row = R1 (upper) and R2 (lower)
			var p = i - _pivotLength;

			if (p - _pivotLength >= 0 && IsPivot(s, p, i))
			{
				var piv = H(s, p);

				if (s.State <= 2)
				{
					if (s.LastPiv.HasValue && piv < s.LastPiv.Value)
					{
						s.RU = s.LastPiv.Value;
						s.RUBar = s.LastPivBar;
						s.RL = piv;
						s.RLBar = p;
						s.Lowest = Enumerable.Range(i - _pivotLength + 1, _pivotLength).Min(k => L(s, k));
						s.ObBar = s.LastRedBar;
						s.ObH = s.LastRedH;
						s.ObL = s.LastRedL;
						s.State = 1;
					}
					else
						s.State = 0;
				}

				s.LastPiv = piv;
				s.LastPivBar = p;
			}

			// 2) pullback: follow the bottom, the last red candle there is the Order Block
			if (s.State == 1)
			{
				if (c > s.RL)
					s.State = 2;
				else
				{
					if (l < s.Lowest)
					{
						s.Lowest = l;

						if (c < o)
							SetOb(s, i, h, l);
						else
							SetOb(s, s.LastRedBar, s.LastRedH, s.LastRedL);
					}
					else if (c < o && l <= s.Lowest + (s.RL - s.Lowest) * _obNearPct / 100)
						SetOb(s, i, h, l);

					if (i - s.RLBar > _maxPullbackBars)
						s.State = 0;
				}
			}

			// 3) one move from the OB through both R levels
			var armedNow = false;

			if (s.State == 2)
			{
				if (s.ObBar < 0 || c < s.ObL || i - s.ObBar > _maxImpulseBars)
					s.State = 0;
				else if (c > s.RU)
				{
					if (!_useTrend || (c > eSlow && eFast > eSlow))
					{
						Arm(s, i, h);
						armedNow = true;
					}
					else
						s.State = 0;
				}
			}

			// 4) armed: wait for price to come back to the OB zone
			if (s.State == 3 && !armedNow)
			{
				if (l > s.ZTop)
				{
					s.Peak = Math.Max(s.Peak, h);

					if (!s.NearSent && l <= s.ZTop + _proximityPips * pip)
					{
						s.NearSent = true;
						Alert(s, i, $"price is {_proximityPips} pips from the zone. Get ready.");
					}

					if (i - s.ArmBar > _maxWaitBars)
						Finish(s);
				}
				else
				{
					s.State = 4;
					s.TouchBar = i;

					if (!s.TouchSent)
					{
						s.TouchSent = true;
						Alert(s, i, "price is IN the zone. Watch for absorption, then the confirmation candle.");
					}
				}
			}

			// 5) in the zone: absorption first, then aggression
			if (s.State == 4)
			{
				ReadReaction(s, i);

				if (c < s.ZBot - _invalidPips * pip)
				{
					AddLabel(s, i, "✖ zone broken, skip", Color.Gray);
					Alert(s, i, "zone broken (closed through it). Skip this setup.");
					Finish(s);
				}
				else if (c > o && c > H(s, i - 1))
					Confirm(s, i, c, eSlow, eFast);
				else if (i - s.TouchBar >= _confirmBars)
					Finish(s);
			}

			if (s.State >= 3 && s.Zone != null)
				Stretch(s, i);
		}

		private void SetOb(Side s, int bar, decimal h, decimal l)
		{
			s.ObBar = bar;
			s.ObH = h;
			s.ObL = l;
		}

		private void Arm(Side s, int i, decimal h)
		{
			s.State = 3;
			s.ArmBar = i;
			s.Peak = h;
			s.ZTop = s.ObH;
			s.ZBot = s.ObL;
			s.Sl = s.ObL - _slPips * Pip();
			s.NearSent = s.TouchSent = s.Absorbed = s.BigVolume = s.ExtremeAbsorb = s.DomWall = false;

			// location: where did the breakout leg trade the most?
			var leg = new Dictionary<decimal, decimal>();

			for (var k = s.ObBar; k <= i; k++)
				AddLevels(leg, k);

			s.LegPocInZone = InZone(s, Poc(leg));

			var col = s.D == 1 ? _buyColor : _sellColor;
			var (top, bot) = RealZone(s);

			s.Zone = new DrawingRectangle(s.ObBar, top, i + 3, bot, new CrossPen(col), new CrossSolidBrush(Color.FromArgb(45, col)));
			Rectangles.Add(s.Zone);

			var levelPen = new CrossPen(_levelColor);
			TrendLines.Add(new TrendLine(s.RUBar, s.D * s.RU, i, s.D * s.RU, levelPen));
			TrendLines.Add(new TrendLine(s.RLBar, s.D * s.RL, i, s.D * s.RL, levelPen));
			AddText($"{s.D}_r1_{i}", s.D == 1 ? "R1" : "S1", s.D == 1, s.RUBar, s.D * s.RU, 0, 0, _levelColor, Color.Transparent, Color.Transparent, FontSize, DrawingText.TextAlign.Center);
			AddText($"{s.D}_r2_{i}", s.D == 1 ? "R2" : "S2", s.D == 1, s.RLBar, s.D * s.RL, 0, 0, _levelColor, Color.Transparent, Color.Transparent, FontSize, DrawingText.TextAlign.Center);

			s.SlLine = new TrendLine(s.ObBar, s.D * s.Sl, i + 3, s.D * s.Sl, new CrossPen(Color.Red));
			s.TpLine = new TrendLine(i, s.D * s.Peak, i + 3, s.D * s.Peak, new CrossPen(Color.Teal));
			TrendLines.Add(s.SlLine);
			TrendLines.Add(s.TpLine);

			AddLabel(s, i, $"{s.Name} ready · wait for the return", col, atPeak: true);
			Alert(s, i, $"setup formed. Zone {Fmt(bot)} – {Fmt(top)}, SL {Fmt(s.D * s.Sl)}. Wait for price to return."
				+ (s.LegPocInZone ? " Leg POC is on the zone." : ""));
		}

		// Reaction at the zone: did the opposite side attack and fail?
		private void ReadReaction(Side s, int i)
		{
			var candle = GetCandle(i);

			if (L(s, i) > s.ZTop || C(s, i) < s.ZBot)
				return;

			var delta = s.D * candle.Delta;

			if (candle.Volume > 0 && delta < 0 && -delta >= candle.Volume * _absorbDeltaPct / 100)
				s.Absorbed = true;

			var avg = AverageVolume(i);

			if (avg > 0 && candle.Volume >= avg * _bigVolumeMult)
				s.BigVolume = true;

			// the busiest price of the candle is at its extreme, and the opposite side was the aggressor there
			var poc = candle.MaxVolumePriceInfo;
			var range = candle.High - candle.Low;

			if (poc != null && range > 0)
			{
				var atExtreme = s.D == 1
					? poc.Price <= candle.Low + range / 3 && poc.Bid > poc.Ask
					: poc.Price >= candle.High - range / 3 && poc.Ask > poc.Bid;

				if (atExtreme)
					s.ExtremeAbsorb = true;
			}
		}

		private void Confirm(Side s, int i, decimal c, decimal eSlow, decimal eFast)
		{
			var candle = GetCandle(i);
			var risk = c - s.Sl;
			var rr = c < s.Peak && risk > 0 ? (s.Peak - c) / risk : 0;

			var trend = c > eSlow && eFast > eSlow;
			var prevPocOnZone = _prevSessionPoc.HasValue && InZone(s, _prevSessionPoc.Value);
			var location = s.LegPocInZone || prevPocOnZone || s.DomWall;
			var reactions = (s.Absorbed ? 1 : 0) + (s.BigVolume ? 1 : 0) + (s.ExtremeAbsorb ? 1 : 0) + (s.DomWall ? 1 : 0);
			var deltaFlip = s.D * candle.Delta > 0;
			var stacked = MaxStacked(i, s.D) >= _stackedCount;
			var rrOk = rr >= _minRr;

			var score = (trend ? 1 : 0) + (location ? 1 : 0) + Math.Min(reactions, 2) + (deltaFlip ? 1 : 0) + (stacked ? 1 : 0) + (rrOk ? 1 : 0);
			var take = trend && location && reactions >= 2 && deltaFlip && stacked && rrOk;
			var verdict = take ? "TAKE ✅" : deltaFlip && score >= 5 ? "RISKY ⚠" : "SKIP ❌";

			var checks = string.Join("\n",
				$"{Mark(trend)} Trend (EMA {_fastEma}/{_slowEma})",
				$"{Mark(location)} Location: {(s.LegPocInZone ? "leg POC " : "")}{(prevPocOnZone ? "prev POC " : "")}{(s.DomWall ? "DOM wall" : "")}",
				$"{Mark(reactions >= 2)} Reaction {reactions}/4: {(s.Absorbed ? "absorption " : "")}{(s.BigVolume ? "big volume " : "")}{(s.ExtremeAbsorb ? "volume at extreme " : "")}",
				$"{Mark(deltaFlip)} Delta flipped ({candle.Delta.ToString("0", CultureInfo.InvariantCulture)})",
				$"{Mark(stacked)} Stacked imbalance (≥{_stackedCount})",
				$"{Mark(rrOk)} RR {rr.ToString("0.00", CultureInfo.InvariantCulture)}");

			var col = take ? (s.D == 1 ? _buyColor : _sellColor) : Color.Gray;
			var head = $"{(s.D == 1 ? "BUY" : "SELL")} {verdict} {score}/7";
			AddLabel(s, i, $"{head}\nSL {Fmt(s.D * s.Sl)}  TP {Fmt(s.D * s.Peak)}\n{checks}", col);

			if (s.D == 1)
				_buySignal[i] = candle.Low - InstrumentInfo.TickSize * 2;
			else
				_sellSignal[i] = candle.High + InstrumentInfo.TickSize * 2;

			Alert(s, i, $"CONFIRMATION → {head}. Entry {Fmt(candle.Close)}, SL {Fmt(s.D * s.Sl)}, TP {Fmt(s.D * s.Peak)}\n{checks}");
			Finish(s);
		}

		private void Finish(Side s)
		{
			s.State = 0;
			s.Zone = null;
			s.SlLine = s.TpLine = null;
		}

		// keep the zone, SL and TP stretched to the current bar while the setup is alive
		private void Stretch(Side s, int i)
		{
			s.Zone.SecondBar = i + 3;
			s.SlLine.SecondBar = i + 3;
			s.TpLine.SecondBar = i + 3;
			s.TpLine.FirstPrice = s.D * s.Peak;
			s.TpLine.SecondPrice = s.D * s.Peak;
		}

		#endregion

		#region Live (forming candle)

		private void CheckLive(int bar)
		{
			foreach (var s in new[] { _buy, _sell })
			{
				if (s.State != 3 && s.State != 4)
					continue;

				var l = L(s, bar);

				if (s.State == 3 && !s.NearSent && l <= s.ZTop + _proximityPips * Pip())
				{
					s.NearSent = true;
					Alert(s, bar, $"price is {_proximityPips} pips from the zone. Get ready.", live: true);
				}

				if (s.State == 3 && !s.TouchSent && l <= s.ZTop)
				{
					s.TouchSent = true;
					Alert(s, bar, "price is IN the zone. Watch for absorption, then the confirmation candle.", live: true);
				}

				if (UseDom && s.NearSent)
					CheckDom(s);
			}
		}

		// A wall = one resting level inside the zone that is DomWallMult × bigger than the average level.
		private void CheckDom(Side s)
		{
			if ((DateTime.UtcNow - _lastDomCheck).TotalMilliseconds < 500)
				return;

			_lastDomCheck = DateTime.UtcNow;

			try
			{
				var snapshot = MarketDepthInfo?.GetMarketDepthSnapshot();

				if (snapshot == null)
					return;

				var side = s.D == 1 ? MarketDataType.Bid : MarketDataType.Ask;
				var (top, bot) = RealZone(s);
				decimal sum = 0, maxInZone = 0;
				var count = 0;

				foreach (var level in snapshot)
				{
					if (level.DataType != side)
						continue;

					sum += level.Volume;
					count++;

					if (level.Price >= bot && level.Price <= top)
						maxInZone = Math.Max(maxInZone, level.Volume);
				}

				if (count > 0 && maxInZone >= DomWallMult * sum / count)
					s.DomWall = true;
			}
			catch (Exception)
			{
				// no market depth for this instrument / connection
			}
		}

		#endregion

		#region Helpers

		private decimal H(Side s, int bar) => s.D == 1 ? GetCandle(bar).High : -GetCandle(bar).Low;

		private decimal L(Side s, int bar) => s.D == 1 ? GetCandle(bar).Low : -GetCandle(bar).High;

		private decimal O(Side s, int bar) => s.D * GetCandle(bar).Open;

		private decimal C(Side s, int bar) => s.D * GetCandle(bar).Close;

		private bool IsPivot(Side s, int p, int last)
		{
			var hp = H(s, p);

			for (var k = p - _pivotLength; k < p; k++)
			{
				if (H(s, k) >= hp)
					return false;
			}

			for (var k = p + 1; k <= last; k++)
			{
				if (H(s, k) > hp)
					return false;
			}

			return true;
		}

		private decimal Pip()
		{
			if (_pipSize > 0)
				return _pipSize;

			var tick = InstrumentInfo.TickSize;

			if (tick >= 0.1m)
				return tick;

			return tick < 0.0001m ? 0.0001m : tick * 10;
		}

		private (decimal top, decimal bot) RealZone(Side s)
		{
			var a = s.D * s.ZTop;
			var b = s.D * s.ZBot;
			return (Math.Max(a, b), Math.Min(a, b));
		}

		private bool InZone(Side s, decimal? price)
		{
			if (!price.HasValue)
				return false;

			var (top, bot) = RealZone(s);
			var tol = _zoneTolTicks * InstrumentInfo.TickSize;
			return price.Value >= bot - tol && price.Value <= top + tol;
		}

		private void AddLevels(Dictionary<decimal, decimal> profile, int bar)
		{
			var levels = GetCandle(bar).GetAllPriceLevels();

			if (levels == null)
				return;

			foreach (var level in levels)
			{
				profile.TryGetValue(level.Price, out var volume);
				profile[level.Price] = volume + level.Volume;
			}
		}

		private static decimal? Poc(Dictionary<decimal, decimal> profile)
		{
			if (profile.Count == 0)
				return null;

			return profile.Aggregate((a, b) => b.Value > a.Value ? b : a).Key;
		}

		// Diagonal imbalance: Buy at a price vs Sell one tick below (Sell vs Buy one tick above for sells).
		private int MaxStacked(int bar, int d)
		{
			var candle = GetCandle(bar);
			var tick = InstrumentInfo.TickSize;
			int best = 0, run = 0;

			for (var price = candle.Low; price <= candle.High; price += tick)
			{
				var level = candle.GetPriceVolumeInfo(price);
				var isImbalance = false;

				if (level != null)
				{
					if (d == 1)
					{
						var below = candle.GetPriceVolumeInfo(price - tick);
						var sell = below?.Bid ?? 0;
						isImbalance = level.Ask >= _imbalanceMinVolume && level.Ask * 100 >= sell * _imbalanceRatio;
					}
					else
					{
						var above = candle.GetPriceVolumeInfo(price + tick);
						var buy = above?.Ask ?? 0;
						isImbalance = level.Bid >= _imbalanceMinVolume && level.Bid * 100 >= buy * _imbalanceRatio;
					}
				}

				run = isImbalance ? run + 1 : 0;
				best = Math.Max(best, run);
			}

			return best;
		}

		private decimal AverageVolume(int bar)
		{
			var from = Math.Max(0, bar - 20);
			var count = bar - from;

			if (count <= 0)
				return 0;

			decimal sum = 0;

			for (var k = from; k < bar; k++)
				sum += _volumes[k];

			return sum / count;
		}

		private static void UpdateEma(List<decimal> ema, int bar, decimal close, int period)
		{
			var k = 2m / (period + 1);
			var value = bar == 0 || ema.Count == 0 ? close : ema[bar - 1] + k * (close - ema[bar - 1]);

			if (ema.Count > bar)
				ema[bar] = value;
			else
				ema.Add(value);
		}

		private void AddLabel(Side s, int bar, string text, Color color, bool atPeak = false)
		{
			var candle = GetCandle(bar);
			var above = atPeak ? s.D == 1 : s.D == -1;
			var price = above ? candle.High : candle.Low;
			AddText($"{s.D}_{bar}_{text.GetHashCode()}", text, above, bar, price, 0, 0, Color.White, Color.Transparent, color, FontSize, DrawingText.TextAlign.Center);
		}

		// Alerts only for bars that just happened, never while the history is being calculated.
		private void Alert(Side s, int bar, string message, bool live = false)
		{
			if (!UseAlerts)
				return;

			if (!live && bar < CurrentBar - 2)
				return;

			AddAlert(AlertFile, InstrumentInfo.Instrument, $"{InstrumentInfo.Instrument} · {s.Name}: {message}", AlertBGColor, AlertForeColor);
		}

		private string Fmt(decimal price)
		{
			var tick = InstrumentInfo.TickSize;
			var rounded = tick > 0 ? Math.Round(price / tick) * tick : price;
			return rounded.ToString("0.#####", CultureInfo.InvariantCulture);
		}

		private static string Mark(bool ok) => ok ? "✔" : "✘";

		private void Set<T>(ref T field, T value)
		{
			field = value;
			RecalculateValues();
		}

		#endregion
	}
}
