"""Regression coverage for metadata-free private image derivatives."""
import base64
import hashlib
import importlib.util
import io
from pathlib import Path
import tempfile
import unittest
import xml.etree.ElementTree as ET
from PIL import Image
from pillow_heif import register_heif_opener

spec = importlib.util.spec_from_file_location("convert_images", Path(__file__).parents[1] / "scripts" / "convert_images.py")
converter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(converter)

class ConversionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        register_heif_opener()

    def fixture(self, suffix=".png"):
        source = self.root / ("reference" + suffix)
        exif = Image.Exif()
        exif[270] = "PRIVATE synthetic metadata"
        exif[274] = 6
        im = Image.new("RGB", (30, 20), (10, 80, 120))
        options = {"exif": exif}
        if suffix == ".png":
            options["icc_profile"] = b"synthetic profile metadata"
        im.save(source, format="HEIF" if suffix == ".heic" else "PNG", **options)
        return source

    def output_image(self, path):
        if path.suffix == ".svg":
            root = ET.fromstring(path.read_bytes())
            self.assertEqual(root.tag, "{http://www.w3.org/2000/svg}svg")
            href = root.find("{http://www.w3.org/2000/svg}image").attrib["href"]
            return Image.open(io.BytesIO(base64.b64decode(href.split(",", 1)[1], validate=True)))
        return Image.open(path)

    def test_metadata_removed_from_every_output(self):
        source = self.fixture()
        with Image.open(source) as original:
            self.assertTrue(original.getexif())
            self.assertIn("icc_profile", original.info)
        output = self.root / "out"
        output.mkdir()
        for path in converter.convert(source, output, ["png", "webp", "svg"], 16, 82, False):
            with self.subTest(format=path.suffix), self.output_image(path) as im:
                im.load()
                self.assertFalse(im.getexif(), "private EXIF retained")
                self.assertNotIn("exif", im.info)
                self.assertNotIn("xmp", im.info)
                self.assertNotIn("icc_profile", im.info)

    def test_orientation_and_resize(self):
        source = self.fixture()
        output = self.root / "out"
        output.mkdir()
        [path] = converter.convert(source, output, ["png"], 15, 82, False)
        with Image.open(path) as im:
            self.assertEqual(im.size, (10, 15))

    def test_source_and_existing_destination_preserved(self):
        source = self.fixture()
        before = hashlib.sha256(source.read_bytes()).hexdigest()
        output = self.root / "out"
        output.mkdir()
        destination = output / "reference.png"
        destination.write_bytes(b"existing bytes")
        self.assertEqual(converter.convert(source, output, ["png"], None, 82, False), [])
        self.assertEqual(destination.read_bytes(), b"existing bytes")
        self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(), before)

    def test_heic_to_all_formats(self):
        source = self.fixture(".heic")
        output = self.root / "out"
        output.mkdir()
        paths = converter.convert(source, output, ["png", "webp", "svg"], 16, 82, False)
        self.assertEqual(len(paths), 3)
        for path in paths:
            with self.output_image(path) as im:
                im.load()
                self.assertLessEqual(max(im.size), 16)
                self.assertFalse(im.getexif())

if __name__ == "__main__":
    unittest.main()
