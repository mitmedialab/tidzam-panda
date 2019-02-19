const ALPHA_FACTOR_DISABLED  = 0.9;
const ALPHA_FACTOR_ENABLED   = 1.8;

const ALPHA_UNSELECTED = 125;
const ALPHA_SELECTED   = 255;

const SKELETON             = {
  'NOSE'       : 0,

  'L_EYE'      : 1,
  'L_EAR'      : 2,
  'L_SHOULDER' : 3,
  'L_ELBOW'    : 4,
  'L_WRIST'    : 5,
  'L_HIP'      : 6,
  'L_KNEE'     : 7,
  'L_ANKLE'    : 8,

  'R_EYE'      : 9,
  'R_EAR'      : 10,
  'R_SHOULDER' : 11,
  'R_ELBOW'    : 12,
  'R_WRIST'    : 13,
  'R_HIP'      : 14,
  'R_KNEE'     : 15,
  'R_ANKLE'    : 16
};
const SKELETON_DEFAULT_POS = [
  [631 * 0.5, 411.5 * 0.5],
  [647 * 0.5, 346.5 * 0.5],
  [644 * 0.5, 227.5 * 0.5],
  [479 * 0.5, 275.5 * 0.5],
  [471 * 0.5, 389.5 * 0.5],
  [584 * 0.5, 478.5 * 0.5],
  [231 * 0.5, 266.5 * 0.5],
  [265 * 0.5, 408.5 * 0.5],
  [265 * 0.5, 521.5 * 0.5],
  [595 * 0.5, 349.5 * 0.5],
  [544 * 0.5, 239.5 * 0.5],
  [416 * 0.5, 297.5 * 0.5],
  [404 * 0.5, 405.5 * 0.5],
  [423 * 0.5, 545.5 * 0.5],
  [145 * 0.5, 281.5 * 0.5],
  [208 * 0.5, 438.5 * 0.5],
  [196 * 0.5, 548.5 * 0.5]
];

const JOINT_STATES                   = {
  'UNLABELED'          : 0,
  'LABELED_NOT_VISIBLE': 1,
  'LABELED_VISIBLE'    : 2
};
const JOINT_RADIUS                   = 6;
const JOINT_STROKE_WEIGHT            = 1;
const JOINT_CONNECTION_STROKE_WEIGHT = 3;
const JOINT_COLORS                   = [
  '#CD101E',

  '#A564CA',
  '#BA2165',
  '#DB7C35',
  '#C9CA46',
  '#9AB952',
  '#00BF76',
  '#00C6A2',
  '#006A7E',

  '#DA30B9',
  '#ED1556',
  '#43C247',
  '#00CD41',
  '#00DD88',
  '#0035C1',
  '#0033B6',
  '#22216E'
];
const JOINT_CONNECTIONS             = {
  'L_EAR': 'L_EYE',
  'R_EAR': 'R_EYE',

  'L_EYE': 'NOSE',
  'R_EYE': 'NOSE',

  'L_SHOULDER': 'R_SHOULDER',
  'L_ELBOW'   : 'L_SHOULDER',
  'R_ELBOW'   : 'R_SHOULDER',
  'L_ELBOW'   : 'L_SHOULDER',
  'R_WRIST'   : 'R_ELBOW',
  'L_WRIST'   : 'L_ELBOW',

  'L_HIP'  : 'R_HIP',
  'L_KNEE' : 'L_HIP',
  'R_KNEE' : 'R_HIP',
  'L_ANKLE': 'L_KNEE',
  'R_ANKLE': 'R_KNEE'
};
const JOINT_PAIRS                   = {
  'L_EAR'     : 'R_EAR',
  'L_EYE'     : 'R_EYE',

  'L_SHOULDER': 'R_SHOULDER',
  'L_ELBOW'   : 'R_ELBOW',
  'L_WRIST'   : 'R_WRIST',

  'L_HIP'     : 'R_HIP',
  'L_KNEE'    : 'R_KNEE',
  'L_ANKLE'   : 'R_ANKLE'
};

const TEXT_SIZE          = 16;
const TEXT_STROKE_WEIGHT = 2;

const ACTIONS = {
  'WALKING' : 0,
  'PLAYING' : 1,
  'SLEEPING': 2,
  'EATING'  : 3,
  'NURSING' : 4
};
