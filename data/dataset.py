import argparse
import json
import cv2
import glob
import os
import shutil
import numpy as np

from PIL import Image
from pymongo import MongoClient
from bson.objectid import ObjectId
from pycococreatortools import pycococreatortools
from tqdm import tqdm

parser = argparse.ArgumentParser(description='Tidzam Panda COCO Dataset Manager')

parser.add_argument('--mongo_url', default='localhost:27017/tidzam-panda', type=str, metavar='DIR',
                    help='mongoDB URL: server/database')
parser.add_argument('--data_dir', default='./', type=str, metavar='DIR',
                    help='path to where coco images stored')
parser.add_argument('--coco_template', default='dataset_coco_tpl.json', type=str, metavar='FILE',
                    help='path to template file')

parser.add_argument('--train_images_dir', default='dataset/train2017/', type=str, metavar='DIR',
                    help='path to fimage folder')
parser.add_argument('--val_images_dir', default='dataset/val2017/', type=str, metavar='DIR',
                    help='path to fimage folder')
parser.add_argument('--val_split_factor', default=0.3, type=float, metavar='DIR',
                    help='split factor for validation set')
parser.add_argument('--annotations_dir', default='dataset/annotations/', type=str, metavar='DIR',
                    help='path to annotation folder')

parser.add_argument('--build_image', default=False, action='store_true',
                    help='Build image and mask fro mongoDB database')
parser.add_argument('--build', default=False, action='store_true',
                    help='Build COCO dataset')

args    = parser.parse_args()

def mongo_connect():
    url    = args.mongo_url.split("/")
    client = MongoClient("mongodb://" + url[0])

    if(len(url) != 2):
        print("Mongo URL is in wrong format : server/database")
        return None

    return client[url[1]]

def build_images(DATA_DIR, TRAIN_IMAGE_DIR, VAL_IMAGE_DIR, VAL_SPLIT_FACTOR):
    print("\n================")
    print("Data dir         : " + DATA_DIR)
    print("Train images dir : " + TRAIN_IMAGE_DIR)
    print("Val images dir   : " + VAL_IMAGE_DIR)
    print("Val split factor : " + str(VAL_SPLIT_FACTOR))
    print("================\n")

    db = mongo_connect()

    frame_canvas = db.frameCanvas.find({}).sort([("video_id", 1),("frame_id", 1)])
    frame_count  = db.frameCanvas.find({}).count()
    pbar         = tqdm(frame_canvas, total=frame_count)

    val_indexes = np.random.choice(
        frame_count,
        int(VAL_SPLIT_FACTOR * frame_count),
        replace=False
    )
    
    for i, v in enumerate(pbar):
        if len(v["skeletons"]) > 0 :
            IMAGE_DIR = VAL_IMAGE_DIR if i in val_indexes else TRAIN_IMAGE_DIR

            # Get video info
            video = db.videos.find_one({"_id": ObjectId(v["video_id"])})

            # Extract the frame
            video_cap   = cv2.VideoCapture(DATA_DIR + "/videos/" + video["path"])
            video_cap.set(cv2.CAP_PROP_POS_FRAMES, v["frame_id"])

            _, img   = video_cap.read()
            filename = IMAGE_DIR + "/" + str(v["video_id"]) + '-' + str(v["frame_id"]) + '.jpg'

            cv2.imwrite(filename, img)
            pbar.set_description('Build Image: %s' % filename)


def build_coco_dataset_2017(COCO_TEMPLATE_FILE, TRAIN_IMAGE_DIR, VAL_IMAGE_DIR, ANNOTATION_DIR):
    def build_dataset(db, COCO_TEMPLATE_FILE, IMAGE_DIR, ANNOTATION_FILE):
        # Load template
        with open(COCO_TEMPLATE_FILE) as f:
            coco_output = json.load(f)

        pbar = tqdm(glob.glob(IMAGE_DIR + "/*"))
        for image_filename in pbar:
            pbar.set_description('Build coco dataset: %s' % image_filename)

            if os.path.isdir(image_filename):
                continue

            # Build images
            image_id   = os.path.basename(image_filename).split(".")[0]
            image      = Image.open(image_filename)
            image_info = pycococreatortools.create_image_info(
                image_id,
                os.path.basename(image_filename),
                image.size
            )

            coco_output["images"].append(image_info)

            # Generations of the annotation
            frameCanvas = db.frameCanvas.find({
                "video_id": image_id.split("-")[0],
                "frame_id": int(image_id.split("-")[1])
            })

            for fc in frameCanvas:
                for sk in fc["skeletons"]:
                    annotation = {
                    	"segmentation" : [],
                    	"area"         : 0,
                    	"iscrowd"      : 0 if len(fc["skeletons"]) < 2 else 1,
                    	"image_id"     : image_id,
                    	"bbox"         : [],
                    	"category_id"  : 1,
                    	"keypoints"    : [],
                    	"num_keypoints": 0
                    }

                    for e in coco_output["edges"]:
                        annotation["keypoints"].append(sk["keypoints"][e][0]) # x
                        annotation["keypoints"].append(sk["keypoints"][e][1]) # y
                        annotation["keypoints"].append(sk["keypoints"][e][2]) # value

                        if sk["keypoints"][e][0] != 0 or sk["keypoints"][e][1] != 0:
                            annotation["num_keypoints"] = annotation["num_keypoints"] + 1

                    annotation["bbox"] = sk["bbox"]
                    coco_output["annotations"].append(annotation)

        with open(ANNOTATION_FILE, 'w') as fp:
            print(json.dumps(coco_output, sort_keys=True, indent=4))
            json.dump(coco_output, fp, sort_keys=True, indent=4)

        print("\nAnnotation [%s] generated with success.\n" % ANNOTATION_FILE)

    db = mongo_connect()

    print("\n================")
    print("Template file    : " + COCO_TEMPLATE_FILE)
    print("Train images dir : " + TRAIN_IMAGE_DIR)
    print("Val images dir   : " + VAL_IMAGE_DIR)
    print("Annotations dir  : " + ANNOTATION_DIR)
    print("================\n")

    build_dataset(db, COCO_TEMPLATE_FILE, TRAIN_IMAGE_DIR, os.path.join(ANNOTATION_DIR, 'person_keypoints_train2017.json'))
    build_dataset(db, COCO_TEMPLATE_FILE, VAL_IMAGE_DIR,   os.path.join(ANNOTATION_DIR, 'person_keypoints_val2017.json'))


if __name__ == '__main__':
    if args.build_image:
        build_images(
            args.data_dir,
            args.train_images_dir,
            args.val_images_dir,
            args.val_split_factor
        )

    if args.build:
        build_coco_dataset_2017(
            args.coco_template,
            args.train_images_dir,
            args.val_images_dir,
            args.annotations_dir
        )
