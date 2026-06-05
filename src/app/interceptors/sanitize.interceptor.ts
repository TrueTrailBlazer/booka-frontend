import { HttpInterceptorFn } from '@angular/common/http';

export const sanitizeInterceptor: HttpInterceptorFn = (req, next) => {
  // Para POST/PUT, sanitizar body básico — mas nunca tocar em FormData (upload de arquivos)
  if ((req.method === 'POST' || req.method === 'PUT') && req.body && !(req.body instanceof FormData)) {
    try {
      const sanitizedBody = sanitizeRequestBody(req.body);
      req = req.clone({ body: sanitizedBody });
    } catch (error) {
      console.error('Erro ao sanitizar request body:', error);
    }
  }

  return next(req);
};

function sanitizeRequestBody(obj: any): any {
  // Se for string, remover caracteres perigosos
  if (typeof obj === 'string') {
    return obj
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  // Se for array, processar cada item
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeRequestBody(item));
  }

  // Se for objeto, processar cada propriedade
  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = sanitizeRequestBody(obj[key]);
      return acc;
    }, {} as any);
  }

  // Retornar como está se for primitivo ou null
  return obj;
}
