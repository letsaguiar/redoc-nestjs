export interface RedocSetupOptions {

  /**
   * Indicates if RedocModule should serve an HTML document.
   * Default: true
   * Obs: if set to true, it will be served at ${path}
   */
  html?: boolean;

  /**
   * Indicates if RedocModule should serve an YAML document.
   * Default: false
   * Obs: if set to true, it will be served at ${path}-yaml
   */
  yaml?: boolean;

  /**
   * Indicates if RedocModule should serve an JSON document.
   * Default: false
   * Obs: if set to true, it will be served at ${path}-json
   */
  json?: boolean;

}
