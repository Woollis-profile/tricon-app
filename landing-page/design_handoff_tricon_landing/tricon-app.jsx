/* TRICON — landing screen */

function TriconMark() {
  // Equilateral triangle whose three sides are loaded barbells. The shaft
  // length equals the side length, so the bars meet at the corners and read
  // as one triangle; plate clusters sit inboard with clear gaps.
  const C = 220, R = 170, s = 1.2, d = Math.PI / 180;
  const top = [C, C - R];
  const bl  = [C - R * Math.sin(60 * d), C + R * Math.cos(60 * d)];
  const br  = [C + R * Math.sin(60 * d), C + R * Math.cos(60 * d)];
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const half = R * Math.sin(60 * d);
  const sides = [
    { at: mid(bl, br),  rot: 0 },
    { at: mid(bl, top), rot: -60 },
    { at: mid(top, br), rot: 60 },
  ];
  const Barbell = ({ at, rot }) => (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot})`} fill="var(--mark)">
      <rect x={-half} y="-3.5" width={2 * half} height="7" rx="3.5" />
      {/* right end — graded 3-plate stack, pulled inboard so corners don't touch (v4) */}
      <rect x="77" y="-9" width="5" height="18" rx="2" />
      <rect x="88" y="-27" width="9.5" height="54" rx="3" />
      <rect x="101" y="-22" width="9" height="44" rx="3" />
      <rect x="114" y="-17" width="8.5" height="34" rx="2.5" />
      {/* left end — mirror */}
      <rect x="-82" y="-9" width="5" height="18" rx="2" />
      <rect x="-97.5" y="-27" width="9.5" height="54" rx="3" />
      <rect x="-110" y="-22" width="9" height="44" rx="3" />
      <rect x="-122.5" y="-17" width="8.5" height="34" rx="2.5" />
    </g>
  );
  return (
    <svg viewBox="0 0 440 440" aria-label="TRICON barbell triangle">
      <g transform={`translate(${C} ${C}) scale(${s}) translate(${-C} ${-C})`}>
        {sides.map((x, i) => <Barbell key={i} {...x} />)}
      </g>
    </svg>
  );
}

function TopGlyph() {
  return (
    <svg viewBox="0 0 300 300">
      <g fill="none" stroke="#fff" strokeWidth="22" strokeLinejoin="round" strokeLinecap="round">
        <polygon points="150,52 248,222 52,222" />
      </g>
    </svg>
  );
}

function TriconScreen({ t }) {
  return (
    <div className="screen">
      <div className="bg-wrap" style={{ filter: t.grayscale ? undefined : 'none' }}>
        <image-slot
          id="tricon-bg"
          shape="rect"
          fit="cover"
          src="assets/gym-bg.png"
          placeholder="Drop a gym / training photo"
        ></image-slot>
      </div>
      <div className="scrim-dim"></div>
      <div className="scrim"></div>

      <div className="content">
        <div className="topmark">
          <div className="topglyph"><TopGlyph /></div>
          <span className="tt">TRICON</span>
        </div>

        <div className="hero">
          <div className="logo">
            <TriconMark />
            <div className="cut"></div>
            <div className="wordlock">
              <div className="tricon">TRICON</div>
              <div className="workout">WORKOUT</div>
            </div>
          </div>
          <div className="tagline">{t.tagline}</div>
        </div>

        <div className="actions">
          <button className="btn btn-light">Create Account</button>
          <button className="btn btn-gold">Log In</button>
          <div className="signin">Member already? <b>Restore purchase</b></div>
        </div>
      </div>
    </div>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "gold": ["#e3b23f", "#cf9a2b"],
  "finish": "plate",
  "dim": 28,
  "grayscale": true,
  "tagline": "Training method for the older and wiser athlete"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--gold', t.gold[0]);
    r.setProperty('--gold-deep', t.gold[1]);
    r.setProperty('--dim', (t.dim / 100).toFixed(3));
  }, [t.gold, t.dim]);

  return (
    <React.Fragment>
      <IOSDevice dark>
        <TriconScreen t={t} />
      </IOSDevice>
      <TweaksPanel>
        <TweakSection label="Logo" />
        <TweakRadio label="Mark finish" value={t.finish}
          options={["plate", "white"]}
          onChange={(v) => setTweak('finish', v)} />
        <TweakColor label="Gold" value={t.gold}
          options={[["#e3b23f", "#cf9a2b"], ["#e8a33a", "#d4861a"], ["#cdb26a", "#b2914a"], ["#d9c27a", "#bda24f"]]}
          onChange={(v) => setTweak('gold', v)} />
        <TweakText label="Tagline" value={t.tagline}
          onChange={(v) => setTweak('tagline', v)} />
        <TweakSection label="Hero photo" />
        <TweakSlider label="Dim" value={t.dim} min={0} max={85} unit="%"
          onChange={(v) => setTweak('dim', v)} />
        <TweakToggle label="Black & white" value={t.grayscale}
          onChange={(v) => setTweak('grayscale', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
