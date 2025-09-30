export function extractBasicFields(text) {
  const nameMatch = text.match(/^([A-Z][a-z]+(?: [A-Z][a-z]+)?)/m) || [];
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const phoneMatch = text.match(/\+?\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);

  return {
    name: nameMatch[1] ? nameMatch[1].trim() : '',
    email: emailMatch ? emailMatch[0].trim() : '',
    phone: phoneMatch ? phoneMatch[0].trim() : ''
  };
}
