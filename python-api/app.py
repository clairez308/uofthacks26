import os
import base64
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from PIL import Image
from google import genai

# -------------------
# Setup
# -------------------
load_dotenv()

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY missing")

client = genai.Client(api_key=GEMINI_API_KEY)

# Use a currently supported Gemini model
MODEL = "models/gemini-2.5-flash"  # Vision-capable, fast, updated

# -------------------
# Helpers
# -------------------
def load_image():
    """
    Load image from file upload or base64 JSON.
    Returns PIL Image object or None if not found.
    """
    if "image" in request.files:
        return Image.open(request.files["image"].stream)

    if request.is_json and "image" in request.json:
        data = request.json["image"]
        if data.startswith("data:image"):
            data = data.split(",")[1]
        image_bytes = base64.b64decode(data)
        return Image.open(io.BytesIO(image_bytes))

    return None


def image_to_query(image: Image.Image) -> str:
    """
    Uses Gemini Vision to generate a single Google Shopping query from an image.
    Returns a plain string suitable for SerpAPI.
    """
    prompt = """
Analyze the attached image (drawing, sketch, or photo) and generate a concise shopping query
that a person would type into Google Shopping.

Rules:
1. Include visible features: object, color(s), material(s), style(s), notable attributes.
2. Exclude speculative or uncertain attributes.
3. Ignore text unless it clearly identifies a brand.
4. Output a single plain line of text:
   - No markdown
   - No quotes
   - No punctuation at start or end
   - No explanation
5. Use natural, human-like shopping search language.
"""

    response = client.models.generate_content(
        model=MODEL,
        contents=[prompt, image],
    )

    return response.text.strip()

# -------------------
# Routes
# -------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/image-to-query", methods=["POST"])
def image_to_search_query():
    image = load_image()
    if not image:
        return jsonify({"error": "No image provided"}), 400

    try:
        query = image_to_query(image)
        return jsonify({"query": query})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------
# Run
# -------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
