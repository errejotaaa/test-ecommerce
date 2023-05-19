declare module "xss-clean" {
  export default function (): (req: any, res: any, next: any) => void;
}
