export const colors = {
  ink: "#000000",
  canvas: "#ffffff",
  canvasSoft: "#efefef",
  canvasSofter: "#f3f3f3",
  body: "#5e5e5e",
  mute: "#afafaf",
  onDark: "#ffffff",
  primary: "#2e5a8f",
  primarySoft: "#e1e9f2",
  accent: "#ed7447",
  accentSoft: "#fceae3",
  success: "#1b7a3d",
  danger: "#c22b2b",
  hairline: "rgba(0,0,0,0.08)",
};

export const radius = {
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
};

export const shadow = {
  level1: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  level2: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
};

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const type = {
  displayLg: { fontSize: 32, fontWeight: "700" as const, lineHeight: 40 },
  displayMd: { fontSize: 24, fontWeight: "700" as const, lineHeight: 32 },
  displaySm: { fontSize: 20, fontWeight: "700" as const, lineHeight: 28 },
  bodyLg: { fontSize: 18, fontWeight: "500" as const, lineHeight: 24 },
  bodyMd: { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  bodyMdStrong: { fontSize: 16, fontWeight: "500" as const, lineHeight: 20 },
  bodySm: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  bodySmStrong: { fontSize: 14, fontWeight: "500" as const, lineHeight: 16 },
  caption: { fontSize: 12, fontWeight: "400" as const, lineHeight: 20 },
};
