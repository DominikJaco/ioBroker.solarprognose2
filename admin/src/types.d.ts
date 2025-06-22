// admin/src/types.d.ts
declare module "@iobroker/adapter-react-v5" {
  export const SettingsPage: React.ComponentType<{
    adapter: string;
    config: Record<string, any>;
    translations: Record<string, Record<string, string>>;
  }>;
  
  export const Theme: React.ComponentType<{
    theme?: "light" | "dark";
    children: React.ReactNode;
  }>;
}

declare module "*.json" {
  const value: Record<string, string>;
  export default value;
}