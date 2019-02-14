import numpy as np
import base64
import cv2
import json

from io import BytesIO
from PIL import Image

from flask import Flask, render_template, jsonify
app = Flask(__name__)

def get_random_video_url():
    return 'PANDAS.mp4'

def img_to_b64(img):
    pil_img = Image.fromarray(img)
    buff = BytesIO()
    pil_img.save(buff, format="JPEG")
    new_image_string = base64.b64encode(buff.getvalue()).decode("utf-8")
    return 'data:image/jpg;base64,' + str(new_image_string)

def extract_frame(video_url, idx):
    video_cap   = cv2.VideoCapture(video_url)
    frame_count = int(video_cap.get(cv2.CAP_PROP_FRAME_COUNT))

    video_cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
    _, img = video_cap.read()

    video_cap.release()

    return json.dumps({
        'img'   : img_to_b64(img),
        'width' : img.shape[1],
        'height': img.shape[0],
        'size'  : frame_count
    })

@app.route('/')
def index():
    return render_template('index.html', url=get_random_video_url())

@app.route('/video/<string:video_url>/<int:idx>', methods=['GET'])
def get_frame(video_url, idx):
    return jsonify(extract_frame(f'/home/yliess/Bureau/PANDAS/PECS/static/assets/videos/{video_url}', idx))

if __name__ == '__main__':
    app.run()
