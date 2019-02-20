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

parser.add_argument('--coco_images_dir', default='images', type=str, metavar='DIR',
                    help='path to fimage folder')

parser.add_argument('--coco_annotations_dir', default='annotations', type=str, metavar='DIR',
                    help='path to annotation folder')

parser.add_argument('--build_image', default=False, action='store_true',
                    help='Build image and mask fro mongoDB database')

parser.add_argument('--build_out', default="COCO-panda.json", type=str,
                    help='Build COCO dataset')

parser.add_argument('--build', default=False, action='store_true',
                    help='Build COCO dataset')

parser.add_argument('--clean_all', default=False, action='store_true',
                    help='Clean COCO dataset amd images')

args    = parser.parse_args()

def mongo_connect():
    url    = args.mongo_url.split("/")
    client = MongoClient("mongodb://" + url[0])
    if(len(url) != 2):
        print("Mongo URL is in wrong format : server/database")
        return None
    return client[url[1]]

def clean_all(COCO_TEMPLATE_FILE, IMAGE_DIR, ANNOTATION_DIR, OUT_FILE):
    print("\n================")
    print("CLEANING PROCEDURE ")
    print("* " + IMAGE_DIR + "/*")
    print("* " + ANNOTATION_DIR + " /*")
    print("* " + OUT_FILE+"\n")
    a = input("Do you want to erase everything ? [N/y]")
    if (a == 'y' or a == 'Y'):
        filelist = glob.glob(IMAGE_DIR + "/*") + glob.glob(ANNOTATION_DIR + "/*")
        pbar = tqdm(filelist)
        for f in pbar:
            pbar.set_description('Removing %s' % f)
            os.remove(f)
        try:
            os.remove(OUT_FILE)
        except:
            print("")

def build_images(DATA_DIR, IMAGE_DIR, ANNOTATION_DIR):
    print("\nBuild Images\n============\n")
    db = mongo_connect()
    pbar = tqdm(db.frameCanvas.find({}).sort([("video_id", 1),("frame_id", 1)]))
    for v in pbar:
        if len(v["skeletons"]) > 0 :
            # Get video info
            video = db.videos.find_one({"_id":ObjectId(v["video_id"])})

            # Extract the frame
            video_cap   = cv2.VideoCapture(DATA_DIR + "/videos/" +video["path"])
            video_cap.set(cv2.CAP_PROP_POS_FRAMES, v["frame_id"])
            _, img = video_cap.read()
            filename = IMAGE_DIR + "/" + str(v["video_id"]) + '-' + str(v["frame_id"])+'.jpg'
            print(filename)
            cv2.imwrite(filename, img)

            # Build the skeleton mask
            mask = np.zeros(img.shape, dtype = "uint8")
            for i, sk in enumerate(v["skeletons"]):
                cv2.rectangle(mask, (int(sk["bbox"][0]), int(sk["bbox"][1])), (int(sk["bbox"][0]+sk["bbox"][2]), int(sk["bbox"][1]+sk["bbox"][3])), (255, 255, 255), -1)
            
            filename = ANNOTATION_DIR + "/" + str(v["video_id"]) + '-' + str(v["frame_id"]) +'.jpg'
            cv2.imwrite(filename, mask)

            pbar.set_description('Built Images: %s' % filename)


def build_coco_dataset_2017(COCO_TEMPLATE_FILE, IMAGE_DIR, ANNOTATION_DIR):
    db = mongo_connect()

    print("\n================")
    print("Template file: " + COCO_TEMPLATE_FILE)
    print("Images dir: " + IMAGE_DIR)
    print("Annotations dir: " + ANNOTATION_DIR)
    print("================\n")

    # Load template
    with open(COCO_TEMPLATE_FILE) as f:
        coco_output = json.load(f)

    pbar = tqdm(glob.glob(IMAGE_DIR + "/*"))
    for image_filename in pbar:
        pbar.set_description('Build coco dataset: %s' % image_filename)
        if os.path.isdir(image_filename):
            continue

        # Build images
        image_id = os.path.basename(image_filename).split(".")[0]
        image = Image.open(image_filename)
        image_info = pycococreatortools.create_image_info(
            image_id, os.path.basename(image_filename), image.size)
        coco_output["images"].append(image_info)

        # Generations of the annotation
        frameCanvas = db.frameCanvas.find({"video_id":image_id.split("-")[0], "frame_id": int(image_id.split("-")[1]) })

        for fc in frameCanvas:
            for sk in fc["skeletons"]:
                annotation = {
                    "isValidation": 0.,
                	"segmentation": [],
                	"area": 0,
                	"iscrowd": 0 if len(fc["skeletons"]) < 2 else 1,
                	"image_id": image_id,
                	"bbox": [],
                	"category_id": 1,
                	"keypoints": [],
                	"num_keypoints": 0
                }

                for e in coco_output["edges"]:
                    annotation["keypoints"].append(sk["keypoints"][e][0])  # x
                    annotation["keypoints"].append(sk["keypoints"][e][1])  # y
                    annotation["keypoints"].append(sk["keypoints"][e][2]) # value
                    if sk["keypoints"][e][0] != 0 or sk["keypoints"][e][1] != 0:
                        annotation["num_keypoints"] = annotation["num_keypoints"] + 1
                annotation["bbox"] = sk["bbox"]
                coco_output["annotations"].append(annotation)

    print("\nDataset generated with success.\n")
    return coco_output

if __name__ == '__main__':
    if args.clean_all:
        clean_all(args.coco_template, args.coco_images_dir, args.coco_annotations_dir, args.build_out)

    if (args.build_image):
        build_images(args.data_dir,args.coco_images_dir, args.coco_annotations_dir)

    if(args.build):
        with open(args.build_out, 'w') as outfile:
            json.dump(build_coco_dataset_2017(args.coco_template, args.coco_images_dir, args.coco_annotations_dir), outfile)
