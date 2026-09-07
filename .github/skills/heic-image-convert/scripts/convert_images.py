"""Convert HEIC/HEIF/JPEG/PNG reference images into safe project derivatives."""

from __future__ import annotations

import argparse
import base64
import io
from pathlib import Path

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

SUPPORTED_INPUTS = {".heic", ".heif", ".jpg", ".jpeg", ".png", ".webp"}
SUPPORTED_OUTPUTS = {"png", "webp", "svg"}


def find_inputs(source: Path) -> list[Path]:
    if source.is_file():
        return [source]
    return sorted(path for path in source.rglob("*") if path.suffix.lower() in SUPPORTED_INPUTS)


def resize(image: Image.Image, max_edge: int | None) -> Image.Image:
    if not max_edge or max(image.size) <= max_edge:
        return image
    copy = image.copy()
    copy.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
    return copy


def to_png_bytes(image: Image.Image) -> bytes:
    payload = io.BytesIO()
    image.save(payload, format="PNG", optimize=True)
    return payload.getvalue()


def write_svg_wrapper(image: Image.Image, destination: Path) -> None:
    encoded = base64.b64encode(to_png_bytes(image)).decode("ascii")
    width, height = image.size
    destination.write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">'
        f'<image width="{width}" height="{height}" href="data:image/png;base64,{encoded}"/>'
        "</svg>",
        encoding="utf-8",
    )


def convert(source: Path, output_dir: Path, formats: list[str], max_edge: int | None, quality: int, overwrite: bool) -> list[Path]:
    with Image.open(source) as opened:
        image = resize(ImageOps.exif_transpose(opened).convert("RGBA"), max_edge)
    written: list[Path] = []
    for image_format in formats:
        destination = output_dir / f"{source.stem}.{image_format}"
        if destination.exists() and not overwrite:
            print(f"skip {destination} (already exists)")
            continue
        if image_format == "png":
            image.save(destination, format="PNG", optimize=True)
        elif image_format == "webp":
            image.save(destination, format="WEBP", quality=quality, method=6)
        else:
            write_svg_wrapper(image, destination)
        written.append(destination)
        print(f"wrote {destination}")
    return written


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert HEIC/HEIF files into PNG, WebP, or PNG-backed SVG.")
    parser.add_argument("source", type=Path, help="An image file or directory to scan recursively")
    parser.add_argument("--output", type=Path, required=True, help="Directory for converted derivatives")
    parser.add_argument("--formats", nargs="+", default=["png", "webp"], choices=sorted(SUPPORTED_OUTPUTS))
    parser.add_argument("--max-edge", type=int, default=None, help="Resize so the longest edge is at most this many pixels")
    parser.add_argument("--quality", type=int, default=82, choices=range(1, 101), metavar="1..100")
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    register_heif_opener()
    inputs = find_inputs(args.source)
    if not inputs:
        raise SystemExit(f"No supported images found in {args.source}")
    args.output.mkdir(parents=True, exist_ok=True)
    for source in inputs:
        convert(source, args.output, args.formats, args.max_edge, args.quality, args.overwrite)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
