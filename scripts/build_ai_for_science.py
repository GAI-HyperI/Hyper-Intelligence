#!/usr/bin/env python3
"""Build the static copy of the AI for Science Congress 2026 site.

The congress site is written in PHP (shared top bar / side bar / footer pulled
in with ``include`` plus a few empty-string switches). GitHub Pages only serves
static files, so this script

1. renders every PHP page to plain HTML,
2. rewrites links so the site works under ``/ai-for-science/2026/`` instead of
   ``https://ieee-ai-for-science.org/2026/`` (``x.php`` -> ``x.html``, absolute
   links to the old address -> relative links),
3. copies every other file (images, PDFs, CSS ...) unchanged.

Usage (from the repository root)::

    python3 scripts/build_ai_for_science.py /path/to/2026_xxxx.tar.gz
    python3 scripts/build_ai_for_science.py /path/to/extracted/2026

Every run brings the output folder ``docs/ai-for-science/2026`` in line with the
source: changed files are rewritten, files no longer in the source are removed,
everything else is left untouched. Edit the PHP source and rebuild rather than
editing the output.
Only the PHP constructs the site actually uses are supported; anything else
stops the build with an error instead of producing a wrong page.
"""

from __future__ import annotations

import argparse
import posixpath
import re
import stat
import sys
import tarfile
from collections import Counter, defaultdict
from html import escape, unescape
from pathlib import Path
from urllib.parse import quote, unquote, urljoin, urlsplit

REPO = Path(__file__).resolve().parents[1]
DEFAULT_OUT = REPO / "docs" / "ai-for-science" / "2026"

# Where the PHP site lives today. Links to this address become relative links.
ORIGIN_HOSTS = {"ieee-ai-for-science.org", "www.ieee-ai-for-science.org"}
ORIGIN_BASE = "https://ieee-ai-for-science.org"
ORIGIN_ROOT = "/2026/"

# Developer files that are not part of the website.
SKIP_DIR_NAMES = {"__pycache__"}
SKIP_SUFFIXES = {".pyc"}
SKIP_PREFIXES = ("helloispa/tests/", "helloispa/docs/")
SKIP_FILES = {"helloispa/README.md"}

# A static page that shares its name with a rendered PHP page (cfp.html next to
# cfp.php) keeps its content but moves to cfp<suffix>.
STATIC_TWIN_SUFFIX = ".static.html"

# Scripts and feeds hold URLs that the browser resolves against the page that
# loads them, not against the file itself.
DOCUMENT_OF = {"helloispa/src/data/conference.js": "helloispa/index.html"}

HTML_SUFFIXES = (".html", ".htm")
TEXT_SUFFIXES = (".js", ".cjs", ".css", ".xml", ".json", ".svg", ".txt", ".md")
NON_LINK_SCHEMES = ("#", "mailto:", "tel:", "javascript:", "data:", "about:", "blob:")


class BuildError(Exception):
    pass


# --------------------------------------------------------------------------
# Reading the source (a folder or a .tar.gz), without ever extracting to disk
# --------------------------------------------------------------------------


def check_rel(rel: str) -> str:
    parts = rel.split("/")
    if rel.startswith("/") or any(p in ("", ".", "..") for p in parts):
        raise BuildError(f"unsafe path in source: {rel!r}")
    return rel


class DirSource:
    def __init__(self, root: Path):
        entries = [p for p in root.iterdir() if p.name != ".DS_Store"]
        if len(entries) == 1 and entries[0].is_dir():
            root = entries[0]
        self.root = root
        self.files = sorted(
            check_rel(p.relative_to(root).as_posix())
            for p in root.rglob("*")
            if p.is_file() and not p.is_symlink()
        )

    def read(self, rel: str) -> bytes:
        return (self.root / rel).read_bytes()


class TarSource:
    def __init__(self, path: Path):
        self.tar = tarfile.open(path)
        members = [m for m in self.tar.getmembers() if m.isfile()]
        tops = {m.name.split("/", 1)[0] for m in members}
        strip = len(tops) == 1 and all("/" in m.name for m in members)
        self.members = {}
        for m in members:
            rel = m.name.split("/", 1)[1] if strip else m.name
            self.members[check_rel(rel)] = m
        self.files = sorted(self.members)

    def read(self, rel: str) -> bytes:
        return self.tar.extractfile(self.members[rel]).read()


def open_source(path: Path):
    if path.is_dir():
        return DirSource(path)
    if path.is_file():
        return TarSource(path)
    raise BuildError(f"source not found: {path}")


def is_skipped(rel: str) -> bool:
    parts = rel.split("/")
    return (
        any(p.startswith(".") or p in SKIP_DIR_NAMES for p in parts)
        or rel.endswith(tuple(SKIP_SUFFIXES))
        or rel.startswith(SKIP_PREFIXES)
        or rel in SKIP_FILES
    )


# --------------------------------------------------------------------------
# Minimal PHP rendering
# --------------------------------------------------------------------------

PHP_TAG = re.compile(r"<\?(php(?=\s)|=)(.*?)(?:\?>(?:\r?\n)?|\Z)", re.S)
PHP_TOKEN = re.compile(
    r"""
      (?P<ws>\s+)
    | (?P<comment>//[^\n]*|\#[^\n]*|/\*.*?\*/)
    | (?P<str>'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\$])*")
    | (?P<var>\$[A-Za-z_]\w*)
    | (?P<word>[A-Za-z_]\w*)
    | (?P<op>!==|===|[=;:().,])
    """,
    re.S | re.X,
)
INCLUDE_WORDS = {"include", "include_once", "require", "require_once"}


def php_tokens(code: str, where: str):
    tokens, pos = [], 0
    while pos < len(code):
        m = PHP_TOKEN.match(code, pos)
        if not m:
            raise BuildError(f"{where}: unsupported PHP near {code[pos:pos + 60]!r}")
        pos = m.end()
        if m.lastgroup not in ("ws", "comment"):
            tokens.append((m.lastgroup, m.group()))
    return tokens


def php_string(literal: str) -> str:
    body = literal[1:-1]
    if literal[0] == "'":
        return re.sub(r"\\([\\'])", r"\1", body)
    if "\\" in body:
        raise BuildError(f"unsupported escape in PHP string {literal!r}")
    return body


def php_htmlspecialchars(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#039;")
    )


class PhpRenderer:
    """Renders one PHP file the way the web server would for a direct request."""

    def __init__(self, site: "Site"):
        self.site = site
        self.included: set[str] = set()
        self.missing: list[str] = []

    def render_page(self, rel: str) -> str:
        self.cwd = posixpath.dirname(rel)
        self.scope: dict[str, str] = {}
        return self._render(rel, depth=0)

    def _resolve_include(self, word: str, kind: str, path: str, current: str):
        here = posixpath.dirname(current)
        if kind == "dir":  # __DIR__ . '/x.php'
            candidates = [posixpath.normpath(posixpath.join(here, path.lstrip("/")))]
        elif path.startswith(("./", "../")):  # relative to the requested page
            candidates = [posixpath.normpath(posixpath.join(self.cwd, path))]
        else:  # include_path ('.'), then the including file's folder
            candidates = [
                posixpath.normpath(posixpath.join(self.cwd, path)),
                posixpath.normpath(posixpath.join(here, path)),
            ]
        for cand in candidates:
            if cand in self.site.fileset:
                return cand
        if word.startswith("require"):
            raise BuildError(f"{current}: {word} not found: {path!r} (tried {candidates})")
        # PHP only warns on a missing include and carries on with the page.
        self.missing.append(f"{current}: {word} '{path}' does not exist, left out")
        return None

    def _render(self, rel: str, depth: int) -> str:
        if depth > 10:
            raise BuildError(f"{rel}: includes nested too deeply")
        text = self.site.text(rel)
        out: list[str] = []
        conds: list[bool] = []
        pos = 0
        for m in PHP_TAG.finditer(text):
            if all(conds):
                out.append(text[pos:m.start()])
            pos = m.end()
            where = f"{rel}:{text.count(chr(10), 0, m.start()) + 1}"
            tokens = php_tokens(m.group(2), where)
            if m.group(1) == "=":
                if all(conds):
                    out.append(self._echo(tokens, where))
            else:
                self._run(tokens, where, rel, depth, conds, out)
        if conds:
            raise BuildError(f"{rel}: 'if' without 'endif'")
        out.append(text[pos:])
        return "".join(out)

    def _value(self, name: str, where: str) -> str:
        if name not in self.scope:
            raise BuildError(f"{where}: undefined variable {name}")
        return self.scope[name]

    def _echo(self, tokens, where: str) -> str:
        shape = [t[0] if t[0] in ("var", "str") else t[1] for t in tokens]
        if shape == ["var"]:
            return self._value(tokens[0][1], where)
        if shape == ["htmlspecialchars", "(", "var", ",", "ENT_QUOTES", ",", "str", ")"]:
            return php_htmlspecialchars(self._value(tokens[2][1], where))
        raise BuildError(f"{where}: unsupported PHP echo {[t[1] for t in tokens]}")

    def _run(self, tokens, where, rel, depth, conds, out) -> None:
        i = 0
        while i < len(tokens):
            kinds = [t[0] for t in tokens[i:i + 8]]
            vals = [t[1] for t in tokens[i:i + 8]]
            word = vals[0]
            if word == ";":
                i += 1
            elif kinds[:3] == ["var", "op", "str"] and vals[1] == "=":
                if all(conds):
                    self.scope[word] = php_string(vals[2])
                i += 3
            elif word in INCLUDE_WORDS:
                if kinds[1:2] == ["str"]:
                    kind, path, used = "plain", php_string(vals[1]), 2
                elif vals[1:3] == ["__DIR__", "."] and kinds[3:4] == ["str"]:
                    kind, path, used = "dir", php_string(vals[3]), 4
                else:
                    raise BuildError(f"{where}: unsupported include {vals}")
                if all(conds):
                    target = self._resolve_include(word, kind, path, rel)
                    if target:
                        self.included.add(target)
                        out.append(self._render(target, depth + 1))
                i += used
            elif word == "if" and vals[1] == "(" and kinds[2] == "var" and vals[3] in ("!==", "===") \
                    and kinds[4] == "str" and vals[5:7] == [")", ":"]:
                if all(conds):
                    same = self._value(vals[2], where) == php_string(vals[4])
                    conds.append(same if vals[3] == "===" else not same)
                else:
                    conds.append(False)
                i += 7
            elif word == "else" and vals[1:2] == [":"]:
                if not conds:
                    raise BuildError(f"{where}: 'else' without 'if'")
                conds[-1] = all(conds[:-1]) and not conds[-1]
                i += 2
            elif word == "endif":
                if not conds:
                    raise BuildError(f"{where}: 'endif' without 'if'")
                conds.pop()
                i += 1
            else:
                raise BuildError(f"{where}: unsupported PHP statement {vals}")


# --------------------------------------------------------------------------
# Link rewriting
# --------------------------------------------------------------------------

ATTR_URL = re.compile(
    r"""(?P<pre>(?<!\w)(?<!\w-)(?:href|src|action|poster|background)\s*=\s*)"""
    r"""(?:"(?P<dq>[^"]*)"|'(?P<sq>[^']*)'|(?P<uq>[^\s"'<>`]+))""",
    re.I,
)
CSS_URL = re.compile(
    r"""(?P<pre>url\(\s*)(?:"(?P<dq>[^"]*)"|'(?P<sq>[^']*)'|(?P<uq>[^\s"'()]+))""",
    re.I,
)
ORIGIN_IN_TEXT = re.compile(
    r"""(?P<q>["'])(?P<url>https?://(?:www\.)?ieee-ai-for-science\.org/[^"'\s]*)(?P=q)""", re.I
)
HTML_COMMENT = re.compile(r"<!--.*?-->", re.S)


class Site:
    def __init__(self, source, files: list[str]):
        self.source = source
        self.files = files
        self.fileset = set(files)
        self.dirs = {""}
        for f in files:
            d = posixpath.dirname(f)
            while d:
                self.dirs.add(d)
                d = posixpath.dirname(d)
        self._text: dict[str, str] = {}
        self.rename: dict[str, str] = {}
        self.rewrites: Counter = Counter()

    def text(self, rel: str) -> str:
        # latin-1 round-trips every byte, so untouched text stays byte-identical
        # whatever encoding the page was saved in.
        if rel not in self._text:
            self._text[rel] = self.source.read(rel).decode("latin-1")
        return self._text[rel]

    # -- URL -> path inside the congress site ------------------------------

    def locate(self, raw: str, src_page: str):
        """Return (path, is_dir, explicit, query+fragment) for a link that points
        inside the congress site, or None for every other link."""
        url = unescape(raw).strip()
        if not url or url.lower().startswith(NON_LINK_SCHEMES):
            return None
        # Browsers read "https:///host/x" (a typo in some pages) as "https://host/x".
        url = re.sub(r"^(https?:)/{3,}", r"\1//", url, flags=re.I)
        try:
            parts = urlsplit(urljoin(ORIGIN_BASE + ORIGIN_ROOT + quote(src_page), url))
            explicit = bool(urlsplit(url).netloc) or url.startswith("/")
        except ValueError:
            return None
        if parts.scheme not in ("http", "https") or parts.hostname not in ORIGIN_HOSTS:
            return None
        path = unquote(parts.path, encoding="latin-1")
        if path == "/" and explicit:
            # The old domain root is only a hosting placeholder; "/" means home.
            path = ORIGIN_ROOT
        if path + "/" == ORIGIN_ROOT:
            path = ORIGIN_ROOT
        if not path.startswith(ORIGIN_ROOT):
            return None
        rel = path[len(ORIGIN_ROOT):]
        is_dir = rel == "" or rel.endswith("/")
        rel = posixpath.normpath(rel) if rel else ""
        rel = "" if rel == "." else rel
        if rel.startswith(".."):
            return None
        if rel in self.dirs:
            is_dir = True
        tail = ("?" + parts.query if parts.query else "") + ("#" + parts.fragment if parts.fragment else "")
        return rel, is_dir, explicit, tail

    def relative(self, target: str, is_dir: bool, out_page: str) -> str:
        start = posixpath.dirname(out_page) or "."
        rel = posixpath.relpath(target or ".", start)
        if is_dir:
            rel = "./" if rel == "." else rel + "/"
        return quote(rel.encode("latin-1"), safe="/-._~!$()*+,;=:@")

    def map_url(self, raw: str, src_page: str, out_page: str):
        found = self.locate(raw, src_page)
        if not found:
            return None
        rel, is_dir, explicit, tail = found
        target = rel if is_dir else self.rename.get(rel, rel)
        if not explicit and target == rel:
            return None  # an ordinary relative link that still works as written
        self.rewrites["absolute -> relative" if explicit else ".php -> .html"] += 1
        return self.relative(target, is_dir, out_page) + tail

    def _sub(self, pattern, text: str, src_page: str, out_page: str) -> str:
        def repl(m):
            for group, wrap in (("dq", '"'), ("sq", "'"), ("uq", "")):
                raw = m.group(group)
                if raw is not None:
                    break
            new = self.map_url(raw, src_page, out_page)
            if new is None:
                return m.group(0)
            return m.group("pre") + wrap + escape(new, quote=True) + wrap

        return pattern.sub(repl, text)

    def rewrite_html(self, text: str, src_page: str, out_page: str) -> str:
        text = self._sub(ATTR_URL, text, src_page, out_page)
        return self._sub(CSS_URL, text, src_page, out_page)

    def rewrite_css(self, text: str, rel: str) -> str:
        return self._sub(CSS_URL, text, rel, rel)

    def rewrite_strings(self, text: str, document: str) -> str:
        def repl(m):
            new = self.map_url(m.group("url"), document, self.rename.get(document, document))
            return m.group(0) if new is None else m.group("q") + new + m.group("q")

        return ORIGIN_IN_TEXT.sub(repl, text)


# --------------------------------------------------------------------------
# Build
# --------------------------------------------------------------------------


SF_DATALESS = 0x40000000  # macOS: the content exists only in iCloud, not on disk


def is_current(dest: Path, data: bytes) -> bool:
    try:
        info = dest.lstat()
    except FileNotFoundError:
        return False
    if not stat.S_ISREG(info.st_mode) or info.st_size != len(data):
        return False
    if getattr(info, "st_flags", 0) & SF_DATALESS:
        return False  # replacing it is quicker than downloading it to compare
    return dest.read_bytes() == data


def iter_links(text: str):
    comments = [(m.start(), m.end()) for m in HTML_COMMENT.finditer(text)]
    for pattern in (ATTR_URL, CSS_URL):
        for m in pattern.finditer(text):
            raw = m.group("dq") if m.group("dq") is not None else m.group("sq")
            if raw is None:
                raw = m.group("uq")
            hidden = any(a <= m.start() < b for a, b in comments)
            yield raw, hidden


def build(source_path: Path, out: Path, raw_dir: Path | None = None) -> int:
    source = open_source(source_path)

    # Two names that differ only in upper/lower case cannot both be checked out
    # on macOS or Windows; keep the one the pages actually refer to.
    kept, skipped = [], []
    for rel in source.files:
        (skipped if is_skipped(rel) else kept).append(rel)
    by_lower = defaultdict(list)
    for rel in kept:
        by_lower[rel.lower()].append(rel)
    clashes = {k: v for k, v in by_lower.items() if len(v) > 1}

    site = Site(source, kept)
    php_files = [f for f in kept if f.endswith(".php")]
    renderer = PhpRenderer(site)
    rendered = {rel: renderer.render_page(rel) for rel in php_files}

    def linked_targets():
        targets = set()
        pages = {**rendered, **{f: site.text(f) for f in kept if f.endswith(HTML_SUFFIXES)}}
        for page, text in pages.items():
            for raw, _hidden in iter_links(text):
                found = site.locate(raw, page)
                if found:
                    targets.add(found[0])
        return targets

    linked = linked_targets()
    dropped_clash = []
    for names in clashes.values():
        used = [n for n in names if n in linked]
        if len(used) > 1:
            raise BuildError(f"files differ only by case and are both linked: {names}")
        keep = used[0] if used else names[-1]
        for n in names:
            if n != keep:
                dropped_clash.append((n, keep))
                site.fileset.discard(n)
    kept = [f for f in kept if f in site.fileset]

    # Files that are only ever pulled in by include (top bar, footer ...) are
    # fragments, not pages.
    partials = {f for f in renderer.included if f not in linked}
    pages = [f for f in php_files if f not in partials]

    for page in pages:
        new = page[: -len(".php")] + ".html"
        if new in site.fileset:
            site.rename[new] = new[: -len(".html")] + STATIC_TWIN_SUFFIX
        site.rename[page] = new
    out_names = Counter(site.rename.get(f, f).lower() for f in kept if f not in partials)
    dupes = [n for n, c in out_names.items() if c > 1]
    if dupes:
        raise BuildError(f"output names collide: {dupes}")

    outputs: dict[str, bytes] = {}
    unmapped_origin = []
    for rel in kept:
        if rel in partials:
            continue
        out_rel = site.rename.get(rel, rel)
        if rel in rendered:
            data = site.rewrite_html(rendered[rel], rel, out_rel).encode("latin-1")
        elif rel.endswith(HTML_SUFFIXES):
            data = site.rewrite_html(site.text(rel), rel, out_rel).encode("latin-1")
        elif rel.endswith(".css"):
            data = site.rewrite_css(site.text(rel), rel).encode("latin-1")
        elif rel.endswith(TEXT_SUFFIXES):
            text = site.text(rel)
            if rel in DOCUMENT_OF:
                text = site.rewrite_strings(text, DOCUMENT_OF[rel])
            elif any(site.locate(m.group("url"), rel) for m in ORIGIN_IN_TEXT.finditer(text)):
                unmapped_origin.append(rel)
            data = text.encode("latin-1")
        else:
            data = source.read(rel)
        outputs[out_rel] = data

    if unmapped_origin:
        raise BuildError(
            "these files still point at the old address; add them to DOCUMENT_OF "
            f"with the page that loads them: {unmapped_origin}"
        )

    # -- check every link that stays inside the congress site ---------------
    out_dirs = {""}
    for f in outputs:
        d = posixpath.dirname(f)
        while d:
            out_dirs.add(d)
            d = posixpath.dirname(d)
    dead = defaultdict(lambda: {"visible": set(), "hidden": set()})
    leftovers = Counter()
    for out_rel, data in outputs.items():
        if not out_rel.endswith(HTML_SUFFIXES):
            continue
        for raw, hidden in iter_links(data.decode("latin-1")):
            url = unescape(raw).strip()
            if not url or url.lower().startswith(NON_LINK_SCHEMES):
                continue
            try:
                parts = urlsplit(url)
            except ValueError:
                continue
            if parts.scheme or parts.netloc:
                if parts.hostname in ORIGIN_HOSTS and parts.path.startswith(ORIGIN_ROOT):
                    leftovers[url] += 1
                continue
            if url.startswith("/"):
                continue  # root of the old domain: was already outside this site
            path = unquote(parts.path, encoding="latin-1")
            if not path:
                continue
            target = posixpath.normpath(posixpath.join(posixpath.dirname(out_rel), path))
            target = "" if target == "." else target
            if target.startswith(".."):
                ok = False
            elif target in out_dirs:
                ok = (posixpath.join(target, "index.html") if target else "index.html") in outputs
            else:
                ok = target in outputs
            if not ok:
                dead[target]["hidden" if hidden else "visible"].add(out_rel)
    if leftovers:
        raise BuildError(f"links to the old address were not rewritten: {dict(leftovers)}")

    # -- write --------------------------------------------------------------
    # Touch only what changed. Deleting the whole folder and writing it again
    # makes sync tools (this repository lives in iCloud Drive) bring the old
    # copies back as "name 2.jpg" duplicates.
    written = removed = 0
    for out_rel, data in outputs.items():
        dest = out / out_rel
        if is_current(dest, data):
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.is_symlink() or dest.exists():
            dest.unlink()
        dest.write_bytes(data)
        dest.chmod(0o644)
        written += 1
    for path in sorted(out.rglob("*"), reverse=True):  # children before parents
        rel = path.relative_to(out).as_posix()
        if path.is_dir() and not path.is_symlink():
            if rel not in out_dirs and not any(path.iterdir()):
                path.rmdir()
        elif rel not in outputs:
            path.unlink()
            removed += 1
    if raw_dir:
        for rel in pages:
            dest = raw_dir / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(rendered[rel].encode("latin-1"))

    # -- report -------------------------------------------------------------
    size = sum(len(d) for d in outputs.values())
    print(f"{len(outputs)} files ({size / 1e6:.1f} MB) in {out}")
    print(f"  written: {written}, already up to date: {len(outputs) - written}, stale files removed: {removed}")
    print(f"  PHP pages rendered to HTML: {len(pages)}")
    print(f"  PHP fragments merged into pages (not published on their own): {len(partials)}")
    for kind, count in sorted(site.rewrites.items()):
        print(f"  links rewritten, {kind}: {count}")
    twins = {k: v for k, v in site.rename.items() if not k.endswith(".php")}
    if twins:
        print("  static pages renamed because a PHP page has the same name:")
        for old, new in sorted(twins.items()):
            print(f"    {old} -> {new}")
    if dropped_clash:
        print("  dropped (same name as another file except for upper/lower case):")
        for dropped, keep in dropped_clash:
            print(f"    {dropped} (kept {keep})")
    for note in sorted(set(renderer.missing)):
        print(f"  warning: {note}")
    if skipped:
        print(f"  developer files left out: {len(skipped)}")
        for rel in skipped:
            print(f"    {rel}")
    visible = {t: v["visible"] for t, v in dead.items() if v["visible"]}
    hidden_only = [t for t, v in dead.items() if not v["visible"]]
    print(f"  links to files that are not in the source: {len(visible)} visible, "
          f"{len(hidden_only)} only inside HTML comments")
    for target, users in sorted(visible.items()):
        sample = ", ".join(sorted(users)[:3]) + (" ..." if len(users) > 3 else "")
        print(f"    {target}  <- {sample}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("source", type=Path, help="the site archive (.tar.gz) or its extracted folder")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help=f"output folder (default: {DEFAULT_OUT})")
    parser.add_argument("--raw-dir", type=Path, help="also write the rendered pages before link rewriting (for checking)")
    args = parser.parse_args()
    try:
        return build(args.source.expanduser(), args.out.expanduser(), args.raw_dir)
    except BuildError as error:
        print(f"build failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
