#!/usr/bin/env python3
"""
Rebuild the self-hosted webfont subsets in src/lib/assets/fonts/.

The fonts are build artifacts, not hand-placed binaries, so this script is the
record of exactly how they were produced. Run it when a family is updated:

    python3 -m venv .venv-fonts
    .venv-fonts/bin/pip install fonttools brotli
    .venv-fonts/bin/python scripts/build-fonts.py

All three families are SIL OFL 1.1 and — verified on their copyright lines, not
merely in the licence boilerplate — none declares a Reserved Font Name. Under
OFL 1.1 §3 that makes subsetting, format conversion and axis pinning
unambiguously permitted. OFL 1.1 §2 still requires the licence to travel with
the files, which is why static/licenses/ exists and the colophon links it.

Two deliberate decisions:

1. `wdth` is PINNED to 100 on Bricolage and Instrument Sans. Both axes only
   condense (their max is 100, there is no expanded), and keeping the axis costs
   63,656 bytes on Bricolage alone — 42% of the file, on the critical preload
   path. The measured hero fits at 320px without condensing, so the axis was
   paying no rent. `opsz` and `wght` are kept: `opsz` is the reason Bricolage
   was chosen at all.

2. Each family is split into `latin` and `latin-ext`. Only the two `latin`
   subsets are preloaded; `latin-ext` loads on demand via unicode-range, and
   mono is never preloaded because metadata is below the fold.
"""

import os
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "lib" / "assets" / "fonts"
LICENSES = ROOT / "static" / "licenses"

# Google Fonts' standard split. Keeping these exact means the unicode-range
# declarations in typography.css match what the browser will actually need.
LATIN = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,"
    "U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,"
    "U+2215,U+FEFF,U+FFFD"
)
LATIN_EXT = (
    "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,"
    "U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,"
    "U+2113,U+2C60-2C7F,U+A720-A7FF"
)

LAYOUT_FEATURES = (
    "ccmp,locl,kern,liga,clig,calt,mark,mkmk,rvrn,tnum,onum,frac,sups,subs"
)

FAMILIES = [
    {
        "stem": "bricolage",
        "url": "https://github.com/ateliertriay/bricolage/raw/main/fonts/webfonts/"
        "BricolageGrotesque%5Bopsz,wdth,wght%5D.woff2",
        "license": "https://github.com/ateliertriay/bricolage/raw/main/OFL.txt",
        "license_name": "OFL-BricolageGrotesque.txt",
        "pin": ["wdth=100"],
    },
    {
        "stem": "instrument",
        "url": "https://github.com/Instrument/instrument-sans/raw/master/fonts/webfonts/"
        "InstrumentSans%5Bwdth,wght%5D.woff2",
        "license": "https://github.com/Instrument/instrument-sans/raw/master/OFL.txt",
        "license_name": "OFL-InstrumentSans.txt",
        "pin": ["wdth=100"],
    },
    {
        "stem": "jetbrains",
        "url": "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/webfonts/"
        "JetBrainsMono%5Bwght%5D.woff2",
        "license": "https://github.com/JetBrains/JetBrainsMono/raw/master/OFL.txt",
        "license_name": "OFL-JetBrainsMono.txt",
        "pin": [],  # single wght axis; nothing to pin
    },
]


def tool(name: str) -> str:
    path = shutil.which(name)
    if not path:
        sys.exit(f"{name} not found. Install fonttools and brotli into this interpreter.")
    return path


def fetch(url: str, dest: Path) -> None:
    with urllib.request.urlopen(url) as response:
        data = response.read()
    # An upstream branch rename returns a 200 HTML page rather than a 404, so the
    # magic number is checked instead of the status code.
    if data[:4] != b"wOF2" and not dest.name.endswith(".txt"):
        sys.exit(f"{url} did not return a woff2 (got {data[:40]!r}). Check the branch name.")
    dest.write_bytes(data)


def main() -> None:
    pyftsubset = tool("pyftsubset")
    fonttools = tool("fonttools")
    OUT.mkdir(parents=True, exist_ok=True)
    LICENSES.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)
        for family in FAMILIES:
            stem = family["stem"]
            source = tmp / f"{stem}.woff2"
            fetch(family["url"], source)

            licence = LICENSES / family["license_name"]
            fetch(family["license"], licence)
            first_line = licence.read_text(encoding="utf-8").splitlines()[0]
            if "reserved font name" in first_line.lower():
                sys.exit(
                    f"{family['license_name']} now declares a Reserved Font Name on its "
                    f"copyright line. Subsetting is no longer permitted without renaming."
                )

            subset_input = source
            if family["pin"]:
                # pyftsubset cannot pin axes itself; instancer runs on a raw TTF.
                ttf = tmp / f"{stem}.ttf"
                subprocess.run(
                    [fonttools, "ttLib.woff2", "decompress", "-o", str(ttf), str(source)],
                    check=True,
                    capture_output=True,
                )
                pinned = tmp / f"{stem}-pinned.ttf"
                subprocess.run(
                    [fonttools, "varLib.instancer", "-o", str(pinned), str(ttf), *family["pin"]],
                    check=True,
                    capture_output=True,
                )
                subset_input = pinned

            for label, ranges in (("latin", LATIN), ("latin-ext", LATIN_EXT)):
                out = OUT / f"{stem}-var-{label}.woff2"
                subprocess.run(
                    [
                        pyftsubset,
                        str(subset_input),
                        f"--output-file={out}",
                        "--flavor=woff2",
                        f"--unicodes={ranges}",
                        "--name-IDs=*",
                        "--name-legacy",
                        "--notdef-outline",
                        f"--layout-features={LAYOUT_FEATURES}",
                    ],
                    check=True,
                )
                print(f"  {out.name:32s} {out.stat().st_size:>7,} bytes")


if __name__ == "__main__":
    main()
