const SHEET_ID = 'REEMPLAZAR_CON_ID_DE_GOOGLE_SHEETS';
const SHEET_NAME = 'Suscripciones';
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://tu-dominio-production'
];

function doPost(event) {
  try {
    const origin = event?.headers?.origin || '';
    if (ALLOWED_ORIGINS.length && !ALLOWED_ORIGINS.includes(origin)) {
      return buildResponse({ status: 'error', message: 'Origen no autorizado.' }, origin);
    }

    const payload = JSON.parse(event.postData.contents);
    validatePayload(payload);
    appendRow(payload);

    return buildResponse({ status: 'success', message: 'Gracias por sumarte. Te escribiremos pronto.' }, origin);
  } catch (error) {
    console.error(error);
    return buildResponse({ status: 'error', message: error.message || 'Error inesperado.' });
  }
}

function validatePayload(data) {
  if (!data.fullName || data.fullName.length < 3) {
    throw new Error('Nombre inválido.');
  }
  if (!data.email || data.email.indexOf('@') === -1) {
    throw new Error('Correo inválido.');
  }
}

function appendRow(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Hoja no encontrada.');
  }

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.fullName,
    data.email,
    data.interest || '',
    data.message || ''
  ]);
}

function buildResponse(payload, origin) {
  const response = ContentService.createTextOutput(JSON.stringify(payload));
  response.setMimeType(ContentService.MimeType.JSON);
  if (origin) {
    response.appendHeader('Access-Control-Allow-Origin', origin);
  }
  response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
