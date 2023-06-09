from flask import Flask, request
from flask_cors import CORS
from PIL import Image
import base64
import io
import serverside_backend as ssbk
import ssl

app = Flask(__name__)
CORS(app)

@app.route('/pass_to_backend', methods=['POST'])
def pass_to_backend():
    image_data = request.json['image']
    image_data = image_data.replace("data:image/jpeg;base64,", "")
    image = Image.open(io.BytesIO(base64.b64decode(image_data)))
    
    text = request.json['text']
    slider_value = request.json['sliderValue']
    body_part = request.json["bodyPart"]

    backend_response = ssbk.get_treatment(image, text, int(slider_value), int(body_part))
    
    return backend_response

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000)