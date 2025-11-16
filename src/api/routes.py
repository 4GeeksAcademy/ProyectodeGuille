"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import (
    db, User, Experience, ExperienceSchedule, Room, Extra, Package, PackageExtra,
    Booking, BookingRoom, BookingExtra, RoomAvailability, ExperienceAvailability,
    BookingStatus, PaymentStatus, EmailStatus, EmailLog, UserRole, ExtraType, DayOfWeek
)
from api.utils import generate_sitemap, APIException
from api.email_service import (
    send_verification_email, 
    send_password_reset_email, 
    send_booking_confirmation_email,
    send_guest_checkout_email
)
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta, date, time
from sqlalchemy import and_, or_, func
import stripe
import random
import os
import secrets
import string
from flask import Blueprint, request, jsonify

api = Blueprint('api', __name__)
CORS(api)

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# ============= DECORADOR PARA ADMIN =============
def admin_required():
    def wrapper(fn):
        @jwt_required()
        def decorator(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or not user.is_admin():
                return jsonify({"error": "Admin access required"}), 403
            return fn(*args, **kwargs)
        decorator.__name__ = fn.__name__
        return decorator
    return wrapper

# ============= HELPER: LIMPIAR CARRITOS EXPIRADOS =============
def clean_expired_carts():
    """Eliminar carritos que hayan expirado (más de 30 minutos)"""
    expired_bookings = Booking.query.filter(
        Booking.status == BookingStatus.CART,
        Booking.cart_expires_at < datetime.utcnow()
    ).all()
    
    for booking in expired_bookings:
        db.session.delete(booking)
    
    if expired_bookings:
        db.session.commit()

def generate_temporary_password(length=12):
    """Generar contraseña temporal segura"""
    characters = string.ascii_letters + string.digits + "!@#$%^&*()"
    return ''.join(secrets.choice(characters) for _ in range(length))

# ============= AUTENTICACIÓN COMPLETA =============
@api.route('/register', methods=['POST'])
def register():
    """
    Registro de usuario con verificación de email
    Body: {
        "email": "user@example.com",
        "password": "securepassword",
        "name": "John Doe",
        "phone": "+1234567890"
    }
    """
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400
    
    # Validar formato de email
    import re
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, data['email']):
        return jsonify({"error": "Invalid email format"}), 400
    
    # Verificar si el email ya existe
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 400
    
    # Validar longitud de contraseña
    if len(data['password']) < 8:
        return jsonify({"error": "Password must be at least 8 characters long"}), 400
    
    try:
        user = User(
            email=data['email'].lower(),
            password=generate_password_hash(data['password']),
            name=data.get('name'),
            phone=data.get('phone'),
            role=UserRole.USER,
            is_active=True,
            email_verified=False,
            is_guest=False
        )
        
        # Generar token de verificación
        token = user.generate_verification_token()
        
        db.session.add(user)
        db.session.commit()
        
        # Enviar email de verificación
        send_verification_email(user, token)
        
        # Crear token JWT
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            "message": "User registered successfully. Please check your email to verify your account.",
            "user": user.serialize(),
            "token": access_token,
            "email_verification_required": True
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api.route('/verify-email', methods=['POST'])
def verify_email():
    """
    Verificar email con token
    Body: { "token": "verification_token_here" }
    """
    data = request.get_json()
    
    if not data.get('token'):
        return jsonify({"error": "Token is required"}), 400
    
    user = User.query.filter_by(verification_token=data['token']).first()
    
    if not user:
        return jsonify({"error": "Invalid verification token"}), 400
    
    if user.verification_token_expires < datetime.utcnow():
        return jsonify({"error": "Verification token has expired"}), 400
    
    user.email_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    
    db.session.commit()
    
    return jsonify({
        "message": "Email verified successfully",
        "user": user.serialize()
    }), 200

@api.route('/resend-verification', methods=['POST'])
@jwt_required()
def resend_verification():
    """Reenviar email de verificación"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if user.email_verified:
        return jsonify({"error": "Email already verified"}), 400
    
    # Generar nuevo token
    token = user.generate_verification_token()
    db.session.commit()
    
    # Enviar email
    send_verification_email(user, token)
    
    return jsonify({"message": "Verification email sent"}), 200

@api.route('/login', methods=['POST'])
def login():
    """
    Login de usuario
    Body: {
        "email": "user@example.com",
        "password": "password"
    }
    """
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400
    
    user = User.query.filter_by(email=data['email'].lower()).first()
    
    if not user or not user.password:
        return jsonify({"error": "Invalid credentials"}), 401
    
    if not check_password_hash(user.password, data['password']):
        return jsonify({"error": "Invalid credentials"}), 401
    
    if not user.is_active:
        return jsonify({"error": "Account is inactive"}), 401
    
    # Actualizar último login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        "message": "Login successful",
        "user": user.serialize(),
        "token": access_token,
        "email_verified": user.email_verified
    }), 200

@api.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    Solicitar reset de contraseña
    Body: { "email": "user@example.com" }
    """
    data = request.get_json()
    
    if not data.get('email'):
        return jsonify({"error": "Email is required"}), 400
    
    user = User.query.filter_by(email=data['email'].lower()).first()
    
    # Por seguridad, siempre devolver éxito aunque el email no exista
    if user and not user.is_guest:
        token = user.generate_password_reset_token()
        db.session.commit()
        
        send_password_reset_email(user, token)
    
    return jsonify({
        "message": "If that email exists, we've sent password reset instructions"
    }), 200

@api.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Resetear contraseña con token
    Body: {
        "token": "reset_token_here",
        "new_password": "newpassword123"
    }
    """
    data = request.get_json()
    
    if not data.get('token') or not data.get('new_password'):
        return jsonify({"error": "Token and new password are required"}), 400
    
    if len(data['new_password']) < 8:
        return jsonify({"error": "Password must be at least 8 characters long"}), 400
    
    user = User.query.filter_by(password_reset_token=data['token']).first()
    
    if not user:
        return jsonify({"error": "Invalid reset token"}), 400
    
    if user.password_reset_expires < datetime.utcnow():
        return jsonify({"error": "Reset token has expired"}), 400
    
    user.password = generate_password_hash(data['new_password'])
    user.password_reset_token = None
    user.password_reset_expires = None
    
    db.session.commit()
    
    return jsonify({"message": "Password reset successfully"}), 200

@api.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """
    Cambiar contraseña (usuario logueado)
    Body: {
        "current_password": "oldpassword",
        "new_password": "newpassword123"
    }
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({"error": "Current and new password are required"}), 400
    
    user = User.query.get(user_id)
    
    if not user or not user.password:
        return jsonify({"error": "User not found"}), 404
    
    if not check_password_hash(user.password, data['current_password']):
        return jsonify({"error": "Current password is incorrect"}), 401
    
    if len(data['new_password']) < 8:
        return jsonify({"error": "New password must be at least 8 characters long"}), 400
    
    user.password = generate_password_hash(data['new_password'])
    db.session.commit()
    
    return jsonify({"message": "Password changed successfully"}), 200

@api.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user.serialize()), 200

@api.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    Actualizar perfil de usuario
    Body: {
        "name": "New Name",
        "phone": "+1234567890"
    }
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    
    if data.get('name'):
        user.name = data['name']
    
    if data.get('phone'):
        user.phone = data['phone']
    
    db.session.commit()
    
    return jsonify({
        "message": "Profile updated successfully",
        "user": user.serialize()
    }), 200

# ============= EXPERIENCIAS (sin cambios del código anterior) =============
@api.route('/experiences', methods=['GET'])
def get_experiences():
    experiences = Experience.query.filter_by(is_active=True).all()
    return jsonify([exp.serialize() for exp in experiences]), 200

@api.route('/experiences/<int:experience_id>', methods=['GET'])
def get_experience(experience_id):
    experience = Experience.query.get(experience_id)
    if not experience:
        return jsonify({"error": "Experience not found"}), 404
    
    return jsonify(experience.serialize()), 200

@api.route('/experiences/available', methods=['POST'])
def get_available_experiences():
    data = request.get_json()
    
    try:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        guests = int(data.get('guests', 1))
    except (KeyError, ValueError):
        return jsonify({"error": "Invalid date format or missing parameters"}), 400
    
    experiences = Experience.query.filter_by(is_active=True).all()
    available_experiences = []
    
    for experience in experiences:
        schedule_days = [schedule.day_of_week for schedule in experience.schedules]
        available_dates = []
        current_date = start_date
        
        while current_date <= end_date:
            day_name = current_date.strftime('%A').upper()
            try:
                day_enum = DayOfWeek[day_name]
            except KeyError:
                current_date += timedelta(days=1)
                continue
            
            if day_enum in schedule_days:
                confirmed_bookings = Booking.query.filter(
                    Booking.experience_id == experience.id,
                    Booking.experience_date == current_date,
                    Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING])
                ).all()
                
                booked_spots = sum([b.number_of_guests for b in confirmed_bookings])
                available_spots = experience.max_capacity - booked_spots
                
                if available_spots >= guests:
                    schedule = next((s for s in experience.schedules if s.day_of_week == day_enum), None)
                    available_dates.append({
                        'date': current_date.isoformat(),
                        'available_spots': available_spots,
                        'day_of_week': day_name.lower(),
                        'start_time': schedule.start_time.strftime('%H:%M') if schedule else None
                    })
            
            current_date += timedelta(days=1)
        
        if available_dates:
            exp_data = experience.serialize()
            exp_data['available_dates'] = available_dates
            available_experiences.append(exp_data)
    
    return jsonify(available_experiences), 200

# ============= HABITACIONES (sin cambios) =============
@api.route('/rooms', methods=['GET'])
def get_rooms():
    rooms = Room.query.filter_by(is_active=True).all()
    return jsonify([room.serialize() for room in rooms]), 200

@api.route('/rooms/<int:room_id>', methods=['GET'])
def get_room(room_id):
    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Room not found"}), 404
    
    return jsonify(room.serialize()), 200

@api.route('/rooms/available', methods=['POST'])
def get_available_rooms():
    data = request.get_json()
    
    try:
        check_in = datetime.strptime(data['check_in'], '%Y-%m-%d').date()
        check_out = datetime.strptime(data['check_out'], '%Y-%m-%d').date()
    except (KeyError, ValueError):
        return jsonify({"error": "Invalid date format or missing parameters"}), 400
    
    if check_in >= check_out:
        return jsonify({"error": "Check-out must be after check-in"}), 400
    
    rooms = Room.query.filter_by(is_active=True).all()
    available_rooms = []
    
    for room in rooms:
        is_available = True
        current_date = check_in
        
        while current_date < check_out:
            existing_bookings = BookingRoom.query.join(Booking).filter(
                BookingRoom.room_id == room.id,
                BookingRoom.check_in <= current_date,
                BookingRoom.check_out > current_date,
                Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING])
            ).first()
            
            manual_block = RoomAvailability.query.filter_by(
                room_id=room.id,
                date=current_date,
                is_available=False
            ).first()
            
            if existing_bookings or manual_block:
                is_available = False
                break
            
            current_date += timedelta(days=1)
        
        if is_available:
            nights = (check_out - check_in).days
            room_data = room.serialize()
            room_data['nights'] = nights
            room_data['total_price'] = room.price_per_night * nights
            available_rooms.append(room_data)
    
    return jsonify(available_rooms), 200

# ============= EXTRAS =============
@api.route('/extras', methods=['GET'])
def get_extras():
    extras = Extra.query.filter_by(is_active=True).all()
    return jsonify([extra.serialize() for extra in extras]), 200

# ============= PAQUETES =============
@api.route('/packages', methods=['GET'])
def get_packages():
    packages = Package.query.filter_by(is_active=True).all()
    return jsonify([package.serialize() for package in packages]), 200

@api.route('/packages/<int:package_id>', methods=['GET'])
def get_package(package_id):
    package = Package.query.get(package_id)
    if not package:
        return jsonify({"error": "Package not found"}), 404
    
    return jsonify(package.serialize()), 200

# ============= CARRITO DE COMPRAS =============
@api.route('/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    """Agregar item al carrito"""
    user_id = get_jwt_identity()
    clean_expired_carts()
    
    data = request.get_json()
    
    try:
        number_of_guests = int(data['number_of_guests'])
        total_price = 0
        
        # Parsear fechas y horarios
        experience_date = None
        experience_time = None
        if data.get('experience_date'):
            experience_date = datetime.strptime(data['experience_date'], '%Y-%m-%d').date()
            if data.get('experience_time'):
                experience_time = datetime.strptime(data['experience_time'], '%H:%M').time()
        
        check_in = None
        check_out = None
        check_in_time = None
        check_out_time = None
        
        if data.get('check_in') and data.get('check_out'):
            check_in = datetime.strptime(data['check_in'], '%Y-%m-%d').date()
            check_out = datetime.strptime(data['check_out'], '%Y-%m-%d').date()
            
            if data.get('check_in_time'):
                check_in_time = datetime.strptime(data['check_in_time'], '%H:%M').time()
            if data.get('check_out_time'):
                check_out_time = datetime.strptime(data['check_out_time'], '%H:%M').time()
        
        # Validar experiencia
        experience = None
        if data.get('experience_id'):
            experience = Experience.query.get(data['experience_id'])
            if not experience or not experience.is_active:
                return jsonify({"error": "Invalid experience"}), 400
            total_price += experience.price * number_of_guests
        
        # Validar paquete
        package = None
        if data.get('package_id'):
            package = Package.query.get(data['package_id'])
            if not package or not package.is_active:
                return jsonify({"error": "Invalid package"}), 400
            total_price += package.price
        
        # Generar número de confirmación
        confirmation_number = Booking.generate_confirmation_number()
        
        # Crear booking en carrito
        booking = Booking(
            user_id=user_id,
            confirmation_number=confirmation_number,
            experience_id=data.get('experience_id'),
            package_id=data.get('package_id'),
            experience_date=experience_date,
            experience_time=experience_time,
            check_in=check_in,
            check_out=check_out,
            check_in_time=check_in_time,
            check_out_time=check_out_time,
            number_of_guests=number_of_guests,
            status=BookingStatus.CART,
            payment_status=PaymentStatus.PENDING,
            total_price=0,
            special_requests=data.get('special_requests'),
            cart_expires_at=datetime.utcnow() + timedelta(minutes=30)
        )
        
        db.session.add(booking)
        db.session.flush()
        
        # Agregar habitaciones
        if data.get('rooms') and check_in and check_out:
            nights = (check_out - check_in).days
            
            for room_data in data['rooms']:
                room = Room.query.get(room_data['room_id'])
                if not room or not room.is_active:
                    db.session.rollback()
                    return jsonify({"error": f"Invalid room {room_data['room_id']}"}), 400
                
                room_price = room.price_per_night * nights
                total_price += room_price
                
                booking_room = BookingRoom(
                    booking_id=booking.id,
                    room_id=room.id,
                    check_in=check_in,
                    check_out=check_out,
                    nights=nights,
                    price=room_price
                )
                db.session.add(booking_room)
        
        # Agregar extras
        if data.get('extras'):
            for extra_data in data['extras']:
                extra = Extra.query.get(extra_data['extra_id'])
                if not extra or not extra.is_active:
                    db.session.rollback()
                    return jsonify({"error": f"Invalid extra {extra_data['extra_id']}"}), 400
                
                quantity = extra_data.get('quantity', 1)
                
                if extra.type == ExtraType.PER_BOOKING:
                    extra_price = extra.price
                else:
                    extra_price = extra.price * number_of_guests * quantity
                
                total_price += extra_price
                
                booking_extra = BookingExtra(
                    booking_id=booking.id,
                    extra_id=extra.id,
                    quantity=quantity,
                    price=extra_price
                )
                db.session.add(booking_extra)
        
        booking.total_price = total_price
        db.session.commit()
        
        return jsonify({
            "message": "Item added to cart",
            "booking": booking.serialize()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api.route('/cart', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    clean_expired_carts()
    
    cart_items = Booking.query.filter_by(
        user_id=user_id,
        status=BookingStatus.CART
    ).all()
    
    return jsonify([item.serialize() for item in cart_items]), 200

@api.route('/cart/<int:booking_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(booking_id):
    user_id = get_jwt_identity()
    
    booking = Booking.query.filter_by(
        id=booking_id,
        user_id=user_id,
        status=BookingStatus.CART
    ).first()
    
    if not booking:
        return jsonify({"error": "Cart item not found"}), 404
    
    data = request.get_json()
    
    try:
        if data.get('number_of_guests'):
            booking.number_of_guests = int(data['number_of_guests'])
        
        if 'special_requests' in data:
            booking.special_requests = data['special_requests']
        
        if data.get('extras'):
            BookingExtra.query.filter_by(booking_id=booking.id).delete()
            
            total_price = 0
            
            if booking.experience:
                total_price += booking.experience.price * booking.number_of_guests
            
            if booking.package:
                total_price += booking.package.price
            
            for booking_room in booking.rooms:
                total_price += booking_room.price
            
            for extra_data in data['extras']:
                extra = Extra.query.get(extra_data['extra_id'])
                if extra and extra.is_active:
                    quantity = extra_data.get('quantity', 1)
                    
                    if extra.type == ExtraType.PER_BOOKING:
                        extra_price = extra.price
                    else:
                        extra_price = extra.price * booking.number_of_guests * quantity
                    
                    total_price += extra_price
                    
                    booking_extra = BookingExtra(
                        booking_id=booking.id,
                        extra_id=extra.id,
                        quantity=quantity,
                        price=extra_price
                    )
                    db.session.add(booking_extra)
            
            booking.total_price = total_price
        
        booking.cart_expires_at = datetime.utcnow() + timedelta(minutes=30)
        booking.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            "message": "Cart item updated",
            "booking": booking.serialize()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api.route('/cart/<int:booking_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(booking_id):
    user_id = get_jwt_identity()
    
    booking = Booking.query.filter_by(
        id=booking_id,
        user_id=user_id,
        status=BookingStatus.CART
    ).first()
    
    if not booking:
        return jsonify({"error": "Cart item not found"}), 404
    
    db.session.delete(booking)
    db.session.commit()
    
    return jsonify({"message": "Item removed from cart"}), 200

@api.route('/cart/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    user_id = get_jwt_identity()
    
    cart_items = Booking.query.filter_by(
        user_id=user_id,
        status=BookingStatus.CART
    ).all()
    
    for item in cart_items:
        db.session.delete(item)
    
    db.session.commit()
    
    return jsonify({"message": "Cart cleared"}), 200

# ============= GUEST CHECKOUT =============
@api.route('/guest-checkout', methods=['POST'])
def guest_checkout():
    """
    Checkout como invitado (sin registro previo)
    Body: {
        "email": "guest@example.com",
        "name": "Guest User",
        "phone": "+1234567890",
        "booking_data": { ... datos del carrito ... }
    }
    """
    data = request.get_json()
    
    if not data.get('email'):
        return jsonify({"error": "Email is required"}), 400
    
    email = data['email'].lower()
    
    try:
        # Verificar si el usuario ya existe
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Crear usuario guest con contraseña temporal
            temp_password = generate_temporary_password()
            
            user = User(
                email=email,
                password=generate_password_hash(temp_password),
                name=data.get('name'),
                phone=data.get('phone'),
                role=UserRole.USER,
                is_active=True,
                email_verified=False,
                is_guest=True
            )
            
            db.session.add(user)
            db.session.flush()
            
            user_created = True
        else:
            temp_password = None
            user_created = False
        
        # Procesar booking (similar a add_to_cart pero directo a PENDING)
        booking_data = data.get('booking_data', {})
        
        number_of_guests = int(booking_data['number_of_guests'])
        total_price = 0
        
        # Parsear fechas
        experience_date = None
        experience_time = None
        if booking_data.get('experience_date'):
            experience_date = datetime.strptime(booking_data['experience_date'], '%Y-%m-%d').date()
            if booking_data.get('experience_time'):
                experience_time = datetime.strptime(booking_data['experience_time'], '%H:%M').time()
        
        check_in = None
        check_out = None
        check_in_time = None
        check_out_time = None
        
        if booking_data.get('check_in') and booking_data.get('check_out'):
            check_in = datetime.strptime(booking_data['check_in'], '%Y-%m-%d').date()
            check_out = datetime.strptime(booking_data['check_out'], '%Y-%m-%d').date()
            
            if booking_data.get('check_in_time'):
                check_in_time = datetime.strptime(booking_data['check_in_time'], '%H:%M').time()
            if booking_data.get('check_out_time'):
                check_out_time = datetime.strptime(booking_data['check_out_time'], '%H:%M').time()
        
        # Validar experiencia
        experience = None
        if booking_data.get('experience_id'):
            experience = Experience.query.get(booking_data['experience_id'])
            if not experience or not experience.is_active:
                db.session.rollback()
                return jsonify({"error": "Invalid experience"}), 400
            total_price += experience.price * number_of_guests
        
        # Validar paquete
        package = None
        if booking_data.get('package_id'):
            package = Package.query.get(booking_data['package_id'])
            if not package or not package.is_active:
                db.session.rollback()
                return jsonify({"error": "Invalid package"}), 400
            total_price += package.price
        
        confirmation_number = Booking.generate_confirmation_number()
        
        booking = Booking(
            user_id=user.id,
            confirmation_number=confirmation_number,
            experience_id=booking_data.get('experience_id'),
            package_id=booking_data.get('package_id'),
            experience_date=experience_date,
            experience_time=experience_time,
            check_in=check_in,
            check_out=check_out,
            check_in_time=check_in_time,
            check_out_time=check_out_time,
            number_of_guests=number_of_guests,
            status=BookingStatus.PENDING,
            payment_status=PaymentStatus.PENDING,
            total_price=0,
            special_requests=booking_data.get('special_requests')
        )
        
        db.session.add(booking)
        db.session.flush()
        
        # Agregar habitaciones
        if booking_data.get('rooms') and check_in and check_out:
            nights = (check_out - check_in).days
            
            for room_data in booking_data['rooms']:
                room = Room.query.get(room_data['room_id'])
                if not room or not room.is_active:
                    db.session.rollback()
                    return jsonify({"error": f"Invalid room {room_data['room_id']}"}), 400
                
                room_price = room.price_per_night * nights
                total_price += room_price
                
                booking_room = BookingRoom(
                    booking_id=booking.id,
                    room_id=room.id,
                    check_in=check_in,
                    check_out=check_out,
                    nights=nights,
                    price=room_price
                )
                db.session.add(booking_room)
        
        # Agregar extras
        if booking_data.get('extras'):
            for extra_data in booking_data['extras']:
                extra = Extra.query.get(extra_data['extra_id'])
                if not extra or not extra.is_active:
                    db.session.rollback()
                    return jsonify({"error": f"Invalid extra {extra_data['extra_id']}"}), 400
                
                quantity = extra_data.get('quantity', 1)
                
                if extra.type == ExtraType.PER_BOOKING:
                    extra_price = extra.price
                else:
                    extra_price = extra.price * number_of_guests * quantity
                
                total_price += extra_price
                
                booking_extra = BookingExtra(
                    booking_id=booking.id,
                    extra_id=extra.id,
                    quantity=quantity,
                    price=extra_price
                )
                db.session.add(booking_extra)
        
        booking.total_price = total_price
        
        # Crear Payment Intent
        intent = stripe.PaymentIntent.create(
            amount=int(total_price * 100),
            currency='usd',
            metadata={
                'user_id': user.id,
                'booking_ids': str(booking.id),
                'is_guest': str(user_created)
            }
        )
        
        booking.stripe_payment_intent_id = intent.id
        booking.stripe_payment_status = intent.status
        booking.payment_status = PaymentStatus.PROCESSING
        
        db.session.commit()
        
        # Si se creó usuario nuevo, enviar email con credenciales
        if user_created and temp_password:
            send_guest_checkout_email(booking, temp_password)
        
        return jsonify({
            "message": "Guest checkout initiated",
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "booking": booking.serialize(),
            "user_created": user_created,
            "temporary_password": temp_password if user_created else None
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ============= CHECKOUT (USUARIO REGISTRADO) =============
@api.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    """Procesar checkout - convierte items del carrito a PENDING"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('booking_ids'):
        return jsonify({"error": "No booking IDs provided"}), 400
    
    booking_ids = data['booking_ids']
    
    bookings = Booking.query.filter(
        Booking.id.in_(booking_ids),
        Booking.user_id == user_id,
        Booking.status == BookingStatus.CART
    ).all()
    
    if not bookings:
        return jsonify({"error": "No valid cart items found"}), 404
    
    # Validar disponibilidad
    for booking in bookings:
        if booking.experience_id and booking.experience_date:
            confirmed_bookings = Booking.query.filter(
                Booking.experience_id == booking.experience_id,
                Booking.experience_date == booking.experience_date,
                Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
                Booking.id != booking.id
            ).all()
            
            booked_spots = sum([b.number_of_guests for b in confirmed_bookings])
            available_spots = booking.experience.max_capacity - booked_spots
            
            if available_spots < booking.number_of_guests:
                return jsonify({
                    "error": f"Experience '{booking.experience.name}' no longer has enough spots available"
                }), 400
        
        for booking_room in booking.rooms:
            current_date = booking_room.check_in
            while current_date < booking_room.check_out:
                existing = BookingRoom.query.join(Booking).filter(
                    BookingRoom.room_id == booking_room.room_id,
                    BookingRoom.check_in <= current_date,
                    BookingRoom.check_out > current_date,
                    Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
                    Booking.id != booking.id
                ).first()
                
                if existing:
                    return jsonify({
                        "error": f"Room '{booking_room.room.name}' is no longer available for selected dates"
                    }), 400
                
                current_date += timedelta(days=1)
    
    total_amount = sum([b.total_price for b in bookings])
    
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(total_amount * 100),
            currency='usd',
            metadata={
                'user_id': user_id,
                'booking_ids': ','.join([str(b.id) for b in bookings])
            }
        )
        
        for booking in bookings:
            booking.status = BookingStatus.PENDING
            booking.payment_status = PaymentStatus.PROCESSING
            booking.stripe_payment_intent_id = intent.id
            booking.stripe_payment_status = intent.status
            booking.cart_expires_at = None
        
        db.session.commit()
        
        return jsonify({
            "message": "Checkout initiated",
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "total_amount": total_amount,
            "bookings": [b.serialize() for b in bookings]
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ============= WEBHOOK STRIPE CON ENVÍO DE EMAILS =============
@api.route('/webhooks/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv('STRIPE_WEBHOOK_SECRET')
        )
    except ValueError:
        return jsonify({"error": "Invalid payload"}), 400
    except stripe.error.SignatureVerificationError:
        return jsonify({"error": "Invalid signature"}), 400
    
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        booking_ids = payment_intent['metadata']['booking_ids'].split(',')
        
        for booking_id in booking_ids:
            booking = Booking.query.get(int(booking_id))
            if booking:
                booking.payment_status = PaymentStatus.SUCCEEDED
                booking.status = BookingStatus.CONFIRMED
                booking.stripe_payment_status = payment_intent['status']
                
                # ENVIAR EMAIL DE CONFIRMACIÓN
                try:
                    send_booking_confirmation_email(booking)
                except Exception as e:
                    print(f"Error sending confirmation email: {str(e)}")
        
        db.session.commit()
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        booking_ids = payment_intent['metadata']['booking_ids'].split(',')
        
        for booking_id in booking_ids:
            booking = Booking.query.get(int(booking_id))
            if booking:
                booking.payment_status = PaymentStatus.FAILED
                booking.stripe_payment_status = payment_intent['status']
        
        db.session.commit()
    
    return jsonify({"success": True}), 200

# ============= BUSCAR RESERVA POR NÚMERO DE CONFIRMACIÓN =============
@api.route('/bookings/search/<confirmation_number>', methods=['GET'])
def search_booking_by_confirmation(confirmation_number):
    """
    Buscar reserva por número de confirmación (público)
    Query params: ?email=user@example.com
    """
    email = request.args.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    booking = Booking.query.join(User).filter(
        Booking.confirmation_number == confirmation_number.upper(),
        User.email == email.lower(),
        Booking.status != BookingStatus.CART
    ).first()
    
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    
    return jsonify(booking.serialize()), 200

# ============= RESERVAS (USUARIO LOGUEADO) =============
@api.route('/bookings/<int:booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    
    if booking.user_id != user_id and not user.is_admin():
        return jsonify({"error": "Unauthorized"}), 403
    
    return jsonify(booking.serialize()), 200

@api.route('/bookings/my-bookings', methods=['GET'])
@jwt_required()
def get_my_bookings():
    user_id = get_jwt_identity()
    
    bookings = Booking.query.filter(
        Booking.user_id == user_id,
        Booking.status != BookingStatus.CART
    ).order_by(Booking.created_at.desc()).all()
    
    return jsonify([booking.serialize() for booking in bookings]), 200

# ============= ADMIN ROUTES =============
@api.route('/admin/bookings', methods=['GET'])
@admin_required()
def admin_get_all_bookings():
    status = request.args.get('status')
    payment_status = request.args.get('payment_status')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Booking.query.filter(Booking.status != BookingStatus.CART)
    
    if status:
        query = query.filter_by(status=BookingStatus[status.upper()])
    
    if payment_status:
        query = query.filter_by(payment_status=PaymentStatus[payment_status.upper()])
    
    if start_date:
        start = datetime.strptime(start_date, '%Y-%m-%d').date()
        query = query.filter(Booking.created_at >= start)
    
    if end_date:
        end = datetime.strptime(end_date, '%Y-%m-%d').date()
        query = query.filter(Booking.created_at <= end)
    
    bookings = query.order_by(Booking.created_at.desc()).all()
    
    return jsonify([booking.serialize_admin() for booking in bookings]), 200

@api.route('/admin/bookings/<int:booking_id>', methods=['PUT'])
@admin_required()
def admin_update_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    
    data = request.get_json()
    
    if data.get('status'):
        booking.status = BookingStatus[data['status'].upper()]
    
    if data.get('payment_status'):
        booking.payment_status = PaymentStatus[data['payment_status'].upper()]
    
    if data.get('admin_notes'):
        booking.admin_notes = data['admin_notes']
    
    db.session.commit()
    
    return jsonify({
        "message": "Booking updated successfully",
        "booking": booking.serialize_admin()
    }), 200

@api.route('/admin/stats', methods=['GET'])
@admin_required()
def admin_get_stats():
    total_bookings = Booking.query.filter(Booking.status != BookingStatus.CART).count()
    confirmed_bookings = Booking.query.filter_by(status=BookingStatus.CONFIRMED).count()
    pending_bookings = Booking.query.filter_by(status=BookingStatus.PENDING).count()
    
    total_revenue = db.session.query(func.sum(Booking.total_price)).filter(
        Booking.payment_status == PaymentStatus.SUCCEEDED
    ).scalar() or 0
    
    return jsonify({
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "pending_bookings": pending_bookings,
        "total_revenue": float(total_revenue)
    }), 200

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend"
    }
    return jsonify(response_body), 200


@api.route('/test-email', methods=['POST'])
def test_email():
    """Endpoint para probar que el email funciona"""
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    html = """
    <html>
        <body style="font-family: Arial; padding: 20px;">
            <h1 style="color: #10B981;">🎉 Test Email Exitoso</h1>
            <p>Si ves este email, ¡tu configuración SMTP funciona perfectamente!</p>
            <p><strong>Tu sistema de emails de Celiafarm está listo.</strong></p>
        </body>
    </html>
    """
    
    try:
        from api.email_service import send_email
        success = send_email(
            recipient=email,
            subject="✅ Test Email - Celiafarm",
            html_body=html
        )
        
        if success:
            return jsonify({"message": f"Email enviado exitosamente a {email}"}), 200
        else:
            return jsonify({"error": "Error al enviar email"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Configurar Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

print(f"🔑 STRIPE KEY: {stripe.api_key[:20]}...")

@api.route('/create-checkout-session', methods=['POST', 'OPTIONS'])
def create_checkout_session():
    # Manejar preflight request
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        
        # Crear line items para Stripe
        line_items = []
        
        for item in data['items']:
            line_items.append({
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': item['name'],
                        'description': f"{item['type'].capitalize()} - CaliaFarm Booking",
                    },
                    'unit_amount': int(item['subtotal'] * 100),
                },
                'quantity': 1,
            })
        
        # Obtener URL del frontend
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        
        # Crear sesión de Stripe Checkout
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=f"{frontend_url}/confirmation?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/cart",
            customer_email=data.get('customer_email'),
            metadata={
                'customer_name': data.get('customer_name', ''),
                'customer_phone': data.get('customer_phone', ''),
                'total_items': str(len(data['items']))
            }
        )
        
        return jsonify({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id
        }), 200
        
    except stripe.StripeError as e:
        print(f"Stripe error: {str(e)}")
        return jsonify({'error': f'Stripe error: {str(e)}'}), 400
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 400


@api.route('/verify-payment', methods=['POST'])
def verify_payment():
    try:
        data = request.json
        session_id = data.get('session_id')
        
        if not session_id:
            return jsonify({'error': 'No session ID provided'}), 400
        
        # Verificar si ya existe una reserva con este session_id
        existing_booking = Booking.query.filter_by(stripe_payment_intent_id=session_id).first()
        if existing_booking:
            return jsonify(existing_booking.serialize()), 200
        
        # Recuperar la sesión de Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status != 'paid':
            return jsonify({'error': 'Payment not completed'}), 400
        
        # Generar número de confirmación
        confirmation_number = Booking.generate_confirmation_number()
        
        # Recuperar metadata
        metadata = session.metadata
        
        # Obtener o crear usuario guest
        customer_email = session.customer_details.email if hasattr(session, 'customer_details') else session.customer_email
        user = User.query.filter_by(email=customer_email).first()
        
        if not user:
            # Crear usuario guest
            user = User(
                email=customer_email,
                name=metadata.get('customer_name', 'Guest'),
                phone=metadata.get('customer_phone'),
                is_guest=True,
                email_verified=False,
                password=None  # Guest users don't have password
            )
            db.session.add(user)
            db.session.flush()  # Para obtener el user_id
        
        # Crear la reserva con los campos correctos de tu modelo
        booking = Booking(
            confirmation_number=confirmation_number,
            user_id=user.id,  # REQUERIDO según tu modelo
            number_of_guests=int(metadata.get('guests', 1)),
            total_price=session.amount_total / 100,
            payment_status=PaymentStatus.SUCCEEDED,
            stripe_payment_intent_id=session_id,  # Campo correcto
            stripe_payment_status='paid',
            status=BookingStatus.CONFIRMED,
            special_requests=metadata.get('special_requests')
        )
        
        db.session.add(booking)
        db.session.commit()
        
        # Preparar datos para el email
        booking_data = {
            'booking_number': confirmation_number,
            'customer_email': user.email,
            'customer_name': user.name,
            'customer_phone': user.phone,
            'total_amount': booking.total_price,
            'payment_status': 'paid',
            'created_at': booking.created_at.isoformat(),
            'items': []
        }
        
        # Enviar email de confirmación
        try:
            send_booking_confirmation_email(booking_data)
            
            # Registrar el envío del email
            email_log = EmailLog(
                booking_id=booking.id,
                email_type='booking_confirmation',
                recipient_email=user.email,
                subject=f'Confirmación de Reserva {confirmation_number}',
                status=EmailStatus.SENT,
                sent_at=datetime.utcnow()
            )
            db.session.add(email_log)
            db.session.commit()
        except Exception as e:
            print(f"Error sending confirmation email: {str(e)}")
            # Registrar el error del email
            email_log = EmailLog(
                booking_id=booking.id,
                email_type='booking_confirmation',
                recipient_email=user.email,
                subject=f'Confirmación de Reserva {confirmation_number}',
                status=EmailStatus.FAILED,
                error_message=str(e)
            )
            db.session.add(email_log)
            db.session.commit()
        
        return jsonify(booking.serialize()), 200
        
    except stripe.StripeError as e:
        db.session.rollback()
        print(f"Stripe error: {str(e)}")
        return jsonify({'error': f'Stripe error: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error verifying payment: {str(e)}")
        return jsonify({'error': str(e)}), 400

    # Manejar preflight request
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        
        # Crear line items para Stripe
        line_items = []
        
        for item in data['items']:
            line_items.append({
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': item['name'],
                        'description': f"{item['type'].capitalize()} - CaliaFarm Booking",
                    },
                    'unit_amount': int(item['subtotal'] * 100),
                },
                'quantity': 1,
            })
        
        # Obtener URL del frontend
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        
        # Crear sesión de Stripe Checkout
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=f"{frontend_url}/confirmation?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/cart",
            customer_email=data.get('customer_email'),
            metadata={
                'customer_name': data.get('customer_name', ''),
                'customer_phone': data.get('customer_phone', ''),
                'total_items': str(len(data['items']))
            }
        )
        
        return jsonify({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id
        }), 200
        
    except stripe.StripeError as e:
        print(f"Stripe error: {str(e)}")
        return jsonify({'error': f'Stripe error: {str(e)}'}), 400
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        
        line_items = []
        
        for item in data['items']:
            line_items.append({
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': item['name'],
                        'description': f"{item['type'].capitalize()} - CaliaFarm Booking",
                    },
                    'unit_amount': int(item['subtotal'] * 100),
                },
                'quantity': 1,
            })
        
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=f"{frontend_url}/confirmation?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/cart",
            customer_email=data.get('customer_email'),
            metadata={
                'customer_name': data.get('customer_name', ''),
                'customer_phone': data.get('customer_phone', ''),
                'total_items': str(len(data['items']))
            }
        )
        
        return jsonify({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id
        }), 200
        
    except stripe.StripeError as e:  # 👈 CAMBIAR AQUÍ
        print(f"Stripe error: {str(e)}")
        return jsonify({'error': f'Stripe error: {str(e)}'}), 400
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        
        line_items = []
        
        for item in data['items']:
            line_items.append({
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': item['name'],
                        'description': f"{item['type'].capitalize()} - CaliaFarm Booking",
                    },
                    'unit_amount': int(item['subtotal'] * 100),
                },
                'quantity': 1,
            })
        
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=f"{frontend_url}/confirmation?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/cart",
            customer_email=data.get('customer_email'),
            metadata={
                'customer_name': data.get('customer_name', ''),
                'customer_phone': data.get('customer_phone', ''),
                'total_items': str(len(data['items']))
            }
        )
        
        return jsonify({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id
        }), 200
        
    except stripe.StripeError as e:  # 👈 CAMBIAR AQUÍ
        print(f"Stripe error: {str(e)}")
        return jsonify({'error': f'Stripe error: {str(e)}'}), 400
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    try:
        data = request.json
        
        # Crear line items para Stripe
        line_items = []
        
        for item in data['items']:
            line_items.append({
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': item['name'],
                        'description': f"{item['type'].capitalize()} - CaliaFarm Booking",
                    },
                    'unit_amount': int(item['subtotal'] * 100),  # Stripe usa centavos
                },
                'quantity': 1,
            })
        
        # Obtener URL del frontend
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        
        # Crear sesión de Stripe Checkout
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=f"{frontend_url}/confirmation?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/cart",
            customer_email=data.get('customer_email'),
            metadata={
                'customer_name': data.get('customer_name', ''),
                'customer_phone': data.get('customer_phone', ''),
                'total_items': str(len(data['items']))
            }
        )
        
        return jsonify({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id
        }), 200
        
    except stripe.error.StripeError as e:
        print(f"Stripe error: {str(e)}")
        return jsonify({'error': f'Stripe error: {str(e)}'}), 400
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 400        