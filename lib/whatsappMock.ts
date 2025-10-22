export async function sendWhatsAppMessageMock(
  to: string,
  message: string
): Promise<{ success: boolean; mock: boolean }> {
  console.log(`
╭─────────────────────────────────────────╮
│ 📱 WhatsApp Simulado                    │
├─────────────────────────────────────────┤
│ Para: ${to.padEnd(32)} │
│ Mensaje:                                │
│ ${message.slice(0, 35).padEnd(37)} │
╰─────────────────────────────────────────╯
  `);
  return { success: true, mock: true };
}
