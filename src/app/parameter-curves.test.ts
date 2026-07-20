import { describe, expect, it } from "vitest";

import {
  CARBON_DIOXIDE_LOW_RANGE_MAX_ATM,
  deriveParameterSliderPosition,
  deriveParameterValueFromSliderPosition,
  RADIATION_LOW_RANGE_MAX_MILLI_SV_PER_HOUR,
  WATER_LOW_RANGE_MAX_PERCENT,
} from "./parameter-curves";

describe("parameter slider curves", () => {
  it("reserves the left half of radiation travel for 0 to 0.52 mSv/h", () => {
    expect(
      deriveParameterSliderPosition("radiation", RADIATION_LOW_RANGE_MAX_MILLI_SV_PER_HOUR, 0, 3),
    ).toBe(50);
    expect(deriveParameterSliderPosition("radiation", 0.26, 0, 3)).toBe(25);
    expect(
      deriveParameterValueFromSliderPosition("radiation", 75, 0, 3, 0.01),
    ).toBe(1.76);
  });

  it("reserves the left half of carbon-dioxide travel for the low atmospheric range", () => {
    expect(
      deriveParameterSliderPosition("carbonDioxide", CARBON_DIOXIDE_LOW_RANGE_MAX_ATM, 0, 0.6),
    ).toBe(50);
    expect(deriveParameterSliderPosition("carbonDioxide", 0.0005, 0, 0.6)).toBe(25);
    expect(
      deriveParameterValueFromSliderPosition("carbonDioxide", 75, 0, 0.6, 0.0001),
    ).toBe(0.3005);
  });

  it("reserves the left half of water travel for 0 to 25 percent inventory", () => {
    expect(
      deriveParameterSliderPosition("water", WATER_LOW_RANGE_MAX_PERCENT, 0, 100),
    ).toBe(50);
    expect(deriveParameterSliderPosition("water", 12.5, 0, 100)).toBe(25);
    expect(deriveParameterValueFromSliderPosition("water", 75, 0, 100, 0.1)).toBe(62.5);
  });
});
