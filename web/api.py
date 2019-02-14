import argparse
import numpy as np
import random
import base64
import cv2
import json
from bson.objectid import ObjectId

from io import BytesIO
from PIL import Image

from flask import Flask, render_template, jsonify
from flask_pymongo import PyMongo
from flask import abort

parser = argparse.ArgumentParser(description='PyTorch rtpose Training')
parser.add_argument('--data_dir', default='data/', type=str, metavar='DIR',
                    help='path to where coco images stored')

args    = parser.parse_args()
app     = Flask(__name__, static_url_path='/static')
app.config["MONGO_URI"] = "mongodb://localhost:27017/tidzam-panda"

mongo = PyMongo(app)

def get_random_video():
    return mongo.db.videos.find()[random.randrange(1)]

def img_to_b64(img):
    pil_img = Image.fromarray(img)
    buff = BytesIO()
    pil_img.save(buff, format="JPEG")
    new_image_string = base64.b64encode(buff.getvalue()).decode("utf-8")
    return 'data:image/jpg;base64,' + str(new_image_string)

def extract_frame(video_path, idx):
    video_cap   = cv2.VideoCapture(video_path)
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
    video = get_random_video()
    return render_template('index.html', url=video["_id"])

###

@app.route('/video/<string:video_id>/<int:idx>', methods=['GET'])
def get_frame(video_id, idx):
    try:
        video = mongo.db.videos.find_one({"_id" : ObjectId(video_id)})
        return jsonify(extract_frame(args.data_dir + '/videos/'+video["path"], idx))
    except:
        abort(404)

@app.route('/video/<string:video_id>/<int:idx>', methods=['POST'])
def post_frame_canvas(video_id, idx):
    print("POST received")
    print(request.json)
    request.json.video_id = video_id
    request.json.frame_id  = idx
    mongo.db.frameCanvas.insert(request.json)
if __name__ == '__main__':
    app.run()
