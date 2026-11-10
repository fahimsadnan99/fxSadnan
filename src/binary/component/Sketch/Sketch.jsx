import React, { useId } from "react";
import { diagrams } from "./diagrams";

/**
 * Small teaching sketches for the lessons. Each one is described as data in
 * diagrams.js (candles, levels, zones, labels) and drawn here as SVG, in the
 * site colours. They sit beside the original lesson images and never replace
 * them. Coordinates in a diagram are [candle index, price 0 to 100].
 *
 * SketchSvg draws one spec on its own (the lesson covers animate it); every
 * element carries --i, its place in the build order, so a cover can bring
 * candles in one by one, then levels, marks and labels.
 */

const VB_W = 400;
const VB_H = 230;

const order = (i) => ({ "--i": i });

export const SketchSvg = ({ spec, className = "sketch__svg", title }) => {
  const uid = useId();
  const dx = spec.dx ?? 42;
  const x0 = spec.x0 ?? 34;
  const bw = spec.bw ?? 14;
  const X = (i) => x0 + i * dx;
  const Y = (v) => 210 - v * 1.8;
  // A point is [i, v] in chart units, or [px, py] when the item sets `px`.
  const pt = (item, p) => (item.px ? p : [X(p[0]), Y(p[1])]);
  // Labels and marks come after the candles.
  const n = Math.max(3, (spec.c || []).length);

  const arrow = (a, b, tone, key, i) => {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const s = 7;
    const h1 = [b[0] - s * Math.cos(ang - 0.45), b[1] - s * Math.sin(ang - 0.45)];
    const h2 = [b[0] - s * Math.cos(ang + 0.45), b[1] - s * Math.sin(ang + 0.45)];
    return (
      <g key={key} className={"sk-arrow sk-tone--" + (tone || "soft")} style={order(i)}>
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
        <polygon points={`${b[0]},${b[1]} ${h1[0]},${h1[1]} ${h2[0]},${h2[1]}`} />
      </g>
    );
  };

  return (
    <svg
      className={className}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      role={title ? "img" : undefined}
      aria-labelledby={title ? uid + "-t" : undefined}
      aria-hidden={title ? undefined : "true"}
    >
      {title && <title id={uid + "-t"}>{spec.alt}</title>}
      <g className="sk-grid">
        {[50, 90, 130, 170].map((y) => (
          <line key={y} x1="0" x2={VB_W} y1={y} y2={y} />
        ))}
      </g>

      {(spec.rects || []).map((r, k) => (
        <g key={"r" + k} className={"sk-box sk-tone--" + (r.tone || "soft") + (r.fill ? " sk-box--fill" : "")} style={order(k * 0.5)}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="3" />
          {r.t && (
            <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 4} textAnchor="middle">
              {[].concat(r.t).map((line, m, all) => (
                <tspan key={m} x={r.x + r.w / 2} dy={m === 0 ? -((all.length - 1) * 6.5) : 13}>
                  {line}
                </tspan>
              ))}
            </text>
          )}
        </g>
      ))}

      {(spec.z || []).map((z, k) => {
        const x1 = X(z.a[0]);
        const x2 = X(z.b[0]);
        return (
          <g key={"z" + k} className={"sk-zone sk-tone--" + (z.tone || "bull")} style={order(k)}>
            <rect
              x={Math.min(x1, x2)}
              y={Y(Math.max(z.a[1], z.b[1]))}
              width={Math.abs(x2 - x1)}
              height={Math.abs(Y(z.a[1]) - Y(z.b[1]))}
            />
          </g>
        );
      })}

      {(spec.l || []).map((l, k) => {
        const a = pt(l, l.a);
        const b = pt(l, l.b);
        return (
          <line
            key={"l" + k}
            className={"sk-line sk-line--" + (l.k || "level") + " sk-tone--" + (l.tone || "soft")}
            style={order(1 + k * 0.6)}
            x1={a[0]}
            y1={a[1]}
            x2={b[0]}
            y2={b[1]}
          />
        );
      })}

      {(spec.p || []).map((p, k) => (
        <polyline
          key={"p" + k}
          className={"sk-path sk-tone--" + (p.tone || "soft")}
          style={order(1 + k)}
          pathLength="1"
          points={p.pts.map((q) => pt(p, q).join(",")).join(" ")}
        />
      ))}

      {(spec.c || []).map((c, k) => {
        const [o, cl, h, l, opt = {}] = c;
        const i = opt.i ?? k;
        const x = X(i);
        const tone = opt.tone || (cl >= o ? "bull" : "bear");
        const top = Y(Math.max(o, cl));
        const bot = Y(Math.min(o, cl));
        return (
          <g key={"c" + k} className={"sk-candle sk-tone--" + tone} style={order(k)}>
            <line x1={x} x2={x} y1={Y(h)} y2={Y(l)} />
            <rect x={x - bw / 2} y={top} width={bw} height={Math.max(2.5, bot - top)} />
          </g>
        );
      })}

      {(spec.o || []).map((o, k) => {
        const [x, y] = pt(o, o.a);
        return (
          <circle
            key={"o" + k}
            className={"sk-mark sk-tone--" + (o.tone || "amber")}
            style={order(n + k * 0.6)}
            cx={x}
            cy={y}
            r={o.r ?? 12}
          />
        );
      })}

      {(spec.ar || []).map((a, k) => arrow(pt(a, a.a), pt(a, a.b), a.tone, "a" + k, n + 0.5 + k * 0.5))}

      {(spec.t || []).map((t, k) => {
        const [x, y] = pt(t, t.a);
        return (
          <text
            key={"t" + k}
            className={"sk-text sk-tone--" + (t.tone || "soft") + (t.big ? " sk-text--big" : "")}
            style={order(n + 1 + k * 0.4)}
            x={x + (t.dx || 0)}
            y={y + (t.dy || 0)}
            textAnchor={t.anchor || "middle"}
          >
            {[].concat(t.t).map((line, m) => (
              <tspan key={m} x={x + (t.dx || 0)} dy={m === 0 ? 0 : 13}>
                {line}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
};

const Sketch = ({ name }) => {
  const spec = diagrams[name];
  if (!spec) return null;
  return (
    <figure className="sketch" data-sketch={name}>
      <SketchSvg spec={spec} title />
      <figcaption className="sketch__cap">
        <b>Sketch</b> {spec.cap}
      </figcaption>
    </figure>
  );
};

export default Sketch;
