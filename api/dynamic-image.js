import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const bgPath = path.join(process.cwd(), 'public', 'back.jpg');
  const bg = await loadImage(bgPath);
  ctx.drawImage(bg, 0, 0, width, height);

  // Font
  try {
    const fontPath = path.join(process.cwd(), 'public', 'JetBrainsMono-Regular.ttf');
    if (fs.existsSync(fontPath)) {
      GlobalFonts.registerFromPath(fontPath, 'JetBrainsMono');
    }
  } catch {}

  // Time & Date
  const now = new Date();
  const hours = now.getHours() % 12 || 12;
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  const day = now.getDate().toString().padStart(2, '0');
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = monthNames[now.getMonth()];
  const dayOfWeek = now.toLocaleString('en-US',{weekday:'short'});

  ctx.fillStyle = 'white';
  ctx.font = '40px JetBrainsMono';
  ctx.fillText(`${hours}:${minutes} ${ampm}`, 600, 100);
  ctx.font = '25px JetBrainsMono';
  ctx.fillText(`${day}/${month} ${dayOfWeek}`, 600, 140);

  // Battery from query param
  let batteryPercent = parseInt(req.query.battery) || 75; // default 75%
  batteryPercent = Math.min(Math.max(batteryPercent, 0), 100);

  ctx.fillStyle = '#888';
  ctx.fillRect(600, 160, 150, 20);
  ctx.fillStyle = '#0f0';
  ctx.fillRect(600, 160, 1.5 * batteryPercent, 20);

  // Progress bars
  const totalTodaySeconds = 24*60*60;
  const elapsedTodaySeconds = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
  const todayProgress = (elapsedTodaySeconds/totalTodaySeconds)*400;

  ctx.fillStyle = '#555';
  ctx.fillRect(50, 200, 400, 15);
  ctx.fillStyle = '#0af';
  ctx.fillRect(50, 200, todayProgress, 15);

  const startOfYear = new Date(now.getFullYear(),0,1);
  const elapsedYearSeconds = (now - startOfYear)/1000;
  const totalYearSeconds = (new Date(now.getFullYear()+1,0,1) - startOfYear)/1000;
  const yearProgress = (elapsedYearSeconds/totalYearSeconds)*400;

  ctx.fillStyle = '#555';
  ctx.fillRect(50, 230, 400, 15);
  ctx.fillStyle = '#fa0';
  ctx.fillRect(50, 230, yearProgress, 15);

  // "love you" text
  ctx.font = '50px JetBrainsMono';
  ctx.fillStyle = 'pink';
  ctx.fillText('❤️ love you ❤️', 50, 300);

  // Glowing hearts
  for (let i=0;i<3;i++){
    ctx.globalAlpha = 0.6;
    ctx.fillText('💖', 100 + i*60, 260 - i*10);
  }
  ctx.globalAlpha = 1;

  res.setHeader('Content-Type','image/png');
  res.status(200).send(canvas.toBuffer());
                             }
