import ora, { type Ora, type Options } from 'ora';
import type { BaroukOptions } from '../flags/barouk-flags.js';

/**
 * Function that take an optional spinner and return a promise of a generic type.
 * @param {?Ora} spinner - The spinner instance.
 * @returns {Promise<T>} The promise result.
 */
export type SpinnerFn<T> = (spinner?: Ora) => Promise<T>;

/**
 * Create a spinner for an asynchronous task.
 * If the user want a silent execusion no spinner will be displayed.
 * @param {string | Options} options - The option used to create the spinner.
 * @param {SpinnerFn<T>} spinnerFn - The function that execute the async task.
 * @param {BaroukOptions} barouk - The barouk option use for this instance.
 * @returns {Promise<T>} The async result of the spinner function.
 */
export async function createSpinner<T>(options: string | Options, spinnerFn: SpinnerFn<T>, barouk: BaroukOptions): Promise<T> {
  const startSpinner = !barouk.json;
  const spinner = startSpinner ? ora(options) : undefined;
  spinner?.start();
  try {
    const result = await spinnerFn(spinner);
    spinner?.succeed(); 
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : undefined;
    spinner?.fail(message);
    throw error;
  }
}
