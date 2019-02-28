
# TidZam-panda

This framework provides a complete toolchain for skeleton tracking. It is applied on panda tracking in collaboration with San Diego zoo. It is composed of a web editor which allow us to build a training dataset with skeleton labelization over videos and a training pipeline implemented with PyTorch.

<center>
  
  <img src ="https://raw.githubusercontent.com/mitmedialab/tidzam-panda/master/web/static/img/example.png" />
</center>

## Dependencies

```bash
apt-get install mongo
pip install Flask-PyMongo argparse
pip install git+git://github.com/waspinator/pycococreator.git@0.2.0
```

## HowTo
#### Web Interface 
```
python3 api.py --data_dir=../video-folder/

usage: api.py [-h] [--data_dir DIR] [--mongo_url DIR]

optional arguments:
  -h, --help       show this help message and exit
  --data_dir DIR   path to where coco images stored
  --mongo_url DIR  path to where coco images stored

```
#### COCO Dataset Generation
```
usage: dataset.py [-h] [--mongo_url DIR] [--data_dir DIR]
                  [--coco_template FILE] [--train_images_dir DIR]
                  [--val_images_dir DIR] [--val_split_factor DIR]
                  [--annotations_dir DIR] [--build_image] [--build]

Tidzam Panda COCO Dataset Manager

optional arguments:
  -h, --help            show this help message and exit
  --mongo_url DIR       mongoDB URL: server/database
  --data_dir DIR        path to where coco images stored
  --coco_template FILE  path to template file
  --train_images_dir DIR
                        path to fimage folder
  --val_images_dir DIR  path to fimage folder
  --val_split_factor DIR
                        split factor for validation set
  --annotations_dir DIR
                        path to annotation folder
  --build_image         Build image and mask fro mongoDB database
  --build               Build COCO dataset

```

#### Training
```
python3 main.py -data data/dataset/ -expID my_model -model vgg -train -nEpoch 100 -loadModel model/pretrained.pth
```
#### Testing
```
python3 eval.py -loadModel my_model.pth -img_path test/panda.jpg
```

## Mongo Database 

### Mongo Video Database
```
{
	"path": "panda-video.mp4",
	"width": 1920,
	"status": 0,
	"height": 1080
}
```

### Mongo Skeleton Storage
```
{
	"frame_id": 0,
	"skeletons": [{
		"id": "15508661727946718712004890997",
		"bbox": [113.1812091503268, 59.17336601307191, 231.56203703703704, 292.712962962963],
		"keypoints": {
			"L_EYE": [192.30065359477123, 108.73169934640525, 2],
			"NOSE": [167.9562091503268, 131.62706971677562, 2],
			"L_WRIST": [155.49417211328975, 160.31873638344229, 2],
			"R_SHOULDER": [135.78676470588235, 84.67706971677562, 0],
			"R_EYE": [151.14694989106752, 104.38447712418302, 2],
			"L_SHOULDER": [274.028431372549, 117.71595860566451, 2],
			"R_ELBOW": [113.1812091503268, 168.7233660130719, 2],
			"L_KNEE": [303.0099128540305, 297.1113289760349, 2],
			"L_ANKLE": [272.8691721132898, 351.88632897603486, 2],
			"R_KNEE": [190.27194989106752, 205.5298474945534, 2],
			"L_ELBOW": [220.7025054466231, 176.83818082788673, 2],
			"R_HIP": [205.0525054466231, 188.4307734204793, 0],
			"R_ANKLE": [162.4497276688453, 264.6520697167756, 2],
			"R_WRIST": [137.81546840958606, 135.68447712418302, 2],
			"L_HIP": [344.7432461873638, 175.9687363834423, 2],
			"L_EAR": [220.9923202614379, 64.39003267973858, 2],
			"R_EAR": [146.79972766884532, 59.17336601307191, 2]
		},
		"action": 0
	}],
	"video_id": "5c70434ddb35ed7f7b0a169d"
}
```


