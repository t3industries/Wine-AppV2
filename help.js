module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY in Vercel environment variables.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const venue = String(body.venue || 'Restaurant').slice(0, 140);
    const email = String(body.email || '').slice(0, 180);
    const message = String(body.message || '').slice(0, 6000);
    const page = String(body.page || '').slice(0, 500);
    const userAgent = String(body.userAgent || '').slice(0, 500);
    const screenshotName = String(body.screenshotName || '').replace(/[\\/]/g, '').slice(0, 120);
    const screenshotContent = String(body.screenshotContent || '');

    if (!message && !screenshotContent) {
      return res.status(400).json({ error: 'Message or screenshot required.' });
    }

    const attachments = [];
    if (screenshotContent && screenshotName) {
      // Keep support emails light. Browser code blocks files above 4MB before base64 encoding.
      attachments.push({ filename: screenshotName, content: screenshotContent });
    }

    const plainText = [
      `Venue: ${venue}`,
      `Email: ${email || 'Not supplied'}`,
      `Page: ${page || 'Not supplied'}`,
      '',
      'Message:',
      message || '(screenshot only)',
      '',
      `Screenshot: ${screenshotName || 'None'}`,
      '',
      `User agent: ${userAgent || 'Not supplied'}`
    ].join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.45;color:#151411">
        <h2>Wine Pairing App support request</h2>
        <p><b>Venue:</b> ${escapeHtml(venue)}</p>
        <p><b>Email:</b> ${escapeHtml(email || 'Not supplied')}</p>
        <p><b>Page:</b> ${escapeHtml(page || 'Not supplied')}</p>
        <hr>
        <p><b>Message:</b></p>
        <p style="white-space:pre-wrap">${escapeHtml(message || '(screenshot only)')}</p>
        <p><b>Screenshot:</b> ${escapeHtml(screenshotName || 'None')}</p>
        <hr>
        <p style="font-size:12px;color:#6f6258"><b>User agent:</b> ${escapeHtml(userAgent || 'Not supplied')}</p>
      </div>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Wine Pairing App <onboarding@resend.dev>',
        to: ['toddbutterworth1@gmail.com'],
        subject: `Wine Pairing App support - ${venue}`,
        text: plainText,
        html,
        attachments
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        error: result.message || result.error || 'Resend email failed.'
      });
    }

    return res.status(200).json({ ok: true, id: result.id || result.data?.id || null });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Support email failed.' });
  }
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
