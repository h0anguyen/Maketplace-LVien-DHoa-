declare module "express-flash";

interface Flash {
  flash(type: string, message: any): void;
}
declare namespace Express {
  export interface Request {
    flash: (typeErr: string, mess: any) => void;
    // flash(message?: string): { [key: string]: string[] | string };
    // flash(event: string, message: string | string[]): any;
  }
}
