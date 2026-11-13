import "@/frame-accents.css";

/** Open, ink-cut contours stay behind the artwork and never change scene geometry. */
export function FrameAccents({ tone = "red" }: { tone?: "red" | "cyan" | "gold" }) {
  return (
    <div className={`frame-accents frame-accents-${tone}`} aria-hidden="true">
      <svg className="frame-contour" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
        <path
          className="frame-hairline"
          d="M17 298V96L83 18H354M938 18H1295L1422 142V350M1422 576V807L1360 882H1050M737 882H122L17 777V688"
        />
        <path
          className="frame-echo"
          d="M17 316V116L99 18M1405 571V797L1335 882M719 882H155L17 750"
        />
        <path className="frame-color-line" d="M17 125L105 18H258M1410 776L1321 882H1190" />
      </svg>
      <svg className="frame-brush frame-brush-upper" viewBox="0 0 360 190" fill="none">
        <path
          className="frame-brush-fill"
          d="M354 5 212 92 248 57 86 145 175 80 35 155 217 34 173 75 297 4 242 51Z"
        />
        <path
          className="frame-brush-cut"
          d="m348 12-160 94m83-50-102 67m69-46L91 160m95-80L45 161M259 20 104 124"
        />
        <path className="frame-brush-fleck" d="m135 113-76 51m137-115-44 26M320 35l-41 29" />
      </svg>
      <svg className="frame-brush frame-brush-lower" viewBox="0 0 360 190" fill="none">
        <path
          className="frame-brush-fill"
          d="m6 184 143-88-36 34 162-88-89 66 140-75-182 122 44-42L64 185l55-48Z"
        />
        <path
          className="frame-brush-cut"
          d="m12 178 160-94m-83 50 102-67m-69 46 147-83m-95 80L315 29M101 170l155-104"
        />
        <path className="frame-brush-fleck" d="m225 77 76-51m-137 115 44-26M40 155l41-29" />
      </svg>
      <svg className="frame-slashes" viewBox="0 0 60 40" fill="none">
        <path d="M8 34 24 6M21 34 37 6M34 34 50 6" />
      </svg>
    </div>
  );
}
