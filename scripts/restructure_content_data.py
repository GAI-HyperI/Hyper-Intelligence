#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "docs" / "data"


def normalize_space(text: str) -> str:
    text = html.unescape(text).replace("\xa0", " ")
    text = re.sub(r"[ \t\r\f\v]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    return text.strip()


class FragmentParser(HTMLParser):
    BLOCK_TAGS = {"p", "li", "h1", "h2", "h3", "h4", "h5", "h6"}

    def __init__(self) -> None:
        super().__init__()
        self.blocks: list[dict] = []
        self.current_block: dict | None = None
        self.current_text: list[str] = []
        self.list_stack: list[list[str]] = []
        self.href_stack: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        attrs_dict = dict(attrs)
        if tag in self.BLOCK_TAGS:
            self._finish_current_block()
            block_type = "heading" if tag.startswith("h") else "paragraph"
            level = int(tag[1]) if tag.startswith("h") else None
            self.current_block = {"type": block_type, "level": level} if level else {"type": block_type}
            self.current_text = []
        elif tag == "ul":
            self._finish_current_block()
            self.list_stack.append([])
        elif tag == "br":
            self.current_text.append("\n")
        elif tag == "hr":
            self._finish_current_block()
            self.blocks.append({"type": "divider"})
        elif tag == "a":
            href = attrs_dict.get("href", "").strip()
            if href:
                self.href_stack.append(href)

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self.href_stack:
            self.href_stack.pop()
        elif tag == "li":
            text = normalize_space("".join(self.current_text))
            self.current_text = []
            self.current_block = None
            if text and self.list_stack:
                self.list_stack[-1].append(text)
        elif tag in {"p", "h1", "h2", "h3", "h4", "h5", "h6"}:
            self._finish_current_block()
        elif tag == "ul":
            if self.list_stack:
                items = [item for item in self.list_stack.pop() if item]
                if items:
                    self.blocks.append({"type": "list", "items": items})

    def handle_data(self, data: str) -> None:
        if data:
            self.current_text.append(data)

    def get_blocks(self) -> list[dict]:
        self._finish_current_block()
        return [block for block in self.blocks if block]

    def _finish_current_block(self) -> None:
        if not self.current_block:
            return
        text = normalize_space("".join(self.current_text))
        if text:
            self.current_block["text"] = text
            self.blocks.append(self.current_block)
        self.current_block = None
        self.current_text = []


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.href = ""
        self.text_parts: list[str] = []
        self.inside_anchor = False

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag == "a":
            self.inside_anchor = True
            self.href = dict(attrs).get("href", "").strip()

    def handle_endtag(self, tag: str) -> None:
        if tag == "a":
            self.inside_anchor = False

    def handle_data(self, data: str) -> None:
        if self.inside_anchor or not self.href:
            self.text_parts.append(data)

    def parse(self, fragment: str) -> tuple[str, str]:
        self.feed(fragment)
        text = normalize_space("".join(self.text_parts))
        return text, self.href


def html_to_blocks(fragment: str) -> list[dict]:
    parser = FragmentParser()
    parser.feed(fragment)
    return parser.get_blocks()


def extract_linked_text(fragment: str) -> tuple[str, str]:
    parser = LinkParser()
    return parser.parse(fragment)


def blocks_to_paragraphs(blocks: list[dict]) -> list[str]:
    return [block["text"] for block in blocks if block["type"] == "paragraph" and block.get("text")]


def convert_about() -> None:
    path = DATA_DIR / "about.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    path.write_text(
        json.dumps(
            {
                "title": data["title"],
                "blocks": html_to_blocks(data["content"]),
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


def convert_activities() -> None:
    path = DATA_DIR / "activities.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    converted = []
    for item in data:
        title, href = extract_linked_text(item.get("titleHtml", ""))
        date_blocks = html_to_blocks(item.get("dateHtml", ""))
        converted.append(
            {
                "title": title,
                "link": item.get("link") or href,
                "date": "\n".join(blocks_to_paragraphs(date_blocks)) or title,
                "image": item.get("image", ""),
                "featured": bool(item.get("featured")),
            }
        )
    path.write_text(json.dumps(converted, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def convert_journals() -> None:
    path = DATA_DIR / "journals.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    converted = []
    for item in data:
        converted.append(
            {
                "name": item["name"],
                "link": item.get("link", ""),
                "image": item.get("image", ""),
                "issue": normalize_space(" ".join(blocks_to_paragraphs(html_to_blocks(item.get("issuesHtml", ""))))),
                "blocks": html_to_blocks(item.get("contentHtml", "")),
            }
        )
    path.write_text(json.dumps(converted, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def convert_news() -> None:
    path = DATA_DIR / "news.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    converted = []
    for item in data:
        title, href = extract_linked_text(item.get("titleHtml", ""))
        converted.append(
            {
                "title": title,
                "link": item.get("link") or href,
                "blocks": html_to_blocks(item.get("bodyHtml", "")),
            }
        )
    path.write_text(json.dumps(converted, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def convert_awards() -> None:
    path = DATA_DIR / "awards.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    converted = []
    for item in data:
        converted.append(
            {
                "name": item["name"],
                "link": item.get("link", ""),
                "blocks": html_to_blocks(item.get("contentHtml", "")),
            }
        )
    path.write_text(json.dumps(converted, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def convert_task_forces() -> None:
    path = DATA_DIR / "task-forces.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    converted = []
    for item in data:
        converted.append(
            {
                "name": item["name"],
                "link": item.get("link", ""),
                "blocks": html_to_blocks(item.get("contentHtml", "")),
            }
        )
    path.write_text(json.dumps(converted, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    convert_about()
    convert_activities()
    convert_journals()
    convert_news()
    convert_awards()
    convert_task_forces()
    print("Restructured content JSON into plain data blocks.")


if __name__ == "__main__":
    main()
