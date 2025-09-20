function isValidIPv4(ip) {
  const parts = ip.split('.');
  console.log('Parts:', parts);
  if (parts.length !== 4) return false;
  
  return parts.every(part => {
    if (part === '') return false;
    const num = parseInt(part, 10);
    const result = num >= 0 && num <= 255 && num.toString() === part;
    console.log(`Part: ${part}, Num: ${num}, Valid: ${result}`);
    return result;
  });
}

console.log('Testing 999.999.999.999:');
console.log('Result:', isValidIPv4('999.999.999.999'));

console.log('\nTesting 192.168.1.1:');
console.log('Result:', isValidIPv4('192.168.1.1'));
