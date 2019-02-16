import argparse
import numpy as np
import random
import base64
import cv2
import json
import glob
from bson.objectid import ObjectId

from io import BytesIO
from PIL import Image

from flask import Flask, render_template, jsonify
from flask_pymongo import PyMongo
from flask import request
from flask import abort

parser = argparse.ArgumentParser(description='PyTorch rtpose Training')

parser.add_argument('--data_dir', default='data/', type=str, metavar='DIR',
                    help='path to where coco images stored')

parser.add_argument('--mongo_url', default='localhost:27017/tidzam-panda', type=str, metavar='DIR',
                    help='path to where coco images stored')

args    = parser.parse_args()
app     = Flask(__name__, static_url_path='/static')
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
                'path':path,
                'width':img.shape[1],
                'height':img.shape[0]
            })

def get_random_video():
    return mongo.db.videos.find()[random.randrange(1)]

def img_to_b64(img):
    pil_img = Image.fromarray(img)
    buff    = BytesIO()
    pil_img.save(buff, format='JPEG')

    return 'data:image/jpg;base64,' + str(base64.b64encode(buff.getvalue()).decode('utf-8'))

def prepare_frame(video_id, frame_id):
    video = mongo.db.videos.find_one({'_id' : ObjectId(video_id)})
    del video['_id']

    video_cap   = cv2.VideoCapture(args.data_dir + '/videos/' + video['path'])
    frame_count = int(video_cap.get(cv2.CAP_PROP_FRAME_COUNT))

    video_cap.set(cv2.CAP_PROP_POS_FRAMES, frame_id)
    _, img = video_cap.read()

    video_cap.release()

    return {**{
        'img'   : img,
        'width' : img.shape[1],
        'height': img.shape[0],
        'size'  : frame_count,
        'video_id' : video_id,
        'frame_id' : frame_id
    }, **video}

def load_skeleton(prepared_frame):
    frame_canvas = mongo.db.frameCanvas.find_one({
        'video_id' : prepared_frame['video_id'],
        'frame_id': prepared_frame['frame_id']
    })

    if frame_canvas is not None:
        del frame_canvas['_id']

        if len(frame_canvas['skeletons']) > 0:
            return { **prepared_frame, **frame_canvas }


    prev_frame_canvas = list(mongo.db.frameCanvas.find({
        'video_id' : prepared_frame['video_id'],
        'frame_id': {'$lt': prepared_frame['frame_id']}
    }).sort('frame_id', -1).limit(1))

    # If there is no previous canvas on the video, we leave
    if(len(prev_frame_canvas) == 0):
        return prepared_frame

    # OpenCV Extrapolation
    prev_frame = prepare_frame(prepared_frame['video_id'], prev_frame_canvas[0]['frame_id'])
    pts        = []
    for skeleton in [skeleton['keypoints'] for skeleton in prev_frame_canvas[0]['skeletons']]:
        for pt in skeleton:
            pts.append(tuple(skeleton[pt]))

    prev_frame_gray     = cv2.cvtColor(prev_frame['img'], cv2.COLOR_BGR2GRAY)
    prepared_frame_gray = cv2.cvtColor(prepared_frame['img'], cv2.COLOR_BGR2GRAY)

    # import matplotlib.pyplot as plt
    # plt.figure(figsize=(10, 8))
    # plt.subplot(121)
    # plt.imshow(prev_frame_gray)
    # for pt in pts:
    #     plt.scatter(pt[0], pt[1])
    # plt.subplot(122)
    # plt.imshow(prepared_frame_gray)
    # plt.show()
    # exit()

    pts_data = np.array(pts, dtype=np.float32)[:, :2]
    pts1, st, err = cv2.calcOpticalFlowPyrLK(
        prevImg  = prev_frame_gray,
        nextImg  = prepared_frame_gray,
        prevPts  = pts_data,
        nextPts  = None,
        winSize  = (15, 15),
        maxLevel = 2,
        criteria = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 10, 0.03)
    )

    i                           = 0
    prepared_frame['skeletons'] = []
    for skeleton in [skeleton['keypoints'] for skeleton in prev_frame_canvas[0]['skeletons']]:
        sk = {}

        for pt in skeleton:
            point  = pts1[i].tolist()
            sk[pt] = [point[0], point[1], pts[i][2]]
            i     += 1

        prepared_frame['skeletons'].append({'keypoints': sk})

    return prepared_frame


@app.route('/')
def index():
    return render_template(
        'index.html',
        url=get_random_video()['_id']
    )

###

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
    print('\n', f, '\n')

    if ('skeletons' in f):
        mongo.db.frameCanvas.delete_one({'video_id' : video_id, 'frame_id': frame_id})
        id = mongo.db.frameCanvas.insert(f)

    return jsonify({})


if __name__ == '__main__':
    load_videos()

    app.run()
