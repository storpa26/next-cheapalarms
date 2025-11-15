import { useCallback, useEffect, useMemo, useState } from "react";
import { addonCatalog, baseKit, limits, presets, propertyProfiles } from "../data/ajax-hub2";

const servicePricing = {
  monitoring: {
    off: 0,
    standard: 49,
    premium: 79,
  },
  cellular: 18,
  extendedWarrantyYear: 89,
};

const defaultCoverage = propertyProfiles[0]?.coverageDefaults ?? {
  doors: 6,
  windows: 4,
  glassWalls: 1,
  outdoorZones: 0,
  panicButtons: 1,
};

function clampNumber(value, min = 0) {
  if (Number.isNaN(Number(value))) return min;
  return Math.max(min, Number(value));
}

function buildRecommendations(coverage) {
  return {
    door_contact: Math.max(coverage.doors + coverage.windows, 0),
    motion_indoor: Math.max(Math.ceil((coverage.doors + coverage.windows) / 4), 0),
    glass_break: Math.max(Math.ceil(coverage.glassWalls / 2), 0),
    motion_outdoor: Math.max(coverage.outdoorZones, 0),
    panic_button: Math.max(coverage.panicButtons || 1, 0),
  };
}

export function useAjaxCalculator() {
  const [profileId, setProfileId] = useState(propertyProfiles[0]?.id ?? "standard_home");
  const [coverage, setCoverage] = useState(defaultCoverage);
  const [addonQuantities, setAddonQuantities] = useState({});
  const [services, setServices] = useState({
    monitoringTier: "standard",
    cellularBackup: true,
    extendedWarrantyYears: 0,
  });
  const [propertyFlags, setPropertyFlags] = useState({
    hasPets: false,
    needsInsuranceGrade: false,
    needsFourG: true,
  });

  useEffect(() => {
    const profile = propertyProfiles.find((item) => item.id === profileId);
    if (!profile) return;
    setCoverage(profile.coverageDefaults);
  }, [profileId]);

  const catalogMap = useMemo(() => {
    const map = new Map();
    addonCatalog.forEach((item) => map.set(item.id, item));
    return map;
  }, []);

  const selectedAddons = useMemo(() => {
    return Object.entries(addonQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const meta = catalogMap.get(id);
        if (!meta) return null;
        return { ...meta, quantity: qty };
      })
      .filter(Boolean);
  }, [addonQuantities, catalogMap]);

  const totals = useMemo(() => {
    const addonSubtotal = selectedAddons.reduce(
      (sum, item) => sum + item.priceExGst * item.quantity,
      0,
    );
    const serviceSubtotal =
      (services.monitoringTier ? servicePricing.monitoring[services.monitoringTier] ?? 0 : 0) +
      (services.cellularBackup ? servicePricing.cellular : 0) +
      services.extendedWarrantyYears * servicePricing.extendedWarrantyYear;

    const subtotalExGst = baseKit.priceExGst + addonSubtotal + serviceSubtotal;

    const gstAmount =
      baseKit.priceExGst * baseKit.gstRate +
      selectedAddons.reduce(
        (sum, item) => sum + item.priceExGst * item.gstRate * item.quantity,
        0,
      ) +
      serviceSubtotal * 0.15;

    const installMinutes =
      baseKit.installMinutes +
      selectedAddons.reduce((sum, item) => sum + item.installMinutes * item.quantity, 0);

    const deviceSlots =
      baseKit.deviceSlots +
      selectedAddons.reduce((sum, item) => sum + (item.deviceSlots ?? 1) * item.quantity, 0);

    const powerDraw =
      baseKit.powerDrawMa +
      selectedAddons.reduce((sum, item) => sum + (item.powerDrawMa ?? 0) * item.quantity, 0);

    const keypadsUsed =
      baseKit.keypads +
      selectedAddons.reduce(
        (sum, item) => sum + (item.limitKey === "keypads" ? item.quantity : 0),
        0,
      );
    const sirensUsed = selectedAddons.reduce(
      (sum, item) => sum + (item.limitKey === "sirens" ? item.quantity : 0),
      0,
    );

    return {
      subtotalExGst,
      gstAmount,
      totalIncGst: subtotalExGst + gstAmount,
      installMinutes,
      deviceSlots,
      powerDraw,
      keypadsUsed,
      sirensUsed,
      serviceSubtotal,
      addonSubtotal,
    };
  }, [selectedAddons, services]);

  const limitUsage = useMemo(() => {
    return {
      deviceSlots: { used: totals.deviceSlots, max: limits.DEVICE_LIMIT },
      power: { used: totals.powerDraw, max: limits.POWER_BUDGET_MA },
      keypads: { used: totals.keypadsUsed, max: limits.MAX_KEYPADS },
      sirens: { used: totals.sirensUsed, max: limits.MAX_SIRENS },
    };
  }, [totals]);

  const setCoverageField = useCallback((field, value) => {
    setCoverage((prev) => ({
      ...prev,
      [field]: clampNumber(value, 0),
    }));
  }, []);

  const setAddonQuantity = useCallback((id, value) => {
    const meta = catalogMap.get(id);
    if (!meta) return;
    const safeValue = Math.min(clampNumber(value, 0), meta.maxPerSystem ?? 99);
    setAddonQuantities((prev) => {
      if (safeValue === 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return {
        ...prev,
        [id]: safeValue,
      };
    });
  }, [catalogMap]);

  const toggleFlag = useCallback((flag) => {
    setPropertyFlags((prev) => ({
      ...prev,
      [flag]: !prev[flag],
    }));
  }, []);

  const updateService = useCallback((field, value) => {
    setServices((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const applyRecommendations = useCallback(() => {
    const suggested = buildRecommendations(coverage);
    setAddonQuantities((prev) => ({
      ...prev,
      ...suggested,
    }));
  }, [coverage]);

  const applyPreset = useCallback(
    (presetId) => {
      const preset = presets.find((item) => item.id === presetId);
      if (!preset) return;
      if (preset.profileId) {
        setProfileId(preset.profileId);
      }
      if (preset.coverage) {
        setCoverage(preset.coverage);
      }
      if (preset.addons) {
        setAddonQuantities(preset.addons);
      }
    },
    [],
  );

  return {
    baseKit,
    addonCatalog,
    propertyProfiles,
    profileId,
    setProfileId,
    propertyFlags,
    toggleFlag,
    coverage,
    setCoverageField,
    addonQuantities,
    setAddonQuantity,
    selectedAddons,
    totals,
    limitUsage,
    services,
    updateService,
    applyRecommendations,
    presets,
    applyPreset,
  };
}

