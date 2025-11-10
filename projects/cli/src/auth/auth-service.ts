import { mkdir, readFile, writeFile } from 'fs/promises';
import type { BaroukConfigService } from '../configs/barouk-config-service.js';
import type { BaroukOptions } from '../flags/barouk-flags.js';
import { existsSync } from 'fs';
import { dirname } from 'path';
import { createSpinner } from '../logger/spinner.js';
import { CookieJar } from 'tough-cookie';

/**
 * Service used to manage the authentification to the barouk server.
 */
export class AuthService {
  /**
   * Create a new instance the of auth service.
   * @param {BaroukConfigService} baroukOptions - The options used by tha app.
   * @param {BaroukConfigService} configService - The config service.
   */
  public constructor(
    private readonly baroukOptions: BaroukOptions,
    private readonly configService: BaroukConfigService,
  ) { }

  public async doALoggedInTask<T>(taskFn: (sessionId: string) => Promise<T>): Promise<T> {
    try {
      const sessionId = await this.getSessionId();
      return taskFn(sessionId);
    } catch {
      const sessionId = await this.loggedIn();
      return taskFn(sessionId);
    }
  }

  private loggedIn(): Promise<string> {
    return createSpinner('Login with google (check your browser)', async (spinner) => {
      if (spinner) spinner.text = 'Login with google';
      return '';
    }, this.baroukOptions);
  }

  private async loadJar(): Promise<CookieJar> {
    const jarPath = this.baroukOptions['session-file'];
    if (existsSync(jarPath)) return new CookieJar();
    const jarBuffer = await readFile(jarPath);
    const jarContent = jarBuffer.toString('utf-8');
    const jar = JSON.parse(jarContent);
    return CookieJar.deserialize(jar);
  }

  private async getSessionId(): Promise<string> {
    const path = this.baroukOptions['session-file'];
    if (existsSync(path)) return '';
    const buffer = await readFile(path);
    return buffer.toString('utf8');
  }

  private async saveSessionId(sessionId: string): Promise<void> {
    const path = this.baroukOptions['session-file'];
    if (!existsSync(path)) await mkdir(dirname(path), { recursive: true });
    return writeFile(path, sessionId, { encoding: 'utf8' });
  }
}
