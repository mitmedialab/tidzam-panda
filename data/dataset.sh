DATASET_DIR="dataset"

TRAIN_DIR="$DATASET_DIR/train2017"
VAL_DIR="$DATASET_DIR/val2017"
ANNOTATIONS_DIR="$DATASET_DIR/annotations"

echo "Dataset directory      : $DATASET_DIR"
echo "Train images directory : $TRAIN_DIR"
echo "Val images directory   : $VAL_DIR"
echo "Annotations directory  : $ANNOTATIONS_DIR"

if [ -d "$DATASET_DIR" ]; then
  rm -rf "$DATASET_DIR"
fi

mkdir "$DATASET_DIR"
mkdir "$TRAIN_DIR"
mkdir "$VAL_DIR"
mkdir "$ANNOTATIONS_DIR"

python3 dataset.py --build_image --build
