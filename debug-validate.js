// Копируем точные функции из нашего кода
function isValidIPv4(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  
  return parts.every(part => {
    if (part === '') return false;
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255 && num.toString() === part;
  });
}

function isValidDomain(domain) {
  if (domain.length > 253) return false;
  if (domain.endsWith('.')) domain = domain.slice(0, -1);
  
  // Исключаем строки, которые выглядят как IP адреса (только цифры и точки)
  if (/^[\d.]+$/.test(domain)) return false;
  
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domain);
}

function validateTarget(type, target) {
  switch (type) {
    case 'http':
      try {
        const url = new URL(target);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    
    case 'tcp':
    case 'ping':
      // Проверяем IP адрес или доменное имя
      return isValidIPv4(target) || isValidDomain(target);
    
    default:
      return false;
  }
}

// Тестируем точно как в тесте
console.log('Testing validateTarget with tcp and 999.999.999.999:');
const result = validateTarget('tcp', '999.999.999.999');
console.log('Result:', result);
console.log('Expected: false');

console.log('\nTesting isValidIPv4 directly:');
console.log('isValidIPv4("999.999.999.999"):', isValidIPv4('999.999.999.999'));

console.log('\nTesting isValidDomain directly:');
console.log('isValidDomain("999.999.999.999"):', isValidDomain('999.999.999.999'));
