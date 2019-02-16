
## Dependencies

```bash
pip install Flask-PyMongo argparse
pip install git+git://github.com/waspinator/pycococreator.git@0.2.0
```

## Pandas Pose Estimation Tool JSON format

```json
{
  "skeletons":
  [
    {
      "keypoints": { "KEYPOINT_NAME": [ "x", "y", "v" ] },
      "bbox"     : [ "x", "y", "w", "h" ]
    }
  ]
}
```
