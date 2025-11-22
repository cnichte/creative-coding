export type StudioSettings = {
  theme: "dark" | "light";
  workspace: string;
  logsEnabled: boolean;
};

export const defaultSettings: StudioSettings = {
  theme: "dark",
  workspace: "",
  logsEnabled: true,
};
