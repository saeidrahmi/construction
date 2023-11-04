export class EnvironmentInfo {
  _multiLoginAllowed = true;
  sessionIdle: number = 3600; // one hour
  sessionTimeout: number = 60; // one minute
  sessionPing: number = 20;
  _apiTimeoutValue: number = 120000; // one miniutes
  _webSecretKey = 'web-secret-key';
  _jwtSecretKey = 'jwt-secret-key';
  _dbSecretKey = 'db-secret-key';
  _jwtRefreshSecretKey = 'your_refresh_secret_key'; // Different from the access token secret
  _jwtRefreshTokenExpiration = '1d';
  //backend info
  private _apiUrl: string = 'http://localhost';
  private _apiPort: number = 3000;
  private _userSessionTokenExpiry: number = 3600; // one hour
  private _userRegistrationTokenExpiry: number = 172800; // 48 hours
  private _passwordResetExpiry: number = 3600; // one hours
  //databse info
  private _dbUrl: string = 'localhost';
  private _dbPort: number = 3306;
  private _dbUserName: string = 'construction_user';
  private _dbPassword: string = 'saeid';
  private _systemName: string = 'Ontsoft';
  private _dbDatabaseName: string = 'construction';
  private _roles = { general: 'General', admin: 'Admin', sAdmin: 'SAdmin' };
  constructor() {}
  refreshSecretKey() {
    return this._jwtRefreshSecretKey;
  }
  userSessionRefreshTokenExpiry() {
    return this._jwtRefreshTokenExpiration;
  }
  getPasswordResetExpiry() {
    return this._passwordResetExpiry;
  }
  apiTimeoutValue() {
    return this._apiTimeoutValue;
  }
  getRole() {
    return this._roles;
  }
  getSystemName() {
    return this._systemName;
  }
  userSessionTokenExpiry() {
    return this._userSessionTokenExpiry;
  }
  userRegistrationTokenExpiry() {
    return this._userRegistrationTokenExpiry;
  }
  public multiLoginAllowed() {
    return this._multiLoginAllowed;
  }
  public jwtSecretKey() {
    return this._jwtSecretKey;
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
    return this._dbDatabaseName;
  }
}
