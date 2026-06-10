export async function getStoredValue<T>(key: string, fallback: T): Promise<T> {
  if (window.XRAY_Store?.get) {
    return await window.XRAY_Store.get<T>(key) ?? fallback;
  }
  try {
    const text = localStorage.getItem(`xray_${key}`);
    return text ? JSON.parse(text) as T : fallback;
  } catch {
    return fallback;
  }
}

export async function setStoredValue<T>(key: string, value: T): Promise<void> {
  if (window.XRAY_Store?.set) {
    await window.XRAY_Store.set(key, value);
    return;
  }
  try {
    localStorage.setItem(`xray_${key}`, JSON.stringify(value));
  } catch {}
}
