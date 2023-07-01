import { INestApplication } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { NestExpressApplication } from '@nestjs/platform-express';
import { OpenAPIObject } from './schemas/open-api';
import { SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { RedocSetupOptions } from './schemas/setup-options';
import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { dump } from 'js-yaml';

export class RedocModule {

  public static createDocument(
    app: INestApplication,
    config: Omit<OpenAPIObject, 'paths'>,
    options: SwaggerDocumentOptions = {},
  ): OpenAPIObject {
    const document = SwaggerModule.createDocument(app, config, options);

    this.adjustOperationIds(document);

    return document;
  }

  private static adjustOperationIds(document: OpenAPIObject): void {
    for (const [path, routes] of Object.entries(document.paths)) {
      if (routes.get) routes.get.operationId = path;
      if (routes.post) routes.post.operationId = path;
      if (routes.put) routes.put.operationId = path;
      if (routes.delete) routes.delete.operationId = path;
      if (routes.patch) routes.patch.operationId = path;
    }
  }

  public static setup(
    path: string,
    app: INestApplication,
    document: OpenAPIObject,
    options: RedocSetupOptions = {},
  ): void {
    options = this.loadDefaultOptions(options);

    this.saveSpec(document);
    this.serveSpec(path, app);
    this.serveDocuments(path, app, document, options);
  }

  private static loadDefaultOptions(options: RedocSetupOptions): RedocSetupOptions {
    const default_options: RedocSetupOptions = {
      html: true,
    };

    return { ...default_options, ...options };
  }

  private static saveSpec(document: OpenAPIObject): void {
    const root_dir = join(resolve(__dirname), 'assets', 'swagger.json');
    writeFileSync(root_dir, JSON.stringify(document));
  }

  private static serveSpec(path: string, app: INestApplication): void {
    const prefix = join(path, 'assets', 'swagger.json');
    const assets_dir = join(resolve(__dirname), 'assets', 'swagger.json');

    this.serveAssets(app, prefix, assets_dir);
  }

  private static serveAssets(
    app: INestApplication,
    prefix: string,
    assets_dir: string
  ): void {
    const http_server = app.getHttpAdapter();

    if (http_server && http_server.getType() === 'fastify') {
      (app as unknown as NestFastifyApplication).useStaticAssets({
        prefix,
        root: assets_dir,
        decorateReply: false
      });
    } else {
      (app as unknown as NestExpressApplication).useStaticAssets(
        assets_dir, { prefix }
      );
    }
  }

  private static serveDocuments(
    path: string,
    app: INestApplication,
    document: OpenAPIObject,
    options: RedocSetupOptions,
  ): void {
    const { html, yaml, json } = options;

    if (html) {
      const html_document = RedocModule.buildHtml(path, document);
      this.serveDocument(app, path, 'text/html', html_document);
    }

    if (yaml) {
      const yaml_document = dump(document);
      this.serveDocument(app, `${path}-yaml`, 'text/yaml', yaml_document);
    }

    if (json) {
      const json_document = JSON.stringify(document);
      this.serveDocument(app, `${path}-json`, 'application/json', json_document);
    }
  }

  private static buildHtml(path: string, document: OpenAPIObject): string {
    const html_path = join(resolve(__dirname), 'assets', 'redoc.html');
    const spec_path = join(path, 'assets', 'swagger.json');

    return readFileSync(html_path, 'utf-8').toString()
      .replace('<% title %>', document.info.title)
      .replace('<% specUrl %>', spec_path);
  }

  private static serveDocument(
    app: INestApplication,
    path: string,
    type: string,
    document: string
  ): void {
    const http_server = app.getHttpAdapter();

    http_server.get(path, (req, res) => {
      res.type(type);
      res.send(document);
    });
  }
}

