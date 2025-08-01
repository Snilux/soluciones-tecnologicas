import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendPasswordResetEmail(to, link) {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperación de Contraseña</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f7fa;
          color: #333;
          line-height: 1.6;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 20px;
        }
        
        .message {
          font-size: 16px;
          color: #5a6c7d;
          margin-bottom: 30px;
          line-height: 1.7;
        }
        
        .button-container {
          text-align: center;
          margin: 35px 0;
        }
        
        .reset-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        
        .warning-box {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        
        .warning-icon {
          display: inline-block;
          width: 20px;
          height: 20px;
          background-color: #f39c12;
          border-radius: 50%;
          margin-right: 10px;
          position: relative;
          vertical-align: middle;
        }
        
        .warning-icon::before {
          content: "⚠";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        
        .warning-text {
          color: #856404;
          font-size: 14px;
          display: inline-block;
          vertical-align: middle;
        }
        
        .footer {
          background-color: #f8f9fa;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e9ecef;
        }
        
        .footer p {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        .security-notice {
          background-color: #e8f4fd;
          border-left: 4px solid #3498db;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .security-notice p {
          color: #2980b9;
          font-size: 14px;
          margin: 0;
        }
        
        @media (max-width: 600px) {
          .container {
            margin: 0 10px;
          }
          
          .header, .content, .footer {
            padding: 25px 20px;
          }
          
          .header h1 {
            font-size: 24px;
          }
          
          .reset-button {
            padding: 14px 28px;
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Recuperación de Contraseña</h1>
          <p>Soluciones Tecnológicas .NET</p>
        </div>
        
        <div class="content">
          <div class="greeting">¡Hola!</div>
          
          <div class="message">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta. 
            Si fuiste tú quien hizo esta solicitud, puedes crear una nueva contraseña 
            haciendo clic en el botón de abajo.
          </div>
          
          <div class="button-container">
            <a href="${link}" class="reset-button">
              Restablecer Contraseña
            </a>
          </div>
          
          <div class="warning-box">
            <span class="warning-icon"></span>
            <span class="warning-text">
              <strong>Importante:</strong> Este enlace expirará en 15 minutos por seguridad.
            </span>
          </div>
          
          <div class="security-notice">
            <p>
              <strong>🛡️ Nota de seguridad:</strong> Si no solicitaste este restablecimiento, 
              puedes ignorar este correo con total seguridad. Tu contraseña actual permanecerá sin cambios.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Soluciones Tecnológicas .NET</strong></p>
          <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          <p style="color: #999; font-size: 12px;">
            © ${new Date().getFullYear()} Todos los derechos reservados
          </p>
        </div>
      </div>
      
      <!-- Enlace alternativo por si el botón no funciona -->
      <div style="max-width: 600px; margin: 20px auto; padding: 0 20px; text-align: center;">
        <p style="color: #666; font-size: 12px;">
          Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
          <a href="${link}" style="color: #667eea; word-break: break-all;">${link}</a>
        </p>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"Soluciones Tecnológicas .NET" <${process.env.EMAIL_HOST}>`,
    to,
    subject: "🔐 Recuperación de contraseña - Soluciones Tecnológicas .NET",
    html: htmlTemplate,
  });
}
