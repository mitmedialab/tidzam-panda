const ALPHA_FACTOR_DISABLED = 0.5;
const ALPHA_FACTOR_ENABLED  = 1.2;

const ALPHA_UNSELECTED = 125;
const ALPHA_SELECTED   = 255;

const SKELETON             = Object.freeze({
  'NOSE'       : 0,
  'L_EYE'      : 1,
  'R_EYE'      : 2,
  'L_EAR'      : 3,
  'R_EAR'      : 4,
  'L_SHOULDER' : 5,
  'R_SHOULDER' : 6,
  'L_ELBOW'    : 7,
  'R_ELBOW'    : 8,
  'L_WRIST'    : 9,
  'R_WRIST'    : 10,
  'L_HIP'      : 11,
  'R_HIP'      : 12,
  'L_KNEE'     : 13,
  'R_KNEE'     : 14,
  'L_ANKLE'    : 15,
  'R_ANKLE'    : 16
});
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

const JOINT_RADIUS                   = 6;
const JOINT_STROKE_WEIGHT            = 1;
const JOINT_CONNECTION_STROKE_WEIGHT = 3;
const JOINT_COLORS                   = [
  '#CD101E',
  '#DA30B9',
  '#ED1556',
  '#43C247',
  '#00CD41',
  '#00DD88',
  '#0035C1',
  '#0033B6',
  '#22216E',
  '#A564CA',
  '#BA2165',
  '#DB7C35',
  '#C9CA46',
  '#9AB952',
  '#00BF76',
  '#00C6A2',
  '#006A7E'
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

const TEXT_SIZE          = 10;
const TEXT_STROKE_WEIGHT = 1;
