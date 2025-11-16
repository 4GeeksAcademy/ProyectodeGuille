# src/api/email_service.py
from flask_mail import Mail, Message
from api.models import db, EmailLog, EmailStatus
from datetime import datetime
import os
from jinja2 import Template

mail = Mail()

def init_mail(app):
    """Inicializar Flask-Mail con la app"""
    mail.init_app(app)

def send_email(recipient, subject, html_body, booking_id=None, email_type='general'):
    """
    Enviar email usando Flask-Mail (SMTP)
    """
    try:
        msg = Message(
            subject=subject,
            recipients=[recipient],
            html=html_body
        )
        
        mail.send(msg)
        
        # Registrar email enviado
        if booking_id:
            email_log = EmailLog(
                booking_id=booking_id,
                email_type=email_type,
                recipient_email=recipient,
                subject=subject,
                status=EmailStatus.SENT,
                sent_at=datetime.utcnow()
            )
            db.session.add(email_log)
            db.session.commit()
        
        print(f"✅ Email enviado a {recipient}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        
        # Registrar error
        if booking_id:
            email_log = EmailLog(
                booking_id=booking_id,
                email_type=email_type,
                recipient_email=recipient,
                subject=subject,
                status=EmailStatus.FAILED,
                error_message=str(e)
            )
            db.session.add(email_log)
            db.session.commit()
        
        return False

def send_verification_email(user, token):
    """Enviar email de verificación de cuenta"""
    verification_url = f"{os.getenv('FRONTEND_URL')}/verify-email?token={token}"
    
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #4F46E5; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>¡Bienvenido a celiafarm!</h1>
            </div>
            <div class="content">
                <p>Hola <strong>{{ name }}</strong>,</p>
                <p>Gracias por registrarte en celiafarm. Para completar tu registro, por favor verifica tu dirección de email haciendo clic en el botón de abajo:</p>
                <center>
                    <a href="{{ verification_url }}" class="button">Verificar mi email</a>
                </center>
                <p>O copia y pega este enlace en tu navegador:</p>
                <p style="word-break: break-all; color: #4F46E5;">{{ verification_url }}</p>
                <p><small>Este enlace expirará en 24 horas.</small></p>
                <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
            </div>
            <div class="footer">
                <p>© 2024 celiafarm. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    template = Template(html_template)
    html_body = template.render(
        name=user.name or user.email.split('@')[0],
        verification_url=verification_url
    )
    
    return send_email(
        recipient=user.email,
        subject="Verifica tu cuenta en celiafarm",
        html_body=html_body,
        email_type='email_verification'
    )

def send_password_reset_email(user, token):
    """Enviar email de reset de contraseña"""
    reset_url = f"{os.getenv('FRONTEND_URL')}/reset-password?token={token}"
    
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #4F46E5; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Restablecer contraseña</h1>
            </div>
            <div class="content">
                <p>Hola <strong>{{ name }}</strong>,</p>
                <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña:</p>
                <center>
                    <a href="{{ reset_url }}" class="button">Restablecer contraseña</a>
                </center>
                <p>O copia y pega este enlace en tu navegador:</p>
                <p style="word-break: break-all; color: #4F46E5;">{{ reset_url }}</p>
                <p><small>Este enlace expirará en 2 horas.</small></p>
                <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma segura.</p>
            </div>
            <div class="footer">
                <p>© 2024 celiafarm. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    template = Template(html_template)
    html_body = template.render(
        name=user.name or user.email.split('@')[0],
        reset_url=reset_url
    )
    
    return send_email(
        recipient=user.email,
        subject="Restablecer tu contraseña - celiafarm",
        html_body=html_body,
        email_type='password_reset'
    )

def send_booking_confirmation_email(booking):
    """Enviar email de confirmación de reserva"""
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .confirmation-number { font-size: 28px; font-weight: bold; margin: 10px 0; letter-spacing: 2px; }
            .content { padding: 30px; background: #f9f9f9; }
            .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #666; }
            .total { font-size: 20px; font-weight: bold; color: #10B981; padding-top: 15px; margin-top: 15px; border-top: 2px solid #10B981; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✓ ¡Reserva Confirmada!</h1>
                <div class="confirmation-number">{{ confirmation_number }}</div>
                <p>Guarda este número para futuras consultas</p>
            </div>
            <div class="content">
                <p>Hola <strong>{{ user_name }}</strong>,</p>
                <p>¡Gracias por tu reserva! Hemos recibido tu pago y tu reserva está confirmada.</p>
                
                <div class="booking-details">
                    <h2>📋 Detalles de tu reserva:</h2>
                    
                    {% if experience %}
                    <div class="detail-row">
                        <span class="label">🎯 Experiencia:</span>
                        <span>{{ experience.name }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">📅 Fecha:</span>
                        <span>{{ experience_date }}</span>
                    </div>
                    {% if experience_time %}
                    <div class="detail-row">
                        <span class="label">🕐 Hora:</span>
                        <span>{{ experience_time }}</span>
                    </div>
                    {% endif %}
                    {% endif %}
                    
                    {% if rooms %}
                    <div class="detail-row">
                        <span class="label">🏨 Alojamiento:</span>
                        <span>{{ check_in }} - {{ check_out }}</span>
                    </div>
                    {% for room in rooms %}
                    <div class="detail-row">
                        <span class="label">🛏️ Habitación:</span>
                        <span>{{ room.room.name }} ({{ room.nights }} noches)</span>
                    </div>
                    {% endfor %}
                    {% endif %}
                    
                    <div class="detail-row">
                        <span class="label">👥 Huéspedes:</span>
                        <span>{{ number_of_guests }}</span>
                    </div>
                    
                    {% if extras %}
                    <h3>✨ Extras incluidos:</h3>
                    {% for extra in extras %}
                    <div class="detail-row">
                        <span class="label">{{ extra.extra.name }}:</span>
                        <span>x{{ extra.quantity }}</span>
                    </div>
                    {% endfor %}
                    {% endif %}
                    
                    <div class="total">
                        <span>💰 TOTAL PAGADO: ${{ total_price }}</span>
                    </div>
                </div>
                
                {% if special_requests %}
                <div class="booking-details">
                    <h3>📝 Solicitudes especiales:</h3>
                    <p>{{ special_requests }}</p>
                </div>
                {% endif %}
                
                <p><strong>¡Esperamos verte pronto! 💜</strong></p>
                <p>El equipo de celiafarm</p>
            </div>
            <div class="footer">
                <p>© 2024 celiafarm. Todos los derechos reservados.</p>
                <p>¿Preguntas? Escríbenos a reservas@celiafarm.com</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    template = Template(html_template)
    html_body = template.render(
        confirmation_number=booking.confirmation_number,
        user_name=booking.user.name or booking.user.email.split('@')[0],
        experience=booking.experience,
        experience_date=booking.experience_date.strftime('%d/%m/%Y') if booking.experience_date else None,
        experience_time=booking.experience_time.strftime('%H:%M') if booking.experience_time else None,
        check_in=booking.check_in.strftime('%d/%m/%Y') if booking.check_in else None,
        check_out=booking.check_out.strftime('%d/%m/%Y') if booking.check_out else None,
        rooms=booking.rooms,
        number_of_guests=booking.number_of_guests,
        extras=booking.extras,
        total_price=f"{booking.total_price:.2f}",
        special_requests=booking.special_requests
    )
    
    return send_email(
        recipient=booking.user.email,
        subject=f"✓ Confirmación de Reserva #{booking.confirmation_number} - HerSafe",
        html_body=html_body,
        booking_id=booking.id,
        email_type='booking_confirmation'
    )

def send_guest_checkout_email(booking, temporary_password=None):
    """Enviar email a usuarios guest con contraseña temporal"""
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: #f9f9f9; }
            .credentials-box { background: #FEF3C7; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #FCD34D; }
            .credential-item { background: white; padding: 10px; margin: 10px 0; border-radius: 4px; font-family: monospace; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✓ ¡Reserva Confirmada!</h1>
                <div style="font-size: 24px; font-weight: bold; margin: 10px 0; letter-spacing: 2px;">{{ confirmation_number }}</div>
            </div>
            <div class="content">
                <p>Hola <strong>{{ user_name }}</strong>,</p>
                <p>¡Gracias por tu reserva! Tu pago ha sido confirmado.</p>
                
                {% if temporary_password %}
                <div class="credentials-box">
                    <h3>🔑 Hemos creado una cuenta para ti</h3>
                    <p>Para que puedas revisar tu reserva, usa estos datos:</p>
                    <div class="credential-item">
                        <strong>📧 Email:</strong> {{ email }}
                    </div>
                    <div class="credential-item">
                        <strong>🔐 Contraseña temporal:</strong> {{ temporary_password }}
                    </div>
                    <p style="color: #B91C1C; font-size: 14px; margin-top: 15px;">
                        ⚠️ Te recomendamos cambiar tu contraseña después de iniciar sesión.
                    </p>
                </div>
                {% endif %}
                
                <p>Número de confirmación: <strong>{{ confirmation_number }}</strong></p>
                <p>¡Esperamos verte pronto! 💜</p>
            </div>
            <div class="footer">
                <p>© 2024 Celiafarm. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    
    template = Template(html_template)
    html_body = template.render(
        confirmation_number=booking.confirmation_number,
        user_name=booking.user.name or booking.user.email.split('@')[0],
        email=booking.user.email,
        temporary_password=temporary_password
    )
    
    return send_email(
        recipient=booking.user.email,
        subject=f"Tu cuenta y reserva en celiafarm - {booking.confirmation_number}",
        html_body=html_body,
        booking_id=booking.id,
        email_type='guest_checkout'
    )

def send_booking_confirmation_email(booking_data):
    """
    Envía email de confirmación de reserva
    """
    try:
        subject = f"Booking Confirmation #{booking_data['booking_number']} - CaliaFarm"
        
        # Preparar lista de items
        items_html = ""
        for item in booking_data.get('items', []):
            items_html += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    {item['name']}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                    €{item['subtotal']:.2f}
                </td>
            </tr>
            """
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #C9A961 0%, #8B7355 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: white; padding: 30px; border: 1px solid #eee; border-top: none; }}
                .booking-number {{ background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }}
                .booking-number h2 {{ color: #C9A961; margin: 0; }}
                table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                .total {{ font-size: 1.3em; font-weight: bold; color: #C9A961; padding: 15px; background: #f8f9fa; }}
                .footer {{ background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #C9A961 0%, #8B7355 100%); color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Booking Confirmed!</h1>
                    <p>Thank you for choosing CaliaFarm</p>
                </div>
                
                <div class="content">
                    <p>Dear {booking_data['customer_name']},</p>
                    
                    <p>We're delighted to confirm your booking at CaliaFarm. Your reservation has been successfully processed.</p>
                    
                    <div class="booking-number">
                        <p style="margin: 0; color: #666;">Booking Reference</p>
                        <h2>#{booking_data['booking_number']}</h2>
                    </div>
                    
                    <h3>Booking Details:</h3>
                    <table>
                        {items_html}
                        <tr class="total">
                            <td><strong>Total Paid:</strong></td>
                            <td style="text-align: right;"><strong>€{booking_data['total_amount']:.2f}</strong></td>
                        </tr>
                    </table>
                    
                    <h3>Customer Information:</h3>
                    <ul>
                        <li><strong>Name:</strong> {booking_data['customer_name']}</li>
                        <li><strong>Email:</strong> {booking_data['customer_email']}</li>
                        <li><strong>Phone:</strong> {booking_data['customer_phone']}</li>
                        <li><strong>Payment Status:</strong> <span style="color: green;">✓ Paid</span></li>
                    </ul>
                    
                    <h3>Important Information:</h3>
                    <ul>
                        <li>Please arrive 15 minutes before your scheduled time</li>
                        <li>Bring this confirmation email with you</li>
                        <li>For cancellations, contact us at least 48 hours in advance</li>
                    </ul>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="mailto:info@caliafarm.com" class="button">Contact Us</a>
                    </p>
                </div>
                
                <div class="footer">
                    <p><strong>CaliaFarm</strong><br>
                    Via delle Vigne 123, Palermo, Sicily, Italy<br>
                    Phone: +39 123 456 7890 | Email: info@caliafarm.com</p>
                    
                    <p style="color: #999; font-size: 0.9em; margin-top: 20px;">
                        This is an automated confirmation email. Please do not reply to this message.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        msg = Message(
            subject=subject,
            recipients=[booking_data['customer_email']],
            html=html_body
        )
        
        mail.send(msg)
        print(f"✅ Confirmation email sent to {booking_data['customer_email']}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending confirmation email: {str(e)}")
        raise e