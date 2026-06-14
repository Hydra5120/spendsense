export const APP_NAME = "SpendSense";

export const INCOME_SOURCE_TYPES = {
  centrelink: "Centrelink",
  casual_work: "Casual Work",
  scholarship: "Scholarship",
  freelance: "Freelance",
  other: "Other",
} as const;

export const FREQUENCY_OPTIONS = {
  weekly: "Weekly",
  fortnightly: "Fortnightly",
  monthly: "Monthly",
  one_off: "One-off",
} as const;

export const ITEMS_PER_PAGE = 20;

export const HECS_REPAYMENT_THRESHOLD = 54435;

export const HECS_REPAYMENT_TIERS: Array<{ min: number; max: number; rate: number }> = [
  { min: 0,       max: 54434,   rate: 0     },
  { min: 54435,   max: 62850,   rate: 0.01  },
  { min: 62851,   max: 66620,   rate: 0.02  },
  { min: 66621,   max: 70618,   rate: 0.025 },
  { min: 70619,   max: 74855,   rate: 0.03  },
  { min: 74856,   max: 79346,   rate: 0.035 },
  { min: 79347,   max: 84107,   rate: 0.04  },
  { min: 84108,   max: 89154,   rate: 0.045 },
  { min: 89155,   max: 94503,   rate: 0.05  },
  { min: 94504,   max: 100174,  rate: 0.055 },
  { min: 100175,  max: 106185,  rate: 0.06  },
  { min: 106186,  max: 112556,  rate: 0.065 },
  { min: 112557,  max: 119309,  rate: 0.07  },
  { min: 119310,  max: 126467,  rate: 0.075 },
  { min: 126468,  max: 134056,  rate: 0.08  },
  { min: 134057,  max: 142100,  rate: 0.085 },
  { min: 142101,  max: 150626,  rate: 0.09  },
  { min: 150627,  max: 159663,  rate: 0.095 },
  { min: 159664,  max: Infinity, rate: 0.10 },
];
