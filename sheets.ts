import { QuoteData, User } from './types';

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

export const appendToSheet = async (sheetName: string, data: any[]) => {
  if (!APPS_SCRIPT_URL) {
    console.error("Google Apps Script URL is not configured.");
    return;
  }

  console.log("Attempting to send data to Apps Script URL:", APPS_SCRIPT_URL);
  const sanitized = data.map((v) => {
    if (typeof v === 'string') {
      const t = v.trim();
      if (!t.startsWith("'") && (t.startsWith('+') || t.startsWith('='))) {
        return `'${t}`;
      }
    }
    return v;
  });
  const payload = {
    sheetName: sheetName,
    values: sanitized,
  };
  console.log("Data to be sent:", payload);

  try {
    // We use 'no-cors' to bypass CORS restrictions.
    // This makes the request a "simple request" that Google Apps Script can handle without a preflight.
    // Note: We won't be able to read the response body in this mode.
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      redirect: 'follow',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      }
    });

    console.log("Data successfully sent to Google Apps Script. Please check your Google Sheet.");

  } catch (error) {
    console.error("Error during fetch to Google Apps Script:", error);
  }
};

export const fetchFromSheet = async (sheetName: string) => {
  if (!APPS_SCRIPT_URL) {
    console.error("Google Apps Script URL is not configured.");
    return [];
  }

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?sheetName=${sheetName}`, {
      method: 'GET',
      redirect: 'follow',
    });

    const result = await response.json();
    if (result.status === 'success') {
      return result.data;
    } else {
      console.error("Apps Script reported an error:", result.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching from Google Apps Script:", error);
    return [];
  }
};
