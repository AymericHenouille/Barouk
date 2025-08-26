import type { AuthService } from '../auth/auth-service.js';
import { fetchTaskFn } from '../auth/fetch-task-fn.js';
import type { BaroukConfigService } from '../configs/barouk-config-service.js';
import type { SpeechOptions } from './speech-options.js';

/**
 * Service used to fetch speeches.
 */
export class SpeechesService {
  public constructor(
    private readonly configService: BaroukConfigService,
    private readonly authService: AuthService,
  ) { }

  public async getSpeechesByIds(ids: SpeechOptions['id'][] | 'all'): Promise<SpeechOptions[]> {
    const config = await this.configService.getConfig();
    const speechesUrl = `${config.server}/speeches?ids=${ids === 'all' ? ids : ids.join('+')}`;
    return this.authService.doALoggedInTask(fetchTaskFn(speechesUrl));
  }
}
