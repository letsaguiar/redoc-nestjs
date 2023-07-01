import { OpenAPIObject as DefaultOpenAPIObject } from "@nestjs/swagger";

export interface OpenAPIObject extends DefaultOpenAPIObject {
  info: InfoObject;
}

export interface InfoObject {
  ["x-logo"]: LogoObject;

  title: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
  version: string;
}

export interface ContactObject {
  name?: string;
  url?: string;
  email?: string;
}

export interface LicenseObject {
  name: string;
  url?: string;
}

export interface LogoObject {
  url: string;
  altText: string;
}
