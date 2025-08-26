function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  const output = { ...target } as T & U;
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      key in target &&
      typeof (target as any)[key] === 'object'
    ) {
      (output as any)[key] = deepMerge((target as any)[key], value);
    } else {
      (output as any)[key] = value as any;
    }
  }
  return output;
}

export function fetchTaskFn<T>(input: string, init: RequestInit = {}): (sessionId: string) => Promise<T> {
  return async (sessionId: string) => {
    const response = await fetch(input, deepMerge(init, {
      headers: {
        'Cookie': `sessionId=${sessionId}`,
      },
    }));
    if (response.status === 401) throw new Error('Authentification needed');
    return await response.json() as T;
  };
}
