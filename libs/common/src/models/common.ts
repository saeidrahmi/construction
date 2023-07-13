export class EnvironmentInfo {
  _multiLoginAllowed = true;
  sessionIdle: number = 3600; // one hour
  sessionTimeout: number = 60; // one minute
  sessionPing: number = 20;
  _webSecretKey = 'web-secret-key';
  _dbSecretKey = 'db-secret-key';
  //backend info
  private _apiUrl: string = 'http://localhost';
  private _apiPort: number = 3000;
  private _userSessionTokenExpiry: number = 3600; // one hour
  private _userRegistrationTokenExpiry: number = 172800; // 48 hours
  //databse info
  private _dbUrl: string = 'localhost';
  private _dbPort: number = 3306;
  private _dbUserName: string = 'construction_user';
  private _dbPassword: string = 'saeid';
  private _dbDatabseName: string = 'construction';
  constructor() {}
  userSessionTokenExpiry() {
    return this._userSessionTokenExpiry;
  }
  userRegistrationTokenExpiry() {
    return this._userRegistrationTokenExpiry;
  }
  public multiLoginAllowed() {
    return this._multiLoginAllowed;
  }
  public webSecretKey() {
    return this._webSecretKey;
  }
  public dbSecretKey() {
    return this._dbSecretKey;
  }
  public apiUrl() {
    return this._apiUrl;
  }
  public apiPort() {
    return this._apiPort;
  }
  public dbUrl() {
    return this._dbUrl;
  }
  public dbPort() {
    return this._dbPort;
  }
  public dbUser() {
    return this._dbUserName;
  }
  public dbPassword() {
    return this._dbPassword;
  }
  public dbName() {
    return this._dbDatabseName;
  }
}
