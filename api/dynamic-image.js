import { createCanvas, loadImage } from '@napi-rs/canvas';

export default async function handler(req, res) {
  try {
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 🔹 Query params
    const imgUrl = req.query.imgurl;
    let battery = parseInt(req.query.battery) || 50;
    battery = Math.max(0, Math.min(100, battery));

    if (!imgUrl) {
      return res.status(400).send('imgurl query is required');
    }

    // 🔹 Load background
    const bg = await loadImage(imgUrl);
    ctx.drawImage(bg, 0, 0, width, height);

    // 🔹 Time & Date
    const now = new Date();
    const h = now.getHours() % 12 || 12;
    const m = now.getMinutes().toString().padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    const day = now.getDate().toString().padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const weekday = now.toLocaleString('en-US', { weekday: 'short' });

    // 🔹 Draw time/date
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px Arial';
    ctx.fillText(`${h}:${m} ${ampm}`, 520, 90);

    ctx.font = '22px Arial';
    ctx.fillText(`${day}/${month} ${weekday}`, 520, 125);

    // 🔹 Battery bar
    ctx.fillStyle = '#333';
    ctx.fillRect(520, 145, 200, 20);

    ctx.fillStyle = battery > 20 ? '#00ff6a' : '#ff3b3b';
    ctx.fillRect(520, 145, 2 * battery, 20);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${battery}%`, 730, 162);

    // 🔹 Love text
    ctx.font = '48px Arial';
    ctx.fillStyle = 'pink';
    ctx.fillText('❤️ love you ❤️', 40, 320);

    // 🔹 Send image
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(canvas.toBuffer());

  } catch (err) {
    console.error(err);
    res.status(500).send('Image generation failed');
  }
}
