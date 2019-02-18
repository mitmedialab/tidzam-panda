import argparse
import numpy as np
import random
import base64
import cv2
import json
import glob

from io import BytesIO
from PIL import Image

from flask import Flask, render_template, jsonify
from bson.objectid import ObjectId
from flask_pymongo import PyMongo
from flask import request
from flask import abort

parser = argparse.ArgumentParser(description='PyTorch rtpose Training')

parser.add_argument('--data_dir', default='data/', type=str, metavar='DIR',
                    help='path to where coco images stored')

parser.add_argument('--mongo_url', default='localhost:27017/tidzam-panda', type=str, metavar='DIR',
                    help='path to where coco images stored')

args                    = parser.parse_args()
app                     = Flask(__name__, static_url_path='/static')
app.config['MONGO_URI'] = 'mongodb://' + args.mongo_url

mongo = PyMongo(app)

def load_videos():
    print('Load Videos from: ' + args.data_dir)
    videos = glob.glob(args.data_dir + '/videos/*.mp4')

    for v in videos:
        path = v.split('/')[-1]

        if mongo.db.videos.find_one({'path' : path}) is None:
            print('Add ' + path)

            video_cap = cv2.VideoCapture(v)
            video_cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

            _, img = video_cap.read()

            mongo.db.videos.insert({
                'path'  : path,
                'width' : img.shape[1],
                'height': img.shape[0],
                'status': 0
            })

    print()

def get_video(video_id):
    return mongo.db.videos.find_one({ '_id': ObjectId(video_id) })

def img_to_b64(img):
    pil_img = Image.fromarray(img)
    buff    = BytesIO()
    pil_img.save(buff, format='JPEG')

    return 'data:image/jpg;base64,' + str(base64.b64encode(buff.getvalue()).decode('utf-8'))

def prepare_frame(video_id, frame_id):
    video = get_video(video_id)
    del video['_id']

    video_cap   = cv2.VideoCapture(args.data_dir + '/videos/' + video['path'])
    frame_count = int(video_cap.get(cv2.CAP_PROP_FRAME_COUNT))

    video_cap.set(cv2.CAP_PROP_POS_FRAMES, frame_id)
    _, img = video_cap.read()

    video_cap.release()

    return {**{
        'img'      : img,
        'width'    : img.shape[1],
        'height'   : img.shape[0],
        'size'     : frame_count,
        'video_id' : video_id,
        'frame_id' : frame_id
    }, **video}

def load_skeleton(next_frame):
    frame_canvas = mongo.db.frameCanvas.find_one({
        'video_id': next_frame['video_id'],
        'frame_id': next_frame['frame_id']
    })

    prev_frame_canvas = mongo.db.frameCanvas.find_one({
        'video_id': next_frame['video_id'],
        'frame_id': (next_frame['frame_id'] - 1)
    })

    if frame_canvas is not None:
        del frame_canvas['_id']

        if prev_frame_canvas is None:
            return { **next_frame, **frame_canvas }

        if len(frame_canvas['skeletons']) == len(prev_frame_canvas['skeletons']):
            return { **next_frame, **frame_canvas }

    # If there is no previous canvas on the video, we leave
    if prev_frame_canvas is not None:
        if len(prev_frame_canvas) == 0:
            return next_frame

        if len(prev_frame_canvas['skeletons']) == 0:
            return next_frame

        # OpenCV Extrapolation
        prev_frame = prepare_frame(next_frame['video_id'], prev_frame_canvas['frame_id'])
        pts        = []
        for skeleton in [skeleton for skeleton in prev_frame_canvas['skeletons']]:

            if frame_canvas:
                skeleton_already_present = False
                for sk in frame_canvas["skeletons"]:
                    if skeleton["id"] == sk["id"]:
                        skeleton_already_present = True
                if skeleton_already_present:
                    continue

            for pt in skeleton['keypoints']:
                pts.append(tuple(skeleton['keypoints'][pt]))

        prev_frame_gray = cv2.cvtColor(prev_frame['img'], cv2.COLOR_BGR2GRAY)
        next_frame_gray = cv2.cvtColor(next_frame['img'], cv2.COLOR_BGR2GRAY)

        pts_data = np.array(pts)[:, :2].astype(np.float32)

        pts1, st, err = cv2.calcOpticalFlowPyrLK(
            prevImg  = prev_frame_gray,
            nextImg  = next_frame_gray,
            prevPts  = pts_data,
            nextPts  = None,
            winSize  = (15, 15),
            maxLevel = 2,
            criteria = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 10, 0.03)
        )

        i                       = 0
        next_frame['skeletons'] = []
        for skeleton in [skeleton['keypoints'] for skeleton in prev_frame_canvas['skeletons']]:
            sk = {}

            for pt in skeleton:
                point  = pts1[i].tolist()
                sk[pt] = [point[0], point[1], pts[i][2]]
                i     += 1

            next_frame['skeletons'].append({'keypoints': sk})

    return next_frame


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video/<string:video_id>/')
def skeleton(video_id):
    return render_template(
        'video.html',
        url=video_id
    )

###
@app.route('/video/', methods=['GET'])
def get_videos():
    res = []
    for video in mongo.db.videos.find():
        video["_id"] = str(video["_id"])
        res.append(video)
    return jsonify(res)

@app.route('/video/<string:video_id>/status', methods=['GET'])
def get_video_status(video_id):
    res = mongo.db.videos.find_one({'_id': ObjectId(video_id)})
    del res['_id']
    return jsonify(res)

@app.route('/video/<string:video_id>/status', methods=['POST'])
def set_video_status(video_id):
    res = mongo.db.videos.update_one(
        {'_id' : ObjectId(video_id)},
        {'$set': {
            'status': int(json.loads(str(request.data, 'utf-8'))['status'])
        }}
    )
    return jsonify({})


@app.route('/video/<string:video_id>/<int:frame_id>', methods=['GET'])
def get_frame(video_id, frame_id):
    frame           = prepare_frame(video_id, frame_id)
    frame           = load_skeleton(frame)
    frame['img']    = img_to_b64(frame['img'])
    return jsonify(frame)

@app.route('/video/<string:video_id>/<int:frame_id>', methods=['POST'])
def post_frame_canvas(video_id, frame_id):
    f             = json.loads(str(request.data, 'utf-8'))
    f['video_id'] = video_id
    f['frame_id'] = frame_id

    if ('skeletons' in f):
        mongo.db.frameCanvas.delete_one({'video_id' : video_id, 'frame_id': frame_id})
        id = mongo.db.frameCanvas.insert(f)

    return jsonify({})


if __name__ == '__main__':
    load_videos()

    app.run(threaded=True)
