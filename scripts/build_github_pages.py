#!/usr/bin/env python3
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "docs" / "data"
DOCS_DIR = ROOT / "docs"
ASSETS_DIR = DOCS_DIR / "assets"
PUBLIC_EXPORT_JSON = ASSETS_DIR / "public-db-export.json"
PUBLIC_EXPORT_DIR = ASSETS_DIR / "public-db"


DATA_FILES = {
    "site": "site.json",
    "about": "about.json",
    "organization": "organization.json",
    "officers": "officers.json",
    "activities": "activities.json",
    "journals": "journals.json",
    "news": "news.json",
    "newsletters": "newsletters.json",
    "awards": "awards.json",
    "taskForces": "task-forces.json",
}


def load_json_file(filename: str):
    path = DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Missing data source: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def load_site_data() -> dict:
    payload = {key: load_json_file(filename) for key, filename in DATA_FILES.items()}
    payload["site"]["generatedAt"] = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    payload["featuredActivities"] = [item for item in payload["activities"] if item.get("featured")]
    payload["stats"] = {
        "activities": len(payload["activities"]),
        "journals": len(payload["journals"]),
        "taskForces": len(payload["taskForces"]),
        "members": sum(len(group.get("members", [])) for group in payload["organization"]),
    }
    return payload


def build_public_export(site_data: dict) -> dict:
    return {
        "manifest": {
            "generatedAt": site_data["site"]["generatedAt"],
            "schemaVersion": 3,
            "sourceDump": site_data["site"]["sourceDump"],
            "exports": {
                "scope": "assets/public-db/scope.json",
                "settings": "assets/public-db/settings.json",
                "activities": "assets/public-db/activities.json",
                "featuredActivities": "assets/public-db/featured-activities.json",
                "journals": "assets/public-db/journals.json",
                "news": "assets/public-db/news.json",
                "newsletters": "assets/public-db/newsletters.json",
                "taskForces": "assets/public-db/task-forces.json",
                "awards": "assets/public-db/awards.json",
                "organization": "assets/public-db/organization.json",
                "officers": "assets/public-db/officers.json",
                "stats": "assets/public-db/stats.json",
            },
        },
        "files": {
            "scope": {
                "title": site_data["about"]["title"],
                "blocks": site_data["about"]["blocks"],
            },
            "settings": {
                "mainPageImage": site_data["site"]["heroImage"],
                "contactEmail": site_data["site"]["contactEmail"],
                "contactCc": site_data["site"]["contactCc"],
            },
            "activities": site_data["activities"],
            "featured-activities": site_data["featuredActivities"],
            "journals": site_data["journals"],
            "news": site_data["news"],
            "newsletters": site_data["newsletters"],
            "task-forces": site_data["taskForces"],
            "awards": site_data["awards"],
            "organization": site_data["organization"],
            "officers": site_data["officers"],
            "stats": site_data["stats"],
        },
    }


def collect_asset_paths(value) -> list[str]:
    found: list[str] = []
    if isinstance(value, dict):
        for nested in value.values():
            found.extend(collect_asset_paths(nested))
    elif isinstance(value, list):
        for nested in value:
            found.extend(collect_asset_paths(nested))
    elif isinstance(value, str) and value.startswith("assets/"):
        found.append(value)
    return found


def validate_assets(site_data: dict) -> None:
    missing = [path for path in collect_asset_paths(site_data) if not (DOCS_DIR / path).exists()]
    if missing:
        joined = "\n".join(missing[:20])
        raise FileNotFoundError(f"Referenced assets are missing:\n{joined}")


def write_outputs(site_data: dict, public_export: dict) -> None:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_EXPORT_JSON.write_text(json.dumps(public_export["manifest"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for name, payload in public_export["files"].items():
        output = PUBLIC_EXPORT_DIR / f"{name}.json"
        output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    site_data = load_site_data()
    validate_assets(site_data)
    public_export = build_public_export(site_data)
    write_outputs(site_data, public_export)
    print(f"Loaded page data from {DATA_DIR.relative_to(ROOT)}")
    print(f"Generated: {PUBLIC_EXPORT_JSON.relative_to(ROOT)}")
    print(f"Generated directory: {PUBLIC_EXPORT_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
