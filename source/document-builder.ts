import { DocumentBuilder as DefaultDocumentBuilder } from "@nestjs/swagger";

export class DocumentBuilder extends DefaultDocumentBuilder {

  public setLogo(url: string, altText: string): this {
    this['document']['info']['x-logo'] = { url, altText };
    return this;
  }

}
